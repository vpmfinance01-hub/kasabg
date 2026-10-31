import { getT } from "@/lib/i18n-server";

export default async function Privacy() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-extrabold">{t("Политика за поверителност", "Privacy policy")}</h1>
      <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        {t(
          "Чернова. Трябва да бъде прегледана от юрист и допълнена с данните на администратора, преди публично пускане.",
          "Draft. It must be reviewed by a lawyer and completed with the controller's details before public launch. The Bulgarian version is the one that applies."
        )}
      </div>
      <div className="mt-6 space-y-4 leading-relaxed">
        <h2 className="text-xl font-bold">{t("Администратор", "Controller")}</h2>
        <p>{t("[наименование на дружеството], ЕИК [ЕИК], имейл за въпроси: [имейл].", "[company name], company ID [ID], email for questions: [email].")}</p>
        <h2 className="text-xl font-bold">{t("Какви данни обработваме", "What data we process")}</h2>
        <p>{t("Данни за профила (имейл), данни за магазина (име, ЕИК, домейн) и данни за поръчките, които магазинът ни предава (номер, сума, артикули, имейл на клиента за изпращане на бележка).", "Account data (email), shop data (name, company ID, domain) and order data the shop sends us (number, amount, items, the customer's email for sending the receipt).")}</p>
        <h2 className="text-xl font-bold">{t("Цел и основание", "Purpose and basis")}</h2>
        <p>{t("Данните се обработват за изпълнение на услугата: издаване на електронни бележки и подготовка на файл за НАП. Спрямо клиентите на магазина, КасаБГ действа като обработващ данни от името на магазина.", "The data is processed to provide the service: issuing electronic receipts and preparing the file for the NRA. With respect to the shop's customers, KasaBG acts as a processor on behalf of the shop.")}</p>
        <h2 className="text-xl font-bold">{t("Къде се съхраняват и кои са подизпълнителите", "Where it is stored and who the sub-processors are")}</h2>
        <p>{t("Базата данни е в Европейския съюз (Supabase). Сайтът е хостван във Vercel и на сървър на Hostinger (Германия), където работи и автоматизацията (n8n). Бележките се изпращат от пощата на самия магазин; при липса на настроена поща се ползва обща поща на платформата (Gmail). За плащане на абонамента се ползва Stripe, без данни за поръчките.", "The database is in the European Union (Supabase). The site is hosted on Vercel and on a Hostinger server (Germany), where the automation (n8n) also runs. Receipts are sent from the shop's own mailbox; if none is set up, a shared platform mailbox (Gmail) is used. Stripe is used for subscription payments, without any order data.")}</p>
        <h2 className="text-xl font-bold">{t("Срок и права", "Retention and rights")}</h2>
        <p>{t("Данните се пазят докато профилът е активен и за срока, изискван от закон. Магазинът може сам да свали всички данни, да заличи името и имейла на клиент и да изтрие магазина от „Настройки → Лични данни“. Счетоводните документи се пазят по закон, затова при заличаване остават сумите и номерата, без личните данни. За други искания пишете на имейла по-горе.", "Data is kept while the account is active and for the period the law requires. A shop can download all of its data, erase a customer's name and email, and delete the shop under “Settings → Personal data”. Accounting documents must be kept by law, so when erasing, amounts and numbers remain without the personal data. For other requests write to the email above.")}</p>
        <h2 className="text-xl font-bold">{t("Бисквитки", "Cookies")}</h2>
        <p>{t("Сайтът ползва само необходимите за влизане в профила и за запомняне на избрания език и тема. Не използваме рекламни бисквитки.", "The site uses only what is needed to sign in and to remember your chosen language and theme. We do not use advertising cookies.")}</p>
      </div>
    </div>
  );
}
