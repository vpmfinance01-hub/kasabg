import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { Arrow } from "@/components/site/Icons";
import { getT } from "@/lib/i18n-server";

export default async function ForShops() {
  const t = await getT();

  const points = [
    [t("Бележка за всяка поръчка", "A receipt for every order"), t("Клиентът получава PDF и копие в самото писмо, веднага след плащането. Писмото излиза от вашата фирмена поща.", "The customer gets a PDF and a copy in the email itself, right after payment. The email goes out from your company mailbox.")],
    [t("Файлът за месеца е готов", "The month's file is ready"), t("Подготвяме одиторския XML и ви показваме какво да поправите, преди да го подадете.", "We prepare the audit XML and show you what to fix before you file it.")],
    [t("Възстановените суми не се губят", "Refunds do not get lost"), t("Върнатата сума става кредитно известие към бележката и влиза във файла. Сумите се водят в евро.", "A refund becomes a credit note linked to the receipt and goes into the file. Amounts are kept in euro.")],
    [t("Счетоводителят работи на същото място", "Your accountant works in the same place"), t("Добавяте имейла му и той свали файла, без да чака експорти по пощата.", "Add their email and they can download the file without waiting for exports by email.")],
    [t("Данните са ваши", "The data is yours"), t("Можете да свалите всичко, а достъпът на всеки е ограничен до неговия магазин.", "You can download everything, and everyone's access is limited to their own shop.")],
  ];

  const steps = [
    t("Регистрирайте се и добавете магазина: име, ЕИК, домейн.", "Sign up and add your shop: name, company ID, domain."),
    t("Попълнете кратката декларация. Тя записва какви плащания приемате и какво сте потвърдили.", "Fill in the short declaration. It records which payments you accept and what you have confirmed."),
    t("Регистрирайте магазина в НАП и въведете получения номер.", "Register the shop with the Bulgarian NRA and enter the number you receive."),
    t("Свържете поръчките: WooCommerce и Shopify директно, останалите през Make, Zapier или CSV.", "Connect your orders: WooCommerce and Shopify directly, the rest through Make, Zapier or CSV."),
    t("Добавете имейла на счетоводителя си.", "Add your accountant's email."),
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-10">
      <Reveal><div className="eyebrow">{t("За онлайн магазини", "For online shops")}</div></Reveal>
      <Reveal delay={80}><h1 className="mt-4 max-w-3xl text-5xl sm:text-6xl">{t("Вие продавате. Бележките излизат сами.", "You sell. The receipts go out by themselves.")}</h1></Reveal>
      <Reveal delay={160}><p className="mt-5 max-w-xl text-lg text-muted">{t("Грижим се клиентите да получават бележки, а вие да имате готов файл за НАП всеки месец.", "We make sure your customers get receipts and you have the NRA file ready every month.")}</p></Reveal>

      <div className="mt-16 grid gap-x-16 lg:grid-cols-2">
        <div>
          {points.map(([title, d], i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="group border-t-[1.5px] border-foreground py-6">
                <div className="flex items-baseline gap-4">
                  <span className="num-xl text-3xl">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold transition-colors group-hover:text-brand">{title}</h3>
                </div>
                <p className="mt-2 pl-[3.1rem] leading-relaxed text-muted">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal variant="scale" className="mt-12 lg:mt-0">
          <div className="zig-bottom sticky top-28 bg-ink px-8 pt-9 text-ink-text">
            <div className="eyebrow !text-sun">{t("Как започвате", "How to get started")}</div>
            <ol className="mt-6 space-y-5">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink-faint font-mono text-xs text-sun">{i + 1}</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
            <Link href="/register" className="btn mb-2 mt-8 btn-on-ink">{t("Започни безплатно", "Start for free")} <Arrow /></Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
