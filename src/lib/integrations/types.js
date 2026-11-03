// Единен вид на поръчка и възстановена сума, към който се свеждат всички платформи.
export const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
export function refundMethodFor(code) {
  return code === 3 ? 3 : code === 1 ? 1 : code === 2 || code === 4 ? 2 : 4;
}
