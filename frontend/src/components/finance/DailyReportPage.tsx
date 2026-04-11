import { useEffect, useMemo, useState } from "react";
import { fetchExpenses } from "../../api/expenses";
import { formatCurrencyUGX } from "./utils";

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTimeLabel(iso: string | undefined): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

type LedgerRow = {
  id: string;
  type: "Income" | "Expense";
  category: string;
  description: string;
  amount: number;
  time: string;
  method: string;
};

export function DailyReportPage() {
  const [filter, setFilter] = useState("All");
  const [ledgerDate, setLedgerDate] = useState(() => localYmd(new Date()));
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void fetchExpenses({
      onDate: ledgerDate,
      sortBy: "recorded",
      sortDir: "asc",
      limit: 200,
    })
      .then((items) => {
        if (cancelled) return;
        const expenseRows: LedgerRow[] = items.map((r) => ({
          id: `exp-${r.id}`,
          type: "Expense" as const,
          category: r.type,
          description: `${r.id} · ${r.email}`,
          amount: Math.max(0, Number.parseInt(r.amountUgx, 10) || 0),
          time: formatTimeLabel(r.recordedAt),
          method: r.status,
        }));
        setRows(expenseRows);
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load");
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ledgerDate]);

  const filteredData = useMemo(
    () => rows.filter((t) => filter === "All" || t.type === filter),
    [rows, filter],
  );

  const totalIncome = filteredData
    .filter((t) => t.type === "Income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredData
    .filter((t) => t.type === "Expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const netPosition = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-xl border border-[#cde8cf] bg-[#f5f8f5] px-4 py-3 text-sm text-[#6a9570]">
        <p className="font-semibold">Live data: school expenses</p>
        <p className="mt-1 text-[#3f4f67]">
          Expense rows come from <code className="rounded bg-white/80 px-1">/api/me/expenses</code> for the
          selected calendar date. Fee <strong>income</strong> is not stored in the database yet, so income
          totals stay at zero until a payments ledger is added.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="block text-xs font-bold uppercase tracking-wide text-[#636e72]">
          Ledger date
          <input
            type="date"
            value={ledgerDate}
            onChange={(e) => setLedgerDate(e.target.value)}
            className="neo-inset-field mt-1 block rounded-lg px-3 py-2 text-sm text-[#2d3436]"
          />
        </label>
        {loading ? <span className="text-xs text-[#636e72]">Loading…</span> : null}
        {loadError ? <span className="text-xs font-semibold text-[#b84040]">{loadError}</span> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="neo-card border-t-4 border-[#6a9570] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#636e72]">Income (fees)</p>
          <p className="mt-2 text-2xl font-black text-[#6a9570]">{formatCurrencyUGX(totalIncome)}</p>
          <p className="mt-1 text-[11px] text-[#636e72]">Not recorded server-side yet</p>
        </div>
        <div className="neo-card border-t-4 border-[#5a8faf] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#636e72]">Expenses (school_expenses)</p>
          <p className="mt-2 text-2xl font-black text-[#5a8faf]">{formatCurrencyUGX(totalExpense)}</p>
        </div>
        <div className="neo-card border-t-4 border-[#9dc6a0] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#636e72]">Net (income − expenses)</p>
          <p
            className={
              "mt-2 text-2xl font-black " + (netPosition >= 0 ? "text-[#10b981]" : "text-[#ef4444]")
            }
          >
            {formatCurrencyUGX(netPosition)}
          </p>
        </div>
      </div>

      <div className="neo-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ebe4d9]/80 bg-[#faf7f0]/50 px-6 py-4">
          <h2 className="text-lg font-bold text-[#2d3436]">Transaction log</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="neo-inset-field rounded-lg px-3 py-1.5 text-sm font-medium text-[#2d3436]"
          >
            <option value="All">All rows</option>
            <option value="Income">Income only</option>
            <option value="Expense">Expenses only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#3f4f67]">
            <thead className="bg-[#f5f8f5] text-xs font-bold uppercase text-[#6a9570]">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe4d9]">
              {filteredData.map((txn) => (
                <tr key={txn.id} className="transition hover:bg-[#faf7f0]/80">
                  <td className="whitespace-nowrap px-6 py-4">{txn.time}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        txn.type === "Income" ? "bg-[#cde8cf] text-[#6a9570]" : "bg-[#e0f0f8] text-[#5a8faf]"
                      }`}
                    >
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#2d3436]">{txn.category}</td>
                  <td className="px-6 py-4">{txn.description}</td>
                  <td className="px-6 py-4">{txn.method}</td>
                  <td
                    className={`px-6 py-4 text-right font-bold ${
                      txn.type === "Income" ? "text-[#6a9570]" : "text-[#5a8faf]"
                    }`}
                  >
                    {txn.type === "Income" ? "+" : "-"}
                    {formatCurrencyUGX(txn.amount)}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#636e72]">
                    No school expenses for this date. Add rows under Dashboard → school expenses or seed
                    data in <code>school_expenses</code>.
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
