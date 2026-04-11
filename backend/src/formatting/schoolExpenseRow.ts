import { SchoolExpense } from "../models/index.js";
import { safeLocaleDate } from "./localeDate.js";

function formatUgx(amount: number | bigint): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return `UGX ${n.toLocaleString("en-US")}`;
}

export type SchoolExpenseApiRow = {
  id: string;
  type: string;
  amount: string;
  amountUgx: string;
  status: "Paid" | "Due";
  email: string;
  date: string;
  /** ISO timestamp when the expense row was recorded (for daily ledger time column). */
  recordedAt: string;
};

export function schoolExpenseToApiRow(
  row: InstanceType<typeof SchoolExpense>,
): SchoolExpenseApiRow {
  const created = row.createdAt;
  return {
    id: row.referenceCode,
    type: row.expenseType,
    amount: formatUgx(row.amountUgx),
    amountUgx: String(row.amountUgx),
    status: row.status.toLowerCase() === "paid" ? "Paid" : "Due",
    email: row.contactEmail,
    date: safeLocaleDate(row.expenseDate),
    recordedAt: created instanceof Date && !Number.isNaN(created.getTime()) ? created.toISOString() : "",
  };
}
