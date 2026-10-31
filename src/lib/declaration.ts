// Декларация на магазина при регистрация. Въпросите, проверката и предупрежденията са на едно място,
// за да ги ползват и таблото, и сървърният маршрут. Смяна на въпросите = нова версия.
// Записът в базата винаги е на български (валидният текст); английският е за удобство на потребителя.
import { makeT, type T } from "./i18n.ts";

export const DECLARATION_VERSION = 1;

const bg: T = makeT("bg");

export const paymentOptions = (t: T): [string, string][] => [
  ["card_vpos", t("Карта през виртуален ПОС (неприсъствено плащане)", "Card through a virtual POS (remote payment)")],
  ["payment_service", t("Платежна услуга (Stripe, PayPal и др.)", "Payment service (Stripe, PayPal, etc.)")],
  ["bank_transfer", t("Банков превод", "Bank transfer")],
  ["cod", t("Наложен платеж", "Cash on delivery")],
  ["other", t("Друго", "Other")],
];

export type Answers = {
  nap_registered: "yes" | "pending" | "no" | "";
  nap_number: string;
  payments: string[];
  card_account_own: "yes" | "no" | "na" | "";
  payment_provider: string;
  vat_registered: "yes" | "no" | "";
  vat_number: string;
  other_system: "yes" | "no" | "";
  other_system_note: string;
  accountant_consulted: "yes" | "no" | "";
  confirm_data: boolean;
  confirm_authority: boolean;
  confirm_responsibility: boolean;
  confirm_gdpr: boolean;
};

export const emptyAnswers = (): Answers => ({
  nap_registered: "", nap_number: "", payments: [], card_account_own: "", payment_provider: "",
  vat_registered: "", vat_number: "", other_system: "", other_system_note: "", accountant_consulted: "",
  confirm_data: false, confirm_authority: false, confirm_responsibility: false, confirm_gdpr: false,
});

export const confirmations = (t: T): [keyof Answers, string][] => [
  ["confirm_data", t("Данните, които подавам за магазина и за поръчките, са верни и пълни. Ще ги поддържам актуални.", "The data I provide about the shop and the orders is accurate and complete. I will keep it up to date.")],
  ["confirm_authority", t("Имам право да представлявам фирмата и да приема тази декларация от нейно име.", "I am entitled to represent the company and to accept this declaration on its behalf.")],
  ["confirm_responsibility", t("Разбирам, че КасаБГ издава документите и подготвя файла само от данните, които магазинът му подава. Изборът на режим по Наредба Н-18, регистрацията на магазина в НАП, верността на данните и подаването на файла към НАП са отговорност на магазина. КасаБГ не заменя счетоводна или правна консултация.", "I understand that KasaBG issues the documents and prepares the file only from the data the shop gives it. The choice of regime under Ordinance N-18, registering the shop with the NRA, the accuracy of the data and filing the file with the NRA are the shop's responsibility. KasaBG does not replace accounting or legal advice.")],
  ["confirm_gdpr", t("Имам правно основание да предавам на КасаБГ имейлите и имената на клиентите си за изпращане на бележки, и възлагам на КасаБГ да ги обработва от мое име.", "I have a legal basis to give KasaBG my customers' emails and names for sending receipts, and I instruct KasaBG to process them on my behalf.")],
];
// запазено за обратна съвместимост (български)
export const CONFIRMATIONS = confirmations(bg);
export const PAYMENT_OPTIONS = paymentOptions(bg);

/** Липсващи или противоречиви отговори. Празен списък = може да се запише. */
export function validate(a: Answers, t: T = bg): string[] {
  const e: string[] = [];
  if (!a.nap_registered) e.push(t("Посочете дали магазинът е регистриран в НАП.", "Say whether the shop is registered with the NRA."));
  if (a.nap_registered === "yes" && !a.nap_number.trim()) e.push(t("Въведете номера на магазина от НАП.", "Enter the shop number from the NRA."));
  if (a.payments.length === 0) e.push(t("Изберете поне един начин на плащане.", "Choose at least one payment method."));
  const card = a.payments.includes("card_vpos") || a.payments.includes("payment_service");
  if (card && !a.card_account_own) e.push(t("Отговорете дали картовите плащания постъпват в сметка на фирмата.", "Answer whether card payments go into the company's account."));
  if (card && !a.payment_provider.trim()) e.push(t("Посочете доставчика на картови плащания.", "Name the card payment provider."));
  if (!a.vat_registered) e.push(t("Посочете дали фирмата е регистрирана по ЗДДС.", "Say whether the company is VAT-registered."));
  if (a.vat_registered === "yes" && !a.vat_number.trim()) e.push(t("Въведете ЗДДС номера.", "Enter the VAT number."));
  if (!a.other_system) e.push(t("Посочете дали част от продажбите се отчитат по друг начин.", "Say whether some sales are reported another way."));
  if (a.other_system === "yes" && !a.other_system_note.trim()) e.push(t("Опишете накратко как се отчитат останалите продажби.", "Briefly describe how the other sales are reported."));
  if (!a.accountant_consulted) e.push(t("Посочете дали сте обсъдили режима със счетоводител.", "Say whether you have discussed the regime with an accountant."));
  for (const [k] of confirmations(t)) if (!a[k]) e.push(t("Всички потвърждения в края са задължителни.", "All the confirmations at the end are required."));
  return [...new Set(e)];
}

export type Warning = { level: "warn" | "error"; text: string };

/** Предупреждения към магазина според отговорите. Записват се заедно с декларацията (на български). */
export function warnings(a: Answers, t: T = bg): Warning[] {
  const w: Warning[] = [];
  const card = a.payments.includes("card_vpos") || a.payments.includes("payment_service");
  if (a.payments.includes("cod"))
    w.push({ level: "warn", text: t("Алтернативният режим по чл. 3, ал. 17 от Наредба Н-18 е за неприсъствено плащане с карта. За наложения платеж уточнете със счетоводителя или с НАП дали бележката от КасаБГ е достатъчна.", "The alternative regime under art. 3(17) of Ordinance N-18 is for remote payment by card. For cash on delivery check with your accountant or the NRA whether the KasaBG receipt is enough.") });
  if (card && a.card_account_own === "no")
    w.push({ level: "error", text: t("Според чл. 52п от Наредба Н-18 картовите плащания трябва да постъпват само в сметка на фирмата. Иначе режимът не е допустим.", "Under art. 52p of Ordinance N-18 card payments must go only into the company's own account. Otherwise the regime is not allowed.") });
  if (a.nap_registered !== "yes")
    w.push({ level: "warn", text: t("Преди да започнете продажби, магазинът трябва да е регистриран в НАП (чл. 52м и Приложение 33). Номерът е нужен и за одиторския файл.", "Before you start selling, the shop must be registered with the NRA (art. 52m and Annex 33). The number is also needed for the audit file.") });
  if (a.other_system === "yes")
    w.push({ level: "warn", text: t("Ако част от продажбите минават през друг софтуер или фискално устройство, обсъдете със счетоводителя как се отчитат заедно с тези от КасаБГ.", "If some sales go through other software or a fiscal device, discuss with your accountant how they are reported together with those from KasaBG.") });
  if (a.accountant_consulted === "no")
    w.push({ level: "warn", text: t("Препоръчваме преди да започнете да обсъдите режима със счетоводител.", "We recommend discussing the regime with an accountant before you start.") });
  return w;
}
