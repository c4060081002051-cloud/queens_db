export function formatCurrencyUGX(value: number): string {
  return `${new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 }).format(value)} UGX`;
}

export function formatReceiptDate(value: Date): string {
  return value.toLocaleString("en-UG", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
