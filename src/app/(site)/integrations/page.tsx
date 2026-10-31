import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { Arrow } from "@/components/site/Icons";
import { getT } from "@/lib/i18n-server";

export default async function Integrations() {
  const t = await getT();
  const ready = t("Готово", "Ready");

  const ways: [string, string, string][] = [
    ["WooCommerce", ready, t("Webhook от WooCommerce. Поръчките и възстановените суми идват сами след настройка от 2 минути.", "A webhook from WooCommerce. Orders and refunds arrive on their own after a 2-minute setup.")],
    ["Shopify", ready, t("Webhook-и за нова, платена и променена поръчка. Разпознава наложен платеж и платежни услуги.", "Webhooks for a new, paid and updated order. It recognises cash on delivery and payment services.")],
    [t("Универсален webhook", "Universal webhook"), ready, t("За собствени магазини и всяка система: изпращате поръчката като JSON. Приема цени със или без ДДС.", "For your own shops and any system: send the order as JSON. Accepts prices with or without VAT.")],
    [t("Make и Zapier", "Make and Zapier"), ready, t("За PrestaShop, Wix, Ecwid, BigCommerce, Squarespace и други: услугата за свързване ни праща поръчките. Без програмиране.", "For PrestaShop, Wix, Ecwid, BigCommerce, Squarespace and others: the connector service sends us the orders. No coding.")],
    [t("CSV импорт", "CSV import"), ready, t("Качвате експорт от магазина си в таблото. Работи с всяка платформа.", "Upload an export from your shop in the dashboard. Works with any platform.")],
    [t("Собствени плъгини", "Our own plugins"), t("По заявка", "On request"), t("За PrestaShop, Magento и OpenCart още нямаме собствени плъгини. Ползвайте Make/Zapier или CSV, или ни пишете.", "We do not yet have our own plugins for PrestaShop, Magento and OpenCart. Use Make/Zapier or CSV, or write to us.")],
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-10">
      <Reveal><div className="eyebrow">{t("Интеграции", "Integrations")}</div></Reveal>
      <Reveal delay={80}><h1 className="mt-4 max-w-3xl text-5xl sm:text-6xl">{t("Свържете магазина си за минути.", "Connect your shop in minutes.")}</h1></Reveal>
      <Reveal delay={160}><p className="mt-5 max-w-xl text-lg text-muted">{t("Адресите и упътванията получавате в таблото, в „Настройки“.", "You get the addresses and instructions in the dashboard, under “Settings”.")}</p></Reveal>

      <div className="mt-14 border-t-[1.5px] border-foreground">
        {ways.map(([title, status, d], i) => (
          <Reveal key={title} delay={(i % 3) * 50}>
            <div className="group grid items-baseline gap-2 border-b border-line py-6 transition-colors hover:bg-accent/50 sm:grid-cols-[14rem_1fr_6rem] sm:gap-8 sm:px-3">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold transition-transform group-hover:translate-x-1">{title}</h3>
              <p className="leading-relaxed text-muted">{d}</p>
              <span className={`w-fit rounded-md px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider sm:justify-self-end ${status === ready ? "bg-sage/15 text-sage" : "bg-sun/25 text-foreground"}`}>{status}</span>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-16 overflow-hidden rounded-2xl bg-ink text-ink-text">
          <div className="flex items-center justify-between border-b border-ink-line px-6 py-3">
            <span className="eyebrow !text-sun">{t("Пример за универсалния webhook", "Universal webhook example")}</span>
            <span className="font-mono text-xs text-ink-faint">POST · JSON</span>
          </div>
          <pre className="overflow-x-auto p-6 text-[13px] leading-relaxed">{`{
  "order_id": "1001",
  "date": "2026-10-22",
  "total": 62.40,
  "currency": "EUR",
  "payment": "cod",
  "email": "client@example.com",
  "items": [
    { "name": "Dinner plate set", "qty": 1, "price_excl_vat": 37.50 },
    { "name": "Cup", "qty": 2, "price_excl_vat": 7.25 }
  ]
}`}</pre>
          <p className="border-t border-ink-line px-6 py-3 text-sm text-ink-soft">{t("Цените са без ДДС. Повторно изпратена поръчка се обновява, а не се дублира.", "Prices exclude VAT. An order sent again is updated, not duplicated.")}</p>
        </div>
      </Reveal>

      <div className="mt-10">
        <Link href="/contact" className="ulink inline-flex items-center gap-2 font-semibold text-brand-dark">{t("Нужна ви е друга интеграция?", "Need a different integration?")} <Arrow /></Link>
      </div>
    </div>
  );
}
