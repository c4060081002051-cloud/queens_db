import { useEffect, useMemo, useState } from "react";
import { fetchStudents, type StudentApiRow } from "../../api/students";

export type FinanceSection =
  | "overview"
  | "daily_report"
  | "debtors_report"
  | "record_payment"
  | "bursery"
  | "staff_payment"
  | "finance_summary";

const sectionTitle: Record<FinanceSection, string> = {
  overview: "Financial Overview",
  daily_report: "Daily Report Section",
  debtors_report: "Debtors Report",
  record_payment: "Record Student Payment",
  bursery: "Bursery Section",
  staff_payment: "Staff Payment Section",
  finance_summary: "Finance Summary Page",
};

function FinancePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="neo-card p-6">
      <h2 className="text-xl font-bold tracking-tight text-[#2d3436]">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-[#636e72]">{description}</p>
    </section>
  );
}

function formatCurrencyUGX(value: number): string {
  return `${new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 }).format(value)} UGX`;
}

function formatReceiptDate(value: Date): string {
  return value.toLocaleString("en-UG", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function studentLabel(student: StudentApiRow): string {
  return `${student.fullName} (${student.admissionNumber})`;
}

type GeneratedReceipt = {
  receiptNo: string;
  issuedAt: Date;
  term: string;
  paymentMethod: string;
  paidBy: string;
  amountPaid: number;
  outstandingAfter: number;
  creditAmount: number;
  student: StudentApiRow;
  totalFeesDue: number;
  previousPaid: number;
};

function RecordPaymentPage() {
  const [studentSearch, setStudentSearch] = useState("");
  const [studentMatches, setStudentMatches] = useState<StudentApiRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentApiRow | null>(null);
  const [term, setTerm] = useState("Term 1");
  const [method, setMethod] = useState("Cash payment");
  const [paidBy, setPaidBy] = useState("");
  const [amount, setAmount] = useState("");
  const [totalFeesDue, setTotalFeesDue] = useState("1200000");
  const [previousPaid, setPreviousPaid] = useState("0");
  const [receipt, setReceipt] = useState<GeneratedReceipt | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (studentSearch.trim().length < 2) {
      setStudentMatches([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    void fetchStudents({ q: studentSearch.trim(), sortBy: "name", sortDir: "asc", limit: 8 })
      .then((rows) => {
        if (cancelled) return;
        setStudentMatches(rows);
      })
      .catch(() => {
        if (!cancelled) setStudentMatches([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentSearch]);

  const parsedTotalFeesDue = Math.max(Number(totalFeesDue) || 0, 0);
  const parsedPreviousPaid = Math.max(Number(previousPaid) || 0, 0);
  const parsedAmount = Math.max(Number(amount) || 0, 0);
  const balanceBeforePayment = Math.max(parsedTotalFeesDue - parsedPreviousPaid, 0);
  const appliedPayment = Math.min(parsedAmount, balanceBeforePayment);
  const creditAmount = Math.max(parsedAmount - balanceBeforePayment, 0);
  const outstandingAfter = Math.max(balanceBeforePayment - appliedPayment, 0);

  const createReceipt = () => {
    setFormError(null);
    if (!selectedStudent) {
      setFormError("Select a student from the search results.");
      return;
    }
    if (parsedAmount <= 0) {
      setFormError("Amount paid must be greater than zero.");
      return;
    }
    const stamp = Date.now().toString().slice(-5);
    const nextReceipt: GeneratedReceipt = {
      receiptNo: `ST-${stamp}`,
      issuedAt: new Date(),
      term,
      paymentMethod: method,
      paidBy: paidBy.trim() || selectedStudent.parentFullName || "Parent / Guardian",
      amountPaid: parsedAmount,
      outstandingAfter,
      creditAmount,
      student: selectedStudent,
      totalFeesDue: parsedTotalFeesDue,
      previousPaid: parsedPreviousPaid,
    };
    setReceipt(nextReceipt);
  };

  return (
    <div className="space-y-6">
      <section className="neo-card mx-auto max-w-5xl p-6 sm:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e7ecfb] text-2xl">
          <span aria-hidden>💳</span>
        </div>
        <h2 className="mt-4 text-[2rem] font-bold tracking-tight text-[#243043]">Record Student Payment</h2>
        <p className="mt-2 text-[1.45rem] text-[#5f728b]">
          Securely record student fee collection and generate receipts.
        </p>
      </div>

      <form className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e4b5f]">
            Student Search *
          </label>
          <input
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="-- Start typing name or ID --"
            className="neo-inset-field w-full rounded-xl px-4 py-3 text-sm text-[#2d3436] placeholder:text-[#7a8798]"
          />
          {searchLoading ? (
            <p className="mt-1 text-xs text-[#8a99ad]">Searching students...</p>
          ) : null}
          {studentMatches.length > 0 ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-[#d9e1ec] bg-white">
              {studentMatches.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    setSelectedStudent(student);
                    setStudentSearch(studentLabel(student));
                    setStudentMatches([]);
                    setPaidBy(student.parentFullName ?? "");
                  }}
                  className="block w-full border-b border-[#eef2f7] px-3 py-2 text-left text-xs text-[#2d3436] last:border-b-0 hover:bg-[#f7f9fd]"
                >
                  {studentLabel(student)}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e4b5f]">
            Academic Term *
          </label>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="neo-inset-field w-full rounded-xl px-4 py-3 text-sm text-[#2d3436]"
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e4b5f]">
            Payment Method *
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="neo-inset-field w-full rounded-xl px-4 py-3 text-sm text-[#2d3436]"
          >
            <option>Cash payment</option>
            <option>Mobile money</option>
            <option>Bank transfer</option>
            <option>Cheque</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e4b5f]">
            Paid By (Depositor&apos;s Name)
          </label>
          <input
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            placeholder="Parent / Guardian / Agent name"
            className="neo-inset-field w-full rounded-xl px-4 py-3 text-sm text-[#2d3436] placeholder:text-[#7a8798]"
          />
          <p className="mt-2 text-xs text-[#8a99ad]">Who physically handed in this payment?</p>
        </div>

        <div className="sm:col-span-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e4b5f]">
            Amount Paid (UGX) *
          </label>
          <div className="neo-inset-field flex items-center rounded-xl px-4 py-3">
            <span className="mr-2 text-2xl font-bold text-[#90a0b4]">UGX</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-3xl font-bold text-[#6cc1ab] outline-none placeholder:text-[#6cc1ab]"
            />
          </div>
        </div>

        <div className="sm:col-span-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e4b5f]">
            Total Fees Due (UGX) *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={totalFeesDue}
            onChange={(e) => setTotalFeesDue(e.target.value)}
            className="neo-inset-field w-full rounded-xl px-4 py-3 text-sm text-[#2d3436]"
          />
        </div>

        <div className="sm:col-span-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#3e4b5f]">
            Previous Payments (UGX) *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={previousPaid}
            onChange={(e) => setPreviousPaid(e.target.value)}
            className="neo-inset-field w-full rounded-xl px-4 py-3 text-sm text-[#2d3436]"
          />
        </div>

        <div className="sm:col-span-2 rounded-xl border border-[#d9e1ec] bg-[#f7f9fd] px-4 py-3 text-sm text-[#2d3436]">
          <p><span className="font-semibold text-[#5f728b]">Balance before payment:</span> {formatCurrencyUGX(balanceBeforePayment)}</p>
          <p><span className="font-semibold text-[#5f728b]">Outstanding after payment:</span> {formatCurrencyUGX(outstandingAfter)}</p>
          {creditAmount > 0 ? (
            <p className="font-semibold text-[#a56c00]">Overpayment credit: {formatCurrencyUGX(creditAmount)}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2 grid gap-4 pt-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={createReceipt}
            className="rounded-2xl bg-[#eef2f7] px-5 py-3 text-base font-semibold text-[#3f4f67] shadow-[inset_1px_1px_0_rgba(255,255,255,0.7)]"
          >
            Save Record
          </button>
          <button
            type="button"
            onClick={() => {
              createReceipt();
              window.setTimeout(() => window.print(), 100);
            }}
            className="rounded-2xl bg-gradient-to-r from-[#5758ea] to-[#4c46df] px-5 py-3 text-base font-bold text-white shadow-[0_8px_16px_rgba(72,68,210,0.3)]"
          >
            Save &amp; Print Receipt
          </button>
        </div>
        {formError ? <p className="sm:col-span-2 text-sm font-semibold text-[#b84040]">{formError}</p> : null}
      </form>
      </section>

      {receipt ? (
        <section className="neo-card relative mx-auto max-w-5xl overflow-hidden border border-[#d8e0e7] bg-[#fcfdff] p-6 sm:p-8 print:shadow-none">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="select-none text-[7rem] font-bold tracking-widest text-[#2d3436]/5 [transform:rotate(-35deg)]">
              {receipt.receiptNo}
            </p>
          </div>

          <header className="relative z-10 border-b border-[#e5eaef] pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-3xl font-bold text-[#2f4054]">QUEENS NURSERY &amp; PRIMARY SCHOOL</h2>
                <p className="mt-2 text-sm text-[#3f4f67]">Kitebi star just after the trading Centre</p>
                <p className="text-sm text-[#3f4f67]">P.O. BOX 9107, Kampala | queensprimaryschool13@gmail.com</p>
                <p className="text-sm text-[#3f4f67]">+256 782 333 908 / +256 750 775 572</p>
              </div>
              <div className="text-right">
                <p className="text-[2.6rem] font-bold tracking-[0.1em] text-[#2f4054]">RECEIPT</p>
                <p className="text-lg font-semibold text-[#7a8a99]">NO: {receipt.receiptNo}</p>
              </div>
            </div>
          </header>

          <div className="relative z-10 mt-6 grid gap-4 rounded-2xl border-l-4 border-[#3498db] bg-[#f7f9fc] p-5 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#1e73be]">Payment Information</h3>
              <dl className="mt-3 space-y-1 text-sm">
                <div><dt className="inline font-bold text-[#2f4054]">Date Issued:</dt> <dd className="inline text-[#3f4f67]">{formatReceiptDate(receipt.issuedAt)}</dd></div>
                <div><dt className="inline font-bold text-[#2f4054]">Term/Period:</dt> <dd className="inline text-[#3f4f67]">{receipt.term}</dd></div>
                <div><dt className="inline font-bold text-[#2f4054]">Payment Method:</dt> <dd className="inline text-[#3f4f67]">{receipt.paymentMethod}</dd></div>
                <div><dt className="inline font-bold text-[#2f4054]">Paid By:</dt> <dd className="inline text-[#3f4f67]">{receipt.paidBy}</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#1e73be]">Student Details</h3>
              <dl className="mt-3 space-y-1 text-sm">
                <div><dt className="inline font-bold text-[#2f4054]">Student Name:</dt> <dd className="inline text-[#3f4f67]">{receipt.student.fullName}</dd></div>
                <div><dt className="inline font-bold text-[#2f4054]">Admission No:</dt> <dd className="inline text-[#3f4f67]">{receipt.student.admissionNumber}</dd></div>
                <div><dt className="inline font-bold text-[#2f4054]">Class:</dt> <dd className="inline text-[#3f4f67]">{receipt.student.className ?? "—"}</dd></div>
                <div><dt className="inline font-bold text-[#2f4054]">Section:</dt> <dd className="inline text-[#3f4f67]">{receipt.student.sectionName ?? "—"}</dd></div>
                <div><dt className="inline font-bold text-[#2f4054]">LIN:</dt> <dd className="inline text-[#3f4f67]">{receipt.student.rollNumber ?? "—"}</dd></div>
                <div><dt className="inline font-bold text-[#2f4054]">Gender:</dt> <dd className="inline text-[#3f4f67]">{receipt.student.gender ?? "—"}</dd></div>
                <div><dt className="inline font-bold text-[#2f4054]">Date of Birth:</dt> <dd className="inline text-[#3f4f67]">{receipt.student.dateOfBirthFormatted ?? "—"}</dd></div>
              </dl>
            </div>
          </div>

          <div className="relative z-10 mt-6 overflow-hidden rounded-2xl border border-[#d9e1ea]">
            <div className="grid grid-cols-[1fr_auto] bg-[#dbe2eb] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#2f4054]">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] bg-[#eef9f1] px-4 py-4 text-[1.9rem] font-bold text-[#21a35a]">
              <span className="text-xl">Amount Paid (This Transaction)</span>
              <span>{formatCurrencyUGX(receipt.amountPaid)}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] bg-white px-4 py-4 text-[1.7rem] font-bold text-[#2f4054]">
              <span className="text-xl">Outstanding Balance</span>
              <span className={receipt.outstandingAfter === 0 ? "text-[#21a35a]" : ""}>
                {receipt.outstandingAfter === 0
                  ? `Cleared (0 UGX)`
                  : formatCurrencyUGX(receipt.outstandingAfter)}
              </span>
            </div>
            {receipt.creditAmount > 0 ? (
              <div className="grid grid-cols-[1fr_auto] bg-[#fff7e6] px-4 py-3 text-base font-semibold text-[#9a6700]">
                <span>Credit Carried Forward</span>
                <span>{formatCurrencyUGX(receipt.creditAmount)}</span>
              </div>
            ) : null}
          </div>

          <div className="relative z-10 mt-4 grid gap-2 rounded-xl border border-[#e5eaef] bg-[#fbfcfd] p-4 text-sm text-[#3f4f67] sm:grid-cols-2">
            <p><span className="font-semibold text-[#2f4054]">Parent/Guardian:</span> {receipt.student.parentFullName ?? "—"}</p>
            <p><span className="font-semibold text-[#2f4054]">Parent Phone:</span> {receipt.student.parentPhone ?? "—"}</p>
            <p><span className="font-semibold text-[#2f4054]">Parent Email:</span> {receipt.student.parentEmail ?? "—"}</p>
            <p><span className="font-semibold text-[#2f4054]">Guardian:</span> {receipt.student.guardianName ?? "—"}</p>
            <p><span className="font-semibold text-[#2f4054]">Emergency Contact:</span> {receipt.student.emergencyContactName ?? "—"}</p>
            <p><span className="font-semibold text-[#2f4054]">Emergency Phone:</span> {receipt.student.emergencyContactPhone ?? "—"}</p>
            <p><span className="font-semibold text-[#2f4054]">Nationality:</span> {receipt.student.nationality ?? "—"}</p>
            <p><span className="font-semibold text-[#2f4054]">Residence:</span> {receipt.student.residenceAddress ?? "—"}</p>
            <p className="sm:col-span-2"><span className="font-semibold text-[#2f4054]">Fee Breakdown:</span> Total Due {formatCurrencyUGX(receipt.totalFeesDue)} | Previous Paid {formatCurrencyUGX(receipt.previousPaid)} | Balance Before {formatCurrencyUGX(Math.max(receipt.totalFeesDue - receipt.previousPaid, 0))}</p>
          </div>

          <footer className="relative z-10 mt-8 border-t border-[#e5eaef] pt-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-center text-xs font-semibold tracking-[0.16em] text-[#6f7f8f]">- - - - - - - - - - - - - - - - - - - -</p>
                <p className="mt-2 text-center text-2xl font-semibold text-[#6f7f8f]">AUTHORIZED CASHIER</p>
              </div>
              <div>
                <p className="text-center text-xs font-semibold tracking-[0.16em] text-[#6f7f8f]">- - - - - - - - - - - - - - - - - - - -</p>
                <p className="mt-2 text-center text-2xl font-semibold text-[#6f7f8f]">PARENT / GUARDIAN SIGNATURE</p>
              </div>
            </div>
            <p className="mt-8 text-center text-lg font-semibold text-[#2f4054]">
              All payments should be made through Post Bank A/C NO.1630001000378 or School Pay.
            </p>
            <p className="mt-2 text-center text-base text-[#7d8d9d]">Thank you for choosing Queens Nursery &amp; Primary School.</p>
          </footer>
        </section>
      ) : null}
    </div>
  );
}

export function FinanceSectionPage({
  section,
  onChangeSection,
}: {
  section: FinanceSection;
  onChangeSection: (value: FinanceSection) => void;
}) {
  const cards = useMemo(
    () => [
      { key: "daily_report" as const, desc: "Track income and transactions captured today." },
      { key: "debtors_report" as const, desc: "Review outstanding balances and unpaid fees." },
      { key: "record_payment" as const, desc: "Record student payments and issue receipts quickly." },
      { key: "bursery" as const, desc: "Manage bursary allocations and disbursement status." },
      { key: "staff_payment" as const, desc: "Handle payroll-related payment records for staff." },
      { key: "finance_summary" as const, desc: "View overall financial performance at a glance." },
    ],
    [],
  );

  if (section === "record_payment") {
    return (
      <div className="min-w-0 space-y-4">
        <header className="border-b border-[#ebe4d9]/80 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-[#2d3436]">{sectionTitle.record_payment}</h1>
        </header>
        <RecordPaymentPage />
      </div>
    );
  }

  if (section !== "overview") {
    return (
      <div className="min-w-0 space-y-4">
        <header className="border-b border-[#ebe4d9]/80 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-[#2d3436]">{sectionTitle[section]}</h1>
        </header>
        <FinancePlaceholder
          title={sectionTitle[section]}
          description="This section is ready for your finance workflows and reports."
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <header className="border-b border-[#ebe4d9]/80 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-[#2d3436]">Financial Overview</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#636e72]">
          Landing page for finance. Choose any section below to continue.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => onChangeSection(card.key)}
            className="neo-card text-left p-5 transition hover:brightness-105"
          >
            <h2 className="text-base font-bold text-[#2d3436]">{sectionTitle[card.key]}</h2>
            <p className="mt-2 text-sm text-[#636e72]">{card.desc}</p>
          </button>
        ))}
      </section>
    </div>
  );
}
