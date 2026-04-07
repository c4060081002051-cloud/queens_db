import { randomUUID } from "node:crypto";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { Op, Sequelize, type WhereOptions } from "sequelize";
import {
  districtAllowedForCountry,
  isKnownCountryCode,
} from "../data/geoReference.js";
import { parseQueryToIsoDate } from "../formatting/localeDate.js";
import { studentToApiRow } from "../formatting/studentRow.js";
import { ClassRoom, Student } from "../models/index.js";

function studentUploadDir(): string {
  return path.join(process.cwd(), "uploads", "students");
}

/** Express types use a literal key when the path segment is `:id(\\d+)` */
function paramId(req: { params: Record<string, string | string[] | undefined> }): number {
  const p = req.params;
  const pick = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;
  const raw =
    pick(p["id"]) ??
    pick(p["id(\\d+)"]) ??
    Object.values(p)
      .map(pick)
      .find((v) => v && /^\d+$/.test(v));
  return Number.parseInt(String(raw ?? ""), 10);
}

function sanitizeLikeFragment(s: string): string {
  return s.replace(/\\/g, "").replace(/%/g, "").replace(/_/g, "");
}

function trimStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}

function parseOptionalId(v: unknown): number | null | undefined {
  if (v === null) return null;
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}

function normalizeCountryCode(v: unknown): string | null | undefined {
  if (v === null) return null;
  if (v === undefined || v === "") return undefined;
  const t = String(v).trim().toUpperCase();
  if (t.length < 2 || t.length > 10) return undefined;
  return t;
}

function parseRegistrationType(v: unknown): "first" | "continuing" | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).toLowerCase();
  if (s === "continuing" || s === "transfer") return "continuing";
  if (s === "first" || s === "first_registration" || s === "new") return "first";
  return undefined;
}

async function unlinkStudentPhoto(
  uploadDir: string,
  filename: string | null | undefined,
): Promise<void> {
  if (!filename || /[/\\]|\.\./.test(filename)) return;
  try {
    await fs.unlink(path.join(uploadDir, filename));
  } catch {
    /* ignore */
  }
}

function tempAdmissionKey(): string {
  const hex = randomUUID().replace(/-/g, "");
  return `T${hex}`.slice(0, 50);
}

async function createStudentRecord(fields: {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  parentEmail: string | null;
  gender: string | null;
  rollNumber: string | null;
  sectionName: string | null;
  classRoomId: number | null;
  nationality: string | null;
  countryCode: string | null;
  district: string | null;
  registrationType: "first" | "continuing";
  previousSchool: string | null;
}): Promise<Student> {
  const created = await Student.create({
    admissionNumber: tempAdmissionKey(),
    firstName: fields.firstName,
    lastName: fields.lastName,
    dateOfBirth: fields.dateOfBirth,
    parentEmail: fields.parentEmail,
    classRoomId: fields.classRoomId,
    gender: fields.gender,
    rollNumber: fields.rollNumber,
    sectionName: fields.sectionName,
    nationality: fields.nationality,
    countryCode: fields.countryCode,
    district: fields.district,
    registrationType: fields.registrationType,
    previousSchool: fields.previousSchool,
  });
  const year = new Date().getFullYear();
  await created.update({
    admissionNumber: `ADM-${year}-${String(created.id).padStart(5, "0")}`,
  });
  return created;
}

function normalizeCsvHeader(h: string): string {
  return h.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/\s+/g, "");
}

function parseCsvRecords(buf: Buffer): Record<string, string>[] {
  const text = buf.toString("utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(normalizeCsvHeader);
  const out: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = cols[j] ?? "";
    });
    out.push(row);
  }
  return out;
}

function csvVal(row: Record<string, string>, ...aliases: string[]): string {
  for (const a of aliases) {
    const v = row[a]?.trim();
    if (v) return v;
  }
  return "";
}

export function createMeStudentsRouter() {
  const r = Router();
  const uploadDir = studentUploadDir();

  const bulkParser = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok =
        file.mimetype === "text/csv" ||
        file.mimetype === "application/vnd.ms-excel" ||
        /\.csv$/i.test(file.originalname);
      cb(null, Boolean(ok));
    },
  });

  const photoUpload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        fsSync.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const id = String(paramId(req));
        const raw = path.extname(file.originalname).slice(0, 8) || ".jpg";
        const ext = /^\.[a-z0-9]+$/i.test(raw) ? raw.toLowerCase() : ".jpg";
        cb(null, `${id}-${Date.now()}${ext}`);
      },
    }),
    limits: { fileSize: 4 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
      cb(null, ok);
    },
  });

  r.get("/classrooms", async (_req, res) => {
    try {
      const rows = await ClassRoom.findAll({
        order: [
          ["academicYear", "DESC"],
          ["name", "ASC"],
        ],
      });
      return res.json({
        items: rows.map((c) => ({
          id: c.id,
          name: c.name,
          gradeLevel: c.gradeLevel ?? null,
          academicYear: c.academicYear,
        })),
      });
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: "Database unavailable" });
    }
  });

  r.post("/students/bulk", bulkParser.single("file"), async (req, res) => {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ error: "CSV file required (field: file)" });
      }
      const records = parseCsvRecords(req.file.buffer);
      if (records.length === 0) {
        return res.status(400).json({ error: "CSV has no data rows" });
      }
      const errors: { line: number; error: string }[] = [];
      let created = 0;
      let lineNo = 1;
      for (const row of records) {
        lineNo += 1;
        const firstName = csvVal(row, "firstname", "first_name", "first");
        const lastName = csvVal(row, "lastname", "last_name", "last");
        if (!firstName || !lastName) {
          errors.push({ line: lineNo, error: "firstName and lastName required" });
          continue;
        }
        const dobRaw = csvVal(row, "dateofbirth", "date_of_birth", "dob", "birthdate");
        let dob: string | null = null;
        if (dobRaw) {
          const iso = parseQueryToIsoDate(dobRaw) ?? dobRaw;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
            errors.push({ line: lineNo, error: "Invalid dateOfBirth" });
            continue;
          }
          dob = iso;
        }
        const parentEmail = csvVal(row, "parentemail", "parent_email", "email") || null;
        const gender = csvVal(row, "gender") || null;
        const rollNumber = csvVal(row, "rollnumber", "roll_number", "roll") || null;
        const sectionName = csvVal(row, "sectionname", "section_name", "section") || null;
        const classIdStr = csvVal(row, "classroomid", "class_room_id", "classid", "class_id");
        let classRoomId: number | null = null;
        if (classIdStr) {
          const n = Number.parseInt(classIdStr, 10);
          if (!Number.isFinite(n) || n < 1) {
            errors.push({ line: lineNo, error: "Invalid classRoomId" });
            continue;
          }
          const cr = await ClassRoom.findByPk(n);
          if (!cr) {
            errors.push({ line: lineNo, error: "classRoomId not found" });
            continue;
          }
          classRoomId = n;
        }
        const nationality = csvVal(row, "nationality") || null;
        const ccRaw = csvVal(row, "countrycode", "country_code");
        let countryCode: string | null = null;
        if (ccRaw) {
          const n = normalizeCountryCode(ccRaw);
          if (!n || !isKnownCountryCode(n)) {
            errors.push({ line: lineNo, error: "Invalid countryCode" });
            continue;
          }
          countryCode = n;
        }
        const district = csvVal(row, "district") || null;
        const regType = parseRegistrationType(csvVal(row, "registrationtype", "registration_type")) ?? "first";
        const previousSchool = csvVal(row, "previousschool", "previous_school") || null;
        if (regType === "continuing" && !previousSchool) {
          errors.push({
            line: lineNo,
            error: "previousSchool required when registrationType is continuing",
          });
          continue;
        }
        if (district && countryCode && countryCode !== "OTHER") {
          if (!districtAllowedForCountry(countryCode, district)) {
            errors.push({ line: lineNo, error: "District does not match country" });
            continue;
          }
        }
        if (district && !countryCode) {
          errors.push({ line: lineNo, error: "countryCode required when district is set" });
          continue;
        }
        try {
          await createStudentRecord({
            firstName: firstName.slice(0, 100),
            lastName: lastName.slice(0, 100),
            dateOfBirth: dob,
            parentEmail: parentEmail ? parentEmail.slice(0, 255) : null,
            gender: gender ? gender.slice(0, 20) : null,
            rollNumber: rollNumber ? rollNumber.slice(0, 32) : null,
            sectionName: sectionName ? sectionName.slice(0, 80) : null,
            classRoomId,
            nationality: nationality ? nationality.slice(0, 100) : null,
            countryCode,
            district: district ? district.slice(0, 120) : null,
            registrationType: regType,
            previousSchool: previousSchool ? previousSchool.slice(0, 200) : null,
          });
          created += 1;
        } catch (e) {
          errors.push({
            line: lineNo,
            error: (e as Error)?.message ?? "Create failed",
          });
        }
      }
      return res.status(201).json({ created, errors });
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: "Database unavailable" });
    }
  });

  r.get("/students", async (req, res) => {
    try {
      const qRaw = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const sortKey = req.query.sortBy;
      const sortDir = req.query.sortDir === "asc" ? "ASC" : "DESC";
      const lim = Number.parseInt(String(req.query.limit ?? "100"), 10);
      const limit = Number.isFinite(lim)
        ? Math.min(500, Math.max(1, lim))
        : 100;

      let order: unknown[];
      if (sortKey === "id") {
        order = [["id", sortDir]];
      } else if (sortKey === "name") {
        order = [
          ["last_name", sortDir],
          ["first_name", sortDir],
        ];
      } else if (sortKey === "class") {
        order = [
          [{ model: ClassRoom, as: "classRoom" }, "name", sortDir],
          ["last_name", "ASC"],
          ["first_name", "ASC"],
        ];
      } else {
        order = [["created_at", sortDir]];
      }

      let where: WhereOptions<Student> = {};
      if (qRaw.length > 0) {
        const simple = sanitizeLikeFragment(qRaw);
        const isoDob = parseQueryToIsoDate(qRaw);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const or: any[] = [];
        if (simple.length > 0) {
          const pattern = { [Op.like]: `%${simple}%` };
          or.push(
            { admission_number: pattern },
            { first_name: pattern },
            { last_name: pattern },
            { parent_email: pattern },
            { roll_number: pattern },
            { section_name: pattern },
            { nationality: pattern },
            { district: pattern },
            { previous_school: pattern },
            { country_code: pattern },
            Sequelize.where(
              Sequelize.fn(
                "CONCAT",
                Sequelize.col("first_name"),
                " ",
                Sequelize.col("last_name"),
              ),
              Op.like,
              `%${simple}%`,
            ),
          );
        }
        if (isoDob) {
          or.push({ date_of_birth: isoDob });
        }
        if (or.length === 0) {
          return res.json({ items: [] });
        }
        where = { [Op.or]: or };
      }

      const rows = await Student.findAll({
        where,
        include: [{ model: ClassRoom, as: "classRoom", required: false }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        order: order as any,
        limit,
      });

      return res.json({ items: rows.map(studentToApiRow) });
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: "Database unavailable" });
    }
  });

  r.get("/students/:id(\\d+)", async (req, res) => {
    try {
      const id = paramId(req);
      if (!Number.isFinite(id) || id < 1) return res.status(400).json({ error: "Invalid id" });
      const row = await Student.findByPk(id, {
        include: [{ model: ClassRoom, as: "classRoom", required: false }],
      });
      if (!row) return res.status(404).json({ error: "Not found" });
      return res.json({ item: studentToApiRow(row) });
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: "Database unavailable" });
    }
  });

  r.get("/students/:id(\\d+)/photo", async (req, res) => {
    try {
      const id = paramId(req);
      if (!Number.isFinite(id) || id < 1) return res.status(400).end();
      const row = await Student.findByPk(id);
      if (!row) return res.status(404).end();
      const fn =
        row.passportPhotoFilename ??
        (row.get("passport_photo_filename") as string | null);
      if (!fn || /[/\\]|\.\./.test(fn)) return res.status(404).end();
      const abs = path.join(uploadDir, fn);
      res.sendFile(abs, (err) => {
        if (err && !res.headersSent) res.status(404).end();
      });
    } catch (err) {
      console.error(err);
      res.status(503).end();
    }
  });

  r.post("/students", async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const firstName = trimStr(body.firstName, 100);
      const lastName = trimStr(body.lastName, 100);
      if (!firstName || !lastName) {
        return res.status(400).json({
          error: "firstName and lastName are required",
        });
      }

      const dateOfBirth = trimStr(body.dateOfBirth, 32);
      const parentEmail = trimStr(body.parentEmail, 255);
      const gender = trimStr(body.gender, 20);
      const rollNumber = trimStr(body.rollNumber, 32);
      const sectionName = trimStr(body.sectionName, 80);
      const classRoomId = parseOptionalId(body.classRoomId);
      const nationality = trimStr(body.nationality, 100);
      const district = trimStr(body.district, 120);
      const previousSchool = trimStr(body.previousSchool, 200);
      const countryCodeNorm = normalizeCountryCode(body.countryCode);
      const regType = parseRegistrationType(body.registrationType) ?? "first";

      if (countryCodeNorm !== undefined && countryCodeNorm !== null) {
        if (!isKnownCountryCode(countryCodeNorm)) {
          return res.status(400).json({ error: "Invalid countryCode" });
        }
      }
      if (district && !countryCodeNorm) {
        return res.status(400).json({ error: "countryCode is required when district is set" });
      }
      if (
        district &&
        countryCodeNorm &&
        countryCodeNorm !== "OTHER" &&
        !districtAllowedForCountry(countryCodeNorm, district)
      ) {
        return res.status(400).json({ error: "District does not match selected country" });
      }
      if (regType === "continuing" && !previousSchool) {
        return res.status(400).json({
          error: "previousSchool is required for continuing students",
        });
      }

      if (classRoomId !== undefined && classRoomId !== null) {
        const cr = await ClassRoom.findByPk(classRoomId);
        if (!cr) {
          return res.status(400).json({ error: "Invalid classRoomId" });
        }
      }

      let dob: string | null = null;
      if (dateOfBirth) {
        const iso = parseQueryToIsoDate(dateOfBirth) ?? dateOfBirth;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          return res.status(400).json({ error: "Invalid dateOfBirth" });
        }
        dob = iso;
      }

      const created = await createStudentRecord({
        firstName,
        lastName,
        dateOfBirth: dob,
        parentEmail,
        classRoomId: classRoomId ?? null,
        gender,
        rollNumber,
        sectionName,
        nationality,
        countryCode: countryCodeNorm ?? null,
        district,
        registrationType: regType,
        previousSchool: regType === "continuing" ? previousSchool : null,
      });

      const withRoom = await Student.findByPk(created.id, {
        include: [{ model: ClassRoom, as: "classRoom", required: false }],
      });

      return res.status(201).json({
        item: withRoom ? studentToApiRow(withRoom) : studentToApiRow(created),
      });
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: "Database unavailable" });
    }
  });

  r.patch("/students/:id(\\d+)", async (req, res) => {
    try {
      const id = paramId(req);
      if (!Number.isFinite(id) || id < 1) return res.status(400).json({ error: "Invalid id" });
      const row = await Student.findByPk(id);
      if (!row) return res.status(404).json({ error: "Not found" });

      const body = req.body as Record<string, unknown>;
      const firstName = trimStr(body.firstName, 100);
      const lastName = trimStr(body.lastName, 100);
      if (body.firstName !== undefined && !firstName) {
        return res.status(400).json({ error: "firstName cannot be empty" });
      }
      if (body.lastName !== undefined && !lastName) {
        return res.status(400).json({ error: "lastName cannot be empty" });
      }

      const dateOfBirth = trimStr(body.dateOfBirth, 32);
      const parentEmail =
        body.parentEmail === null
          ? null
          : body.parentEmail !== undefined
            ? trimStr(body.parentEmail, 255)
            : undefined;
      const gender =
        body.gender === null ? null : body.gender !== undefined ? trimStr(body.gender, 20) : undefined;
      const rollNumber =
        body.rollNumber === null
          ? null
          : body.rollNumber !== undefined
            ? trimStr(body.rollNumber, 32)
            : undefined;
      const sectionName =
        body.sectionName === null
          ? null
          : body.sectionName !== undefined
            ? trimStr(body.sectionName, 80)
            : undefined;

      const nationality =
        body.nationality === null
          ? null
          : body.nationality !== undefined
            ? trimStr(body.nationality, 100)
            : undefined;
      const district =
        body.district === null
          ? null
          : body.district !== undefined
            ? trimStr(body.district, 120)
            : undefined;
      const previousSchoolPatch =
        body.previousSchool === null
          ? null
          : body.previousSchool !== undefined
            ? trimStr(body.previousSchool, 200)
            : undefined;

      let countryPatch: string | null | undefined;
      if (body.countryCode === null) countryPatch = null;
      else if (body.countryCode !== undefined) {
        const n = normalizeCountryCode(body.countryCode);
        if (n == null || !isKnownCountryCode(n)) {
          return res.status(400).json({ error: "Invalid countryCode" });
        }
        countryPatch = n;
      }

      const regPatch = parseRegistrationType(body.registrationType);

      const classParsed = parseOptionalId(body.classRoomId);
      if (classParsed !== undefined && classParsed !== null) {
        const cr = await ClassRoom.findByPk(classParsed);
        if (!cr) return res.status(400).json({ error: "Invalid classRoomId" });
      }

      let dobUpdate: string | null | undefined;
      if (body.dateOfBirth === null) dobUpdate = null;
      else if (dateOfBirth) {
        const iso = parseQueryToIsoDate(dateOfBirth) ?? dateOfBirth;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          return res.status(400).json({ error: "Invalid dateOfBirth" });
        }
        dobUpdate = iso;
      } else if (body.dateOfBirth !== undefined) {
        dobUpdate = null;
      }

      const nextReg: "first" | "continuing" =
        regPatch ?? (row.registrationType === "continuing" ? "continuing" : "first");
      const nextCountry =
        countryPatch !== undefined ? countryPatch : row.countryCode ?? null;
      const nextDistrict =
        district !== undefined ? district : row.district ?? null;
      const nextPrev =
        regPatch === "first"
          ? null
          : previousSchoolPatch !== undefined
            ? previousSchoolPatch
            : row.previousSchool ?? null;

      if (nextDistrict && !nextCountry) {
        return res.status(400).json({ error: "countryCode is required when district is set" });
      }
      if (
        nextDistrict &&
        nextCountry &&
        nextCountry !== "OTHER" &&
        !districtAllowedForCountry(nextCountry, nextDistrict)
      ) {
        return res.status(400).json({ error: "District does not match selected country" });
      }
      if (nextReg === "continuing" && !(nextPrev && String(nextPrev).trim())) {
        return res.status(400).json({
          error: "previousSchool is required for continuing students",
        });
      }

      await row.update({
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(dobUpdate !== undefined ? { dateOfBirth: dobUpdate } : {}),
        ...(parentEmail !== undefined ? { parentEmail } : {}),
        ...(gender !== undefined ? { gender } : {}),
        ...(rollNumber !== undefined ? { rollNumber } : {}),
        ...(sectionName !== undefined ? { sectionName } : {}),
        ...(classParsed !== undefined ? { classRoomId: classParsed } : {}),
        ...(nationality !== undefined ? { nationality } : {}),
        ...(countryPatch !== undefined ? { countryCode: countryPatch } : {}),
        ...(district !== undefined ? { district } : {}),
        ...(regPatch !== undefined ? { registrationType: regPatch } : {}),
        ...(regPatch === "first" || previousSchoolPatch !== undefined
          ? { previousSchool: nextPrev }
          : {}),
      });

      const withRoom = await Student.findByPk(id, {
        include: [{ model: ClassRoom, as: "classRoom", required: false }],
      });
      return res.json({ item: studentToApiRow(withRoom!) });
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: "Database unavailable" });
    }
  });

  r.delete("/students/:id(\\d+)", async (req, res) => {
    try {
      const id = paramId(req);
      if (!Number.isFinite(id) || id < 1) return res.status(400).json({ error: "Invalid id" });
      const row = await Student.findByPk(id);
      if (!row) return res.status(404).json({ error: "Not found" });
      const fn =
        row.passportPhotoFilename ??
        (row.get("passport_photo_filename") as string | null);
      await unlinkStudentPhoto(uploadDir, fn);
      await row.destroy();
      return res.status(204).end();
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: "Database unavailable" });
    }
  });

  r.post(
    "/students/:id(\\d+)/photo",
    (req, res, next) => {
      fsSync.mkdirSync(uploadDir, { recursive: true });
      next();
    },
    photoUpload.single("photo"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Image file required (field: photo)" });
        }
        const id = paramId(req);
        if (!Number.isFinite(id) || id < 1) {
          await fs.unlink(req.file.path).catch(() => {});
          return res.status(400).json({ error: "Invalid id" });
        }
        const row = await Student.findByPk(id);
        if (!row) {
          await fs.unlink(req.file.path).catch(() => {});
          return res.status(404).json({ error: "Not found" });
        }
        const prev =
          row.passportPhotoFilename ??
          (row.get("passport_photo_filename") as string | null);
        await unlinkStudentPhoto(uploadDir, prev);
        const savedName = req.file.filename;
        if (!savedName) {
          return res.status(500).json({ error: "Upload failed" });
        }
        await row.update({ passportPhotoFilename: savedName });
        const withRoom = await Student.findByPk(id, {
          include: [{ model: ClassRoom, as: "classRoom", required: false }],
        });
        return res.json({ item: studentToApiRow(withRoom!) });
      } catch (err) {
        console.error(err);
        return res.status(503).json({ error: "Database unavailable" });
      }
    },
  );

  return r;
}
