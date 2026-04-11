/** Subject list for prior/entry marks, keyed by standard class name (KG1–P7). */
export function subjectsForClassRoom(className: string): string[] {
  const n = className.trim().toUpperCase();
  /* Kindergarten: KG1–KG3 — five learning areas */
  if (/^KG[1-3]$/.test(n)) {
    return [
      "Learning Area (LA) 1",
      "Learning Area (LA) 2",
      "Learning Area (LA) 3",
      "Learning Area (LA) 4",
      "Learning Area (LA) 5",
    ];
  }
  /* Lower primary: P1–P3 */
  if (/^P[1-3]$/.test(n)) {
    return [
      "English",
      "Mathematics",
      "Literacy A",
      "Literacy B",
      "Luganda",
      "Religious Education",
    ];
  }
  /* Upper primary (P4–P7) and default for any unclassified class */
  return ["English", "Mathematics", "Social Studies", "Science"];
}

export type AdmissionMarksPayload = {
  v: 1;
  marks: { subject: string; mark: string }[];
  /** Free-text previous grades / aggregates (required for new admission). */
  aggregates: string;
};

/** Parse a percentage out of 100 (optional trailing %, comma as decimal). */
export function parseOutOf100Mark(raw: string): number | null {
  const t = raw.trim().replace(/%$/u, "").replace(/,/g, ".").trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function isValidOutOf100Mark(n: number): boolean {
  return n >= 0 && n <= 100;
}

/** Round to 2 decimal places for storage (percent out of 100). */
export function formatOutOf100ForStorage(n: number): string {
  return String(Math.round(n * 100) / 100);
}

export function buildAdmissionMarksJson(
  subjects: string[],
  marks: Record<string, string>,
  aggregates: string,
): string {
  const payload: AdmissionMarksPayload = {
    v: 1,
    marks: subjects.map((subject) => ({
      subject,
      mark: (marks[subject] ?? "").trim(),
    })),
    aggregates: aggregates.trim(),
  };
  return JSON.stringify(payload);
}
