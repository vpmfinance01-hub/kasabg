// Единен вид на поръчка и възстановена сума, към който се свеждат всички платформи.

export type PaymentCode = 1 | 2 | 3 | 4 | 5; // 1 без постплащане, 2 виртуален ПОС, 3 с постплащане, 4 платежна услуга, 5 друго
export type RefundMethod = 1 | 2 | 3 | 4; // 1 IBAN, 2 карта, 3 в брой, 4 друго

export interface NormItem {
  name: string;
  quantity: number;
  /** Единична цена без ДДС (след отстъпките). */
  price: number;
}

export interface NormRefund {
  externalRef: string;
  amount: number;
  date: string; // ГГГГ-ММ-ДД
  method: RefundMethod;
}

export interface NormOrder {
  externalId: string;
  total: number; // обща сума с ДДС, вече след отстъпки
  currency: string;
  paymentMethod: string;
  paymentCode: PaymentCode;
  customerName?: string;
  customerEmail?: string;
  country?: string;
  orderedAt: string; // ISO
  items: NormItem[];
  refunds: NormRefund[];
}

/** Резултат от разчитане: поръчка или причина да се пропусне (с успешен отговор към платформата). */
export type Parsed = { ok: true; order: NormOrder } | { ok: false; ignored: string };

export const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function refundMethodFor(code: PaymentCode): RefundMethod {
  return code === 3 ? 3 : code === 1 ? 1 : code === 2 || code === 4 ? 2 : 4;
}
