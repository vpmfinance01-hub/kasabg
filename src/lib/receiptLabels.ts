// Текстове на бележката. Основният език е български; „bi“ добавя английски до всеки етикет.
// Бележката е документ по българска наредба, затова българският винаги присъства.
export type ReceiptLang = "bg" | "bi";

export function receiptLabels(lang: ReceiptLang | string | undefined) {
  const bi = lang === "bi";
  const L = (bg: string, en: string) => (bi ? `${bg} / ${en}` : bg);
  const pay = (bg: string, en: string) => L(bg, en);
  return {
    title: L("ЕЛЕКТРОННА КАСОВА БЕЛЕЖКА", "ELECTRONIC RECEIPT"),
    creditTitle: L("КРЕДИТНО ИЗВЕСТИЕ", "CREDIT NOTE"),
    eik: L("ЕИК", "Company ID"),
    vat: L("ЗДДС N", "VAT No."),
    shop: L("Онлайн магазин", "Online shop"),
    receiptNo: L("Бележка №", "Receipt No."),
    order: L("Поръчка", "Order"),
    date: L("Дата", "Date"),
    time: L("Час", "Time"),
    customer: L("Клиент", "Customer"),
    discount: L("Отстъпка", "Discount"),
    total: L("ОБЩА СУМА", "TOTAL"),
    vatIncl: L("в т.ч. ДДС 20%", "incl. VAT 20%"),
    payment: L("Плащане", "Payment"),
    items: L("АРТИКУЛА", "ITEMS"),
    lines: L("ПОЗИЦИИ", "LINES"),
    footer: L("Документ по Алтернативния режим на Наредба Н-18. Не е фискален бон.", "Document under the alternative regime of Ordinance N-18. Not a fiscal receipt."),
    noItems: L("Поръчката няма артикули. Записана е само с обща сума.", "The order has no items. It is recorded with a total only."),
    creditNo: L("Кредитно известие №", "Credit note No."),
    toReceipt: L("Към бележка №", "Re: receipt No."),
    refunded: L("ВЪЗСТАНОВЕНА СУМА", "REFUNDED AMOUNT"),
    method: L("Начин", "Method"),
    creditFooter: L("Документ за възстановена сума по Алтернативния режим на Наредба Н-18. Не е фискален бон.", "Refund document under the alternative regime of Ordinance N-18. Not a fiscal receipt."),
    pays: {
      1: pay("Банков превод", "Bank transfer"),
      2: pay("Карта", "Card"),
      3: pay("Наложен платеж", "Cash on delivery"),
      4: pay("Платежна услуга", "Payment service"),
      5: pay("Друго", "Other"),
    } as Record<number, string>,
    methods: {
      1: pay("Банков превод", "Bank transfer"),
      2: pay("Към картата", "To the card"),
      3: pay("В брой", "Cash"),
      4: pay("Друг начин", "Other"),
    } as Record<number, string>,
    introReceipt: (store: string) =>
      bi
        ? `<p>Здравейте, / Hello,</p><p>Благодарим за поръчката в <b>${store}</b>. Електронната касова бележка е прикачена като PDF и е показана по-долу.<br><i>Thank you for your order at <b>${store}</b>. Your electronic receipt is attached as a PDF and shown below.</i></p>`
        : `<p>Здравейте,</p><p>Благодарим за поръчката в <b>${store}</b>. Електронната касова бележка е прикачена като PDF и е показана по-долу.</p>`,
    introCredit: (store: string) =>
      bi
        ? `<p>Здравейте, / Hello,</p><p>По Вашата поръчка в <b>${store}</b> е възстановена сума. Кредитното известие е прикачено като PDF и е показано по-долу.<br><i>A refund was made on your order at <b>${store}</b>. The credit note is attached as a PDF and shown below.</i></p>`
        : `<p>Здравейте,</p><p>По Вашата поръчка в <b>${store}</b> е възстановена сума. Кредитното известие е прикачено като PDF и е показано по-долу.</p>`,
    subjectReceipt: (num: string, store: string) => (bi ? `Електронна бележка № ${num} / Receipt No. ${num} от ${store}` : `Електронна бележка № ${num} от ${store}`),
    subjectCredit: (num: string, store: string) => (bi ? `Кредитно известие № ${num} / Credit note No. ${num} от ${store}` : `Кредитно известие № ${num} от ${store}`),
  };
}
