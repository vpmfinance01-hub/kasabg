// Планове и цени (евро, без ДДС). Едно място за сайта, таблото и плащането.
export type PlanKey = "starter" | "essential" | "premium" | "enterprise";

export const PLANS: Record<PlanKey, { name: string; price: number | null; orders: number | null; blurb: string; blurbEn: string }> = {
  starter: { name: "Starter", price: 19, orders: 100, blurb: "до 100 поръчки на месец", blurbEn: "up to 100 orders a month" },
  essential: { name: "Essential", price: 49, orders: 1000, blurb: "до 1 000 поръчки на месец", blurbEn: "up to 1,000 orders a month" },
  premium: { name: "Premium", price: 99, orders: 10000, blurb: "до 10 000 поръчки на месец", blurbEn: "up to 10,000 orders a month" },
  enterprise: { name: "Enterprise", price: null, orders: null, blurb: "по договаряне", blurbEn: "by agreement" },
};

export const YEARLY_DISCOUNT = 0.2;
export const PAID_PLANS: PlanKey[] = ["starter", "essential", "premium"];

export const STATUS_LABEL: Record<string, string> = {
  trial: "Пробен период",
  active: "Активен",
  past_due: "Неплатена фактура",
  canceled: "Прекратен",
};
export const STATUS_LABEL_EN: Record<string, string> = {
  trial: "Trial",
  active: "Active",
  past_due: "Payment overdue",
  canceled: "Cancelled",
};
