import { useEffect, useState } from "react";
import {
  fetchCountries,
  fetchDistricts,
  fetchNationalities,
  type CountryOption,
} from "../../api/geo";
import {
  createStudent,
  fetchClassrooms,
  uploadStudentPhoto,
  type ClassRoomOption,
} from "../../api/students";
import { useI18n } from "../../i18n/I18nProvider";

type NewAdmissionFormProps = {
  onCreated: () => void;
};

const fieldClass =
  "w-full rounded-lg border border-[#e0d8cc] bg-[#faf9f7] px-3 py-2 text-sm text-[#2d3436] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06)] outline-none focus:border-[#6a9570]/60 placeholder:text-[#636e72]/70";

export function NewAdmissionForm({ onCreated }: NewAdmissionFormProps) {
  const { t } = useI18n();
  const [rooms, setRooms] = useState<ClassRoomOption[]>([]);
  const [loadRoomsError, setLoadRoomsError] = useState<string | null>(null);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [gender, setGender] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [classRoomId, setClassRoomId] = useState("");
  const [nationality, setNationality] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [district, setDistrict] = useState("");
  const [registrationType, setRegistrationType] = useState<"first" | "continuing">("first");
  const [previousSchool, setPreviousSchool] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchClassrooms()
      .then((list) => {
        if (!cancelled) setRooms(list);
      })
      .catch(() => {
        if (!cancelled) setLoadRoomsError(t("students.form.classroomsError"));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchNationalities(), fetchCountries()])
      .then(([nat, ctry]) => {
        if (!cancelled) {
          setGeoError(null);
          setNationalities(nat);
          setCountries(ctry);
        }
      })
      .catch(() => {
        if (!cancelled) setGeoError(t("students.form.geoLoadError"));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, []);

  useEffect(() => {
    const code = countryCode.trim();
    if (!code) {
      setDistricts([]);
      setDistrict("");
      return;
    }
    let cancelled = false;
    setDistrictsLoading(true);
    void fetchDistricts(code)
      .then((list) => {
        if (!cancelled) {
          setGeoError(null);
          setDistricts(list);
          setDistrict((d) => (d && list.includes(d) ? d : ""));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDistricts([]);
          setDistrict("");
          setGeoError(t("students.form.geoLoadError"));
        }
      })
      .finally(() => {
        if (!cancelled) setDistrictsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [countryCode, t]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setParentEmail("");
    setGender("");
    setRollNumber("");
    setSectionName("");
    setClassRoomId("");
    setNationality("");
    setCountryCode("");
    setDistrict("");
    setDistricts([]);
    setRegistrationType("first");
    setPreviousSchool("");
    setPhotoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);
    try {
      const cr =
        classRoomId.trim() === "" ? undefined : Number.parseInt(classRoomId, 10);
      const cc = countryCode.trim();
      const dist = district.trim();
      const created = await createStudent({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim() || undefined,
        parentEmail: parentEmail.trim() || undefined,
        classRoomId: Number.isFinite(cr) && cr! > 0 ? cr : undefined,
        gender: gender.trim() || undefined,
        rollNumber: rollNumber.trim() || undefined,
        sectionName: sectionName.trim() || undefined,
        nationality: nationality.trim() || undefined,
        countryCode: cc ? cc : undefined,
        district: dist || undefined,
        registrationType,
        previousSchool:
          registrationType === "continuing" ? previousSchool.trim() : undefined,
      });
      if (photoFile) {
        try {
          await uploadStudentPhoto(created.id, photoFile);
        } catch {
          setFormSuccess(
            `${t("students.form.success")} ${t("students.photo.uploadLaterHint")}`,
          );
          resetForm();
          onCreated();
          return;
        }
      }
      setFormSuccess(
        `${t("students.form.success")} (${t("students.form.admissionNumberLabel")}: ${created.admissionNumber})`,
      );
      resetForm();
      onCreated();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("students.form.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#ebe4d9] bg-[#fffcf7] shadow-[6px_8px_24px_rgba(45,52,54,0.08)]">
      <div className="border-b border-[#ebe4d9] bg-gradient-to-r from-[#f8f9f6] to-[#e8f4e9] px-5 py-4">
        <h2 className="text-base font-bold text-[#2d3436]">{t("students.form.title")}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {geoError ? (
          <p className="text-sm text-amber-800" role="status">
            {geoError}
          </p>
        ) : null}
        {loadRoomsError ? (
          <p className="text-sm text-amber-800" role="status">
            {loadRoomsError}
          </p>
        ) : null}
        {formError ? (
          <p className="text-sm text-rose-800" role="alert">
            {formError}
          </p>
        ) : null}
        {formSuccess ? (
          <p className="text-sm text-emerald-800" role="status">
            {formSuccess}
          </p>
        ) : null}
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block min-w-0 text-xs font-semibold text-[#636e72]">
            {t("students.form.registrationType")} *
            <select
              required
              value={registrationType}
              onChange={(e) => {
                const v = e.target.value as "first" | "continuing";
                setRegistrationType(v);
                if (v === "first") setPreviousSchool("");
              }}
              className={`${fieldClass} mt-1`}
            >
              <option value="first">{t("students.form.registrationFirst")}</option>
              <option value="continuing">{t("students.form.registrationContinuing")}</option>
            </select>
          </label>
          {registrationType === "continuing" ? (
            <label className="block min-w-0 text-xs font-semibold text-[#636e72] sm:col-span-2 lg:col-span-2">
              {t("students.form.previousSchool")} *
              <input
                required
                value={previousSchool}
                onChange={(e) => setPreviousSchool(e.target.value)}
                className={`${fieldClass} mt-1`}
                autoComplete="organization"
              />
            </label>
          ) : null}
          <label className="block min-w-0 text-xs font-semibold text-[#636e72]">
            {t("students.form.nationality")}
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className={`${fieldClass} mt-1`}
            >
              <option value="">{t("students.form.nationalityUnset")}</option>
              {nationalities.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0 text-xs font-semibold text-[#636e72]">
            {t("students.form.country")}
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setDistrict("");
              }}
              className={`${fieldClass} mt-1`}
            >
              <option value="">{t("students.form.countryUnset")}</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0 text-xs font-semibold text-[#636e72]">
            {t("students.form.district")}
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!countryCode.trim() || districtsLoading}
              className={`${fieldClass} mt-1 disabled:opacity-60`}
            >
              <option value="">
                {!countryCode.trim()
                  ? t("students.form.districtPickCountry")
                  : districtsLoading
                    ? t("students.form.districtLoading")
                    : t("students.form.districtUnset")}
              </option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-[#636e72]">
            {t("students.form.firstName")} *
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`${fieldClass} mt-1`}
              autoComplete="given-name"
            />
          </label>
          <label className="block text-xs font-semibold text-[#636e72]">
            {t("students.form.lastName")} *
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`${fieldClass} mt-1`}
              autoComplete="family-name"
            />
          </label>
          <label className="block text-xs font-semibold text-[#636e72]">
            {t("students.form.dob")}
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={`${fieldClass} mt-1`}
            />
          </label>
          <label className="block text-xs font-semibold text-[#636e72] sm:col-span-2 lg:col-span-1">
            {t("students.photo.labelAdmission")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1 block w-full text-xs text-[#636e72] file:mr-2 file:rounded-lg file:border-0 file:bg-[#d4e8f5] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#2d3436]"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="block text-xs font-semibold text-[#636e72]">
            {t("students.form.parentEmail")}
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className={`${fieldClass} mt-1`}
              autoComplete="email"
            />
          </label>
          <label className="block text-xs font-semibold text-[#636e72]">
            {t("students.form.gender")}
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`${fieldClass} mt-1`}
            >
              <option value="">{t("students.form.genderUnset")}</option>
              <option value="Female">{t("students.form.genderFemale")}</option>
              <option value="Male">{t("students.form.genderMale")}</option>
              <option value="Other">{t("students.form.genderOther")}</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-[#636e72]">
            {t("students.form.roll")}
            <input
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className={`${fieldClass} mt-1`}
            />
          </label>
          <label className="block text-xs font-semibold text-[#636e72]">
            {t("students.form.section")}
            <input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className={`${fieldClass} mt-1`}
            />
          </label>
          <label className="block text-xs font-semibold text-[#636e72]">
            {t("students.form.classroom")}
            <select
              value={classRoomId}
              onChange={(e) => setClassRoomId(e.target.value)}
              className={`${fieldClass} mt-1`}
            >
              <option value="">{t("students.form.classroomUnset")}</option>
              {rooms.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.name}
                  {r.academicYear ? ` (${r.academicYear})` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-gradient-to-br from-[#6a9570] to-[#4a6b4e] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? t("students.form.saving") : t("students.form.submit")}
          </button>
        </div>
      </form>
    </section>
  );
}
