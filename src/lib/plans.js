export const PLANS = {
  starter: { name: "Starter", price: 19, orders: 100, blurb: "до 100 поръчки на месец", blurbEn: "up to 100 orders a month" },
  essential: { name: "Essential", price: 49, orders: 1000, blurb: "до 1 000 поръчки на месец", blurbEn: "up to 1,000 orders a month" },
  premium: { name: "Premium", price: 99, orders: 10000, blurb: "до 10 000 поръчки на месец", blurbEn: "up to 10,000 orders a month" },
  enterprise: { name: "Enterprise", price: null, orders: null, blurb: "по договаряне", blurbEn: "by agreement" },
};
export const YEARLY_DISCOUNT = 0.2;
export const PAID_PLANS = ["starter", "essential", "premium"];
export const STATUS_LABEL = {
  trial: "Пробен период",
  active: "Активен",
  past_due: "Неплатена фактура",
  canceled: "Прекратен",
};
export const STATUS_LABEL_EN = {
  trial: "Trial",
  active: "Active",
  past_due: "Payment overdue",
  canceled: "Cancelled",
};
