import { useEffect, useState } from "react";
import { fetchExpenses } from "../../api/expenses";
import { formatCurrencyUGX } from "./utils";

export function FinanceSummaryPage() {
  const [expenseTotalUgx, setExpenseTotalUgx] = useState<number | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<
    { id: string; type: string; detail: string; amt: number; date: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void fetchExpenses({ sortBy: "date", sortDir: "desc", limit: 500 })
      .then((items) => {
        if (cancelled) return;
        const sum = items.reduce((acc, r) => acc + (Number.parseInt(r.amountUgx, 10) || 0), 0);
        setExpenseTotalUgx(sum);
        setRecentExpenses(
          items.slice(0, 6).map((r) => ({
            id: r.id,
            type: "Expense",
            detail: `${r.type} · ${r.id}`,
            amt: Number.parseInt(r.amountUgx, 10) || 0,
            date: r.date,
          })),
        );
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load");
          setExpenseTotalUgx(null);
          setRecentExpenses([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalExpenses = expenseTotalUgx ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="rounded-xl border border-[#cde8cf] bg-[#f5f8f5] px-4 py-3 text-sm text-[#6a9570]">
        <p className="font-semibold">Mixed sources</p>
        <p className="mt-1 text-[#3f4f67]">
          <strong>Operating expenses</strong> total is summed from the latest{" "}
          <code className="rounded bg-white/80 px-1">school_expenses</code> rows (max 500) via{" "}
          <code className="rounded bg-white/80 px-1">/api/me/expenses</code>. Fee collection, bursaries, and
          net balance still need dedicated tables — figures in gray cards remain illustrative.
        </p>
      </div>

      {loadError ? (
        <p className="text-sm font-semibold text-[#b84040]" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="neo-card flex flex-col justify-center border-b-4 border-[#cbd5e1] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#636e72]">Total collections (fees)</p>
          <p className="mt-2 text-2xl font-black text-[#94a3b8]">—</p>
          <p className="mt-1 text-xs font-medium text-[#636e72]">Not stored in DB yet</p>
        </div>

        <div className="neo-card flex flex-col justify-center border-b-4 border-[#4a6f8a] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#636e72]">School expenses (live)</p>
          <p className="mt-2 text-2xl font-black text-[#4a6f8a]">
            {loading ? "…" : formatCurrencyUGX(totalExpenses)}
          </p>
          <p className="mt-1 text-xs font-medium text-[#636e72]">Σ amount_ugx (up to 500 rows)</p>
        </div>

        <div className="neo-card flex flex-col justify-center border-b-4 border-[#9dc6a0] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#636e72]">Bursaries &amp; discounts</p>
          <p className="mt-2 text-2xl font-black text-[#94a3b8]">—</p>
          <p className="mt-1 text-xs font-medium text-[#636e72]">Not stored in DB yet</p>
        </div>

        <div className="neo-card flex flex-col justify-center border-b-4 border-[#10b981] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#636e72]">Net operating balance</p>
          <p className="mt-2 text-2xl font-black text-[#94a3b8]">—</p>
          <p className="mt-1 text-xs font-medium text-[#636e72]">Needs fee ledger + cashbook</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="neo-card-elevated relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#e2e8f0] to-[#cbd5e1] opacity-60 blur-3xl" />
          <h2 className="text-lg font-bold text-[#2d3436]">Term fee collection progress</h2>
          <p className="mt-1 text-sm text-[#636e72]">
            Progress bars require stored targets and payments per term. This will activate when those APIs
            exist.
          </p>
          <p className="mt-10 text-center text-4xl font-black text-[#cbd5e1]">—</p>
        </div>

        <div className="neo-card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#2d3436]">Recent school expenses</h2>
          <p className="mt-1 text-sm text-[#636e72]">Newest rows from the expense register (same cap as total).</p>

          <div className="mt-6 space-y-4">
            {recentExpenses.length === 0 && !loading ? (
              <p className="text-sm text-[#636e72]">No expenses returned yet.</p>
            ) : null}
            {recentExpenses.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border-b border-[#ebe4d9] pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-bold text-[#2d3436]">{t.detail}</p>
                  <p className="mt-0.5 text-xs text-[#636e72]">
                    {t.type} • {t.date}
                  </p>
                </div>
                <div className="text-right font-black tracking-tight text-[#4a6f8a]">
                  -{formatCurrencyUGX(t.amt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
