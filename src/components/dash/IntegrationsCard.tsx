"use client";
import { useState } from "react";
import type { Store } from "@/lib/types";
import { useT } from "@/components/LangProvider";

type Tab = "woocommerce" | "shopify" | "connector" | "generic" | "api";

function Url({ id, value, copied, onCopy, copy, done }: { id: string; value: string; copied: string; onCopy: (v: string, id: string) => void; copy: string; done: string }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <code className="block flex-1 break-all rounded-xl bg-accent p-3 text-xs">{value}</code>
      <button type="button" className="btn btn-ghost !px-3 !py-1.5 text-xs" onClick={() => onCopy(value, id)}>
        {copied === id ? done : copy}
      </button>
    </div>
  );
}

export default function IntegrationsCard({ store }: { store: Store }) {
  const t = useT();
  const [tab, setTab] = useState<Tab>("woocommerce");
  const [copied, setCopied] = useState("");
  const origin = typeof window === "undefined" ? "https://smwebsites.org" : window.location.origin;
  const hook = (p: string) => `${origin}/api/hooks/${p}?key=${store.api_key || "…"}`;

  const tabs: [Tab, string][] = [
    ["woocommerce", "WooCommerce"],
    ["shopify", "Shopify"],
    ["connector", t("PrestaShop, Wix, Ecwid… (Make/Zapier)", "PrestaShop, Wix, Ecwid… (Make/Zapier)")],
    ["generic", t("Собствен магазин (JSON)", "Your own shop (JSON)")],
    ["api", "API"],
  ];

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  }

  const url = (id: string, value: string) => (
    <Url id={id} value={value} copied={copied} onCopy={copy} copy={t("Копирай", "Copy")} done={t("Копирано ✓", "Copied ✓")} />
  );

  const genericExample = `{
  "order_id": "1001",
  "date": "2026-10-22",
  "total": 62.40,
  "currency": "EUR",
  "payment": "cod",
  "email": "client@example.com",
  "name": "${t("Иван Иванов", "John Smith")}",
  "items": [
    { "name": "${t("Комплект чинии", "Dinner plate set")}", "qty": 1, "price_excl_vat": 37.50 },
    { "name": "${t("Чаша", "Cup")}", "qty": 2, "price_excl_vat": 7.25 }
  ],
  "refunds": [{ "id": "r-1", "amount": 5.00, "date": "2026-10-25" }]
}`;

  return (
    <div className="card">
      <h3 className="font-bold">{t("Свързване на магазина", "Connect your shop")}</h3>
      <p className="mt-1 text-sm text-muted">
        {t("Новите поръчки и възстановените суми идват автоматично. Адресите съдържат тайния ключ на магазина: не ги публикувайте.", "New orders and refunds arrive automatically. The addresses contain the shop's secret key: do not publish them.")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`btn !py-1.5 text-sm ${tab === k ? "" : "btn-ghost"}`}>{l}</button>
        ))}
      </div>

      {tab === "woocommerce" && (
        <div className="mt-4 text-sm">
          {url("woo", hook("woocommerce"))}
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted">
            <li>{t("В WooCommerce:", "In WooCommerce:")} <b>{t("Настройки → Разширени → Webhooks → Добавяне", "Settings → Advanced → Webhooks → Add webhook")}</b>{t(" (Settings → Advanced → Webhooks).", ".")}</li>
            <li>{t("Име: КасаБГ. Статус:", "Name: KasaBG. Status:")} <b>{t("Активен", "Active")}</b>.</li>
            <li>{t("Тема (Topic):", "Topic:")} <b>Order updated</b> {t("(поръчката се записва, когато стане „В обработка“ или „Завършена“, и при възстановена сума).", "(the order is recorded when it becomes “Processing” or “Completed”, and on a refund).")}</li>
            <li>{t("Адрес за доставка (Delivery URL): поставете адреса по-горе.", "Delivery URL: paste the address above.")}</li>
            <li>{t("Запазете. WooCommerce праща пробна заявка, а новите поръчки идват сами.", "Save. WooCommerce sends a test request and new orders arrive on their own.")}</li>
          </ol>
          <p className="mt-2 text-xs text-muted">{t("Чакащи, отказани и неуспешни поръчки се пропускат. Цените на редовете са без ДДС, както ги пази WooCommerce.", "Pending, cancelled and failed orders are skipped. Line prices exclude VAT, as WooCommerce stores them.")}</p>
        </div>
      )}

      {tab === "shopify" && (
        <div className="mt-4 text-sm">
          {url("shop", hook("shopify"))}
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted">
            <li>{t("В Shopify:", "In Shopify:")} <b>Settings → Notifications → Webhooks → Create webhook</b>.</li>
            <li>{t("Създайте три webhook-а за", "Create three webhooks for")} <b>Order creation</b>, <b>Order payment</b> {t("и", "and")} <b>Order update</b>. {t("Формат:", "Format:")} <b>JSON</b>.</li>
            <li>{t("URL: поставете адреса по-горе. Запазете.", "URL: paste the address above. Save.")}</li>
          </ol>
          <p className="mt-2 text-xs text-muted">{t("Тестови, отказани и неплатени онлайн поръчки се пропускат. Наложеният платеж се разпознава по името на метода („Cash on Delivery“).", "Test, cancelled and unpaid online orders are skipped. Cash on delivery is recognised by the method name (“Cash on Delivery”).")}</p>
        </div>
      )}

      {tab === "connector" && (
        <div className="mt-4 text-sm">
          <p className="text-muted">
            {t("За платформи без наша готова връзка (PrestaShop, Wix, Ecwid, BigCommerce, Squarespace, OpenCart…) ползвайте услуга за свързване като", "For platforms without a ready connection of ours (PrestaShop, Wix, Ecwid, BigCommerce, Squarespace, OpenCart…) use a connector service such as")} <b>Make</b> {t("или", "or")} <b>Zapier</b>. {t("Тя следи магазина и ни праща всяка платена поръчка.", "It watches the shop and sends us every paid order.")}
          </p>
          {url("con", hook("generic"))}
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted">
            <li>{t("В Make/Zapier създайте сценарий: започва от", "In Make/Zapier create a scenario that starts from a")} <b>{t("нова или платена поръчка", "new or paid order")}</b> {t("във вашия магазин.", "in your shop.")}</li>
            <li>{t("Добавете стъпка", "Add a step")} <b>HTTP / Webhooks → Make a request</b>: {t("метод", "method")} <b>POST</b>, {t("адрес по-горе, тип на съдържанието", "the address above, content type")} <b>JSON</b>.</li>
            <li>{t("Попълнете полетата от поръчката:", "Fill in the fields from the order:")} <code>order_id</code>, <code>total</code>, <code>email</code>, <code>payment</code> {t("и редовете", "and the")} <code>items</code>.</li>
            <li>{t("Ако магазинът подава цени с ДДС, пишете ги в", "If the shop gives prices with VAT, put them in")} <code>price_incl_vat</code> {t("(превръща се автоматично). Ако липсва", "(converted automatically). If")} <code>total</code> {t(", сумата се смята от артикулите.", "is missing, the total is calculated from the items.")}</li>
            <li>{t("Подайте и", "Also pass")} <code>status</code>{t(", ако имате: чакащите и отказаните поръчки се пропускат.", " if you have it: pending and cancelled orders are skipped.")}</li>
          </ol>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-foreground p-4 text-xs text-accent">{`{
  "order_id": "{{order number}}",
  "status": "{{status}}",
  "total": {{total with VAT}},
  "currency": "EUR",
  "payment": "card",
  "email": "{{customer email}}",
  "items": [
    { "name": "{{item}}", "qty": {{quantity}}, "price_incl_vat": {{price with VAT}} }
  ]
}`}</pre>
          <p className="mt-2 text-xs text-muted">{t("Услугата за свързване е отделна и има собствена цена. Безплатните им планове стигат за малък магазин. Изпратете една поръчка за проба и я проверете в раздел „Поръчки“.", "The connector service is separate and has its own price. Their free plans are enough for a small shop. Send one test order and check it in the “Orders” section.")}</p>
        </div>
      )}

      {tab === "generic" && (
        <div className="mt-4 text-sm">
          <p className="text-muted">{t("За собствени магазини и всяка система: изпращайте поръчките като JSON с метод POST.", "For your own shops and any system: send orders as JSON with the POST method.")}</p>
          {url("gen", hook("generic"))}
          <pre className="mt-3 overflow-x-auto rounded-xl bg-foreground p-4 text-xs text-accent">{genericExample}</pre>
          <p className="mt-2 text-xs text-muted">
            <code>payment</code>: <code>cod</code> {t("наложен платеж", "cash on delivery")}, <code>bank</code> {t("превод", "transfer")}, <code>card</code> {t("карта", "card")}, <code>paypal</code>/<code>stripe</code> {t("платежна услуга", "payment service")}, <code>other</code>.{" "}
            {t("Цените на артикулите са без ДДС. Повторно изпратена поръчка с един и същ", "Item prices exclude VAT. An order sent again with the same")} <code>order_id</code> {t("се обновява, а не се дублира.", "is updated, not duplicated.")}
          </p>
        </div>
      )}

      {tab === "api" && (
        <div className="mt-4 text-sm text-muted">
          <p>{t("За разработчици: същият универсален формат се приема на адреса от „Собствен магазин (JSON)“. Алтернативно има CSV импорт в раздел „Поръчки“.", "For developers: the same universal format is accepted at the address under “Your own shop (JSON)”. Alternatively there is a CSV import in the “Orders” section.")}</p>
          <p className="mt-2">{t("Ключът на магазина е в полето „API ключ“ по-долу.", "The shop's key is in the “API key” field below.")}</p>
        </div>
      )}
    </div>
  );
}
