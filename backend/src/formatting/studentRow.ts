import { countryNameFromCode } from "../data/geoReference.js";
import type { ClassRoom, Student } from "../models/index.js";
import { safeLocaleDate } from "./localeDate.js";

export type StudentApiRow = {
  id: number;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string | null;
  /** DD/MM/YYYY for display */
  dateOfBirthFormatted: string | null;
  parentEmail: string | null;
  classRoomId: number | null;
  className: string | null;
  gender: string | null;
  rollNumber: string | null;
  sectionName: string | null;
  admittedAt: string;
  hasPassportPhoto: boolean;
  nationality: string | null;
  countryCode: string | null;
  countryName: string | null;
  district: string | null;
  /** `first` | `continuing` */
  registrationType: string;
  previousSchool: string | null;
};

function resolveCreatedAt(s: Student): Date | string | undefined {
  return (
    s.createdAt ??
    (s.get("created_at") as Date | string | undefined) ??
    (s.getDataValue("created_at") as Date | string | undefined)
  );
}

export function studentToApiRow(s: Student): StudentApiRow {
  const cr = s.get("classRoom") as ClassRoom | null | undefined;
  const fn = s.passportPhotoFilename ?? (s.get("passport_photo_filename") as string | null | undefined);
  const cc =
    s.countryCode ?? (s.get("country_code") as string | null | undefined) ?? null;
  const reg =
    s.registrationType ?? (s.get("registration_type") as string | undefined) ?? "first";
  return {
    id: s.id,
    admissionNumber: s.admissionNumber,
    firstName: s.firstName,
    lastName: s.lastName,
    fullName: `${s.firstName} ${s.lastName}`.trim(),
    dateOfBirth: s.dateOfBirth ?? null,
    dateOfBirthFormatted: s.dateOfBirth ? safeLocaleDate(s.dateOfBirth) : null,
    parentEmail: s.parentEmail ?? null,
    classRoomId: s.classRoomId ?? null,
    className: cr?.name ?? null,
    gender: s.gender ?? null,
    rollNumber: s.rollNumber ?? null,
    sectionName: s.sectionName ?? null,
    admittedAt: safeLocaleDate(resolveCreatedAt(s)),
    hasPassportPhoto: Boolean(fn && String(fn).trim() !== ""),
    nationality: s.nationality ?? null,
    countryCode: cc,
    countryName: countryNameFromCode(cc),
    district: s.district ?? null,
    registrationType: reg,
    previousSchool: s.previousSchool ?? null,
  };
}
