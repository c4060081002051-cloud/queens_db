import { useState } from "react";
import { BulkStudentUpload } from "./BulkStudentUpload";
import { NewAdmissionForm } from "./NewAdmissionForm";
import { StudentsListPanel } from "./StudentsListPanel";
import { useI18n } from "../../i18n/I18nProvider";

export type StudentNavSection = "all" | "admissions" | "profiles";

export function StudentsSectionPage({ section }: { section: StudentNavSection }) {
  const { t } = useI18n();
  const [listRefresh, setListRefresh] = useState(0);

  const titleKey =
    section === "admissions"
      ? "students.page.admissionsTitle"
      : section === "profiles"
        ? "students.page.profilesTitle"
        : "students.page.allTitle";
  const introKey =
    section === "admissions"
      ? "students.page.introAdmissions"
      : section === "profiles"
        ? "students.page.introProfiles"
        : "students.page.introAll";

  return (
    <div className="min-w-0 space-y-6">
      <header className="border-b border-[#ebe4d9]/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-[#2d3436]">{t(titleKey)}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#636e72]">{t(introKey)}</p>
      </header>

      {section === "admissions" ? (
        <div className="grid gap-6 lg:grid-cols-1">
          <NewAdmissionForm onCreated={() => setListRefresh((k) => k + 1)} />
          <BulkStudentUpload onDone={() => setListRefresh((k) => k + 1)} />
        </div>
      ) : (
        <StudentsListPanel
          limit={500}
          showDirectoryTools
          refreshKey={listRefresh}
          title={
            section === "profiles" ? t("students.page.profilesTitle") : t("students.tableCaption")
          }
        />
      )}
    </div>
  );
}
