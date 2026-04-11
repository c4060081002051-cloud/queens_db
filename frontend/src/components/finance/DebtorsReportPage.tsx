import { useEffect, useMemo, useState } from "react";
import { fetchStudents, type StudentApiRow } from "../../api/students";

export function DebtorsReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<StudentApiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void fetchStudents({ sortBy: "name", sortDir: "asc", limit: 500 })
      .then((rows) => {
        if (!cancelled) setStudents(rows);
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load students");
          setStudents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        (s.className ?? "").toLowerCase().includes(q),
    );
  }, [students, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-xl border border-[#b9d9eb] bg-[#eef6fc] px-4 py-3 text-sm text-[#5a8faf]">
        <p className="font-semibold">Fee balances are not in the database yet</p>
        <p className="mt-1 text-[#3f4f67]">
          This list shows <strong>real students</strong> from <code className="rounded bg-white/80 px-1">/api/me/students</code>.
          Term totals, paid amounts, and balances will appear here once a fee ledger is implemented server-side.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="neo-card-elevated flex flex-col justify-center border border-[#b9d9eb] bg-gradient-to-br from-[#eef6fc] to-[#e0f0f8] p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#5a8faf]">Students loaded</h2>
          <p className="mt-2 text-3xl font-black text-[#5a8faf]">{loading ? "…" : filtered.length}</p>
          <p className="mt-1 text-sm font-medium text-[#4a6f8a]">
            {loadError ? <span className="text-[#b84040]">{loadError}</span> : "Matching your search filter"}
          </p>
        </div>
        <div className="neo-card-elevated flex flex-col justify-center p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#636e72]">Outstanding fees</h2>
          <p className="mt-3 text-lg font-semibold text-[#2d3436]">—</p>
          <p className="mt-2 text-xs text-[#636e72]">Requires stored fee schedules and payments per student.</p>
        </div>
      </div>

      <div className="neo-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ebe4d9]/80 bg-[#faf7f0]/50 px-6 py-4">
          <h2 className="text-lg font-bold text-[#2d3436]">Learners (fee columns pending)</h2>
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name, admission no., or class…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-inset-field w-full rounded-lg px-3 py-2 text-sm text-[#2d3436] placeholder:text-[#636e72]/70"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#3f4f67]">
            <thead className="bg-[#f5f8f5] text-xs font-bold uppercase text-[#6a9570]">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3">Term</th>
                <th className="px-6 py-3 text-right">Total due</th>
                <th className="px-6 py-3 text-right">Paid</th>
                <th className="px-6 py-3 text-right">Balance</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe4d9]">
              {filtered.map((s) => (
                <tr key={s.id} className="transition hover:bg-[#faf7f0]/80">
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-bold text-[#2d3436]">{s.fullName}</p>
                    <p className="text-xs text-[#636e72]">{s.admissionNumber}</p>
                  </td>
                  <td className="px-6 py-4">{s.className ?? "—"}</td>
                  <td className="px-6 py-4 text-[#636e72]">—</td>
                  <td className="px-6 py-4 text-right font-medium text-[#636e72]">—</td>
                  <td className="px-6 py-4 text-right font-medium text-[#636e72]">—</td>
                  <td className="px-6 py-4 text-right font-bold text-[#636e72]">—</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-bold text-[#64748b]">
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-[#636e72]">
                    No students match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
