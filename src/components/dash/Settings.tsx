"use client";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store } from "@/lib/types";
import Billing from "./Billing";
import Branding from "./Branding";
import Privacy from "./Privacy";
import EmailSettings from "./EmailSettings";
import IntegrationsCard from "./IntegrationsCard";
import { useT } from "@/components/LangProvider";

export default function Settings({ store, onSaved, onDeleted }: { store: Store; onSaved: (s: Store) => void; onDeleted: () => void }) {
  const t = useT();
  const sb = supabaseBrowser();

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const patch = {
      name: String(f.get("name")),
      eik: String(f.get("eik")),
      website: String(f.get("website")),
      address: String(f.get("address")),
      vat_number: String(f.get("vat")),
      nap_shop_number: String(f.get("nap")),
      is_marketplace: f.get("mp") === "on",
    };
    await sb.from("stores").update(patch).eq("id", store.id);
    onSaved({ ...store, ...patch });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const example = `curl -X POST ${base}/rest/v1/rpc/ingest_order \\
  -H "apikey: <${t("публичен ключ", "public key")}>" -H "Content-Type: application/json" \\
  -d '{"p_api_key":"<${t("вашият API ключ", "your API key")}>","p_external_id":"1001","p_total":23.99,
       "p_currency":"EUR","p_customer_email":"client@example.com",
       "p_items":[{"name":"${t("Артикул", "Item")}","quantity":1,"price":19.99}]}'`;

  return (
    <div className="space-y-4">
      <form key={store.id} onSubmit={save} className="card grid gap-3 md:grid-cols-2">
        <input name="name" defaultValue={store.name} required placeholder={t("Име на магазина", "Shop name")} className="input" />
        <input name="eik" defaultValue={store.eik ?? ""} placeholder={t("ЕИК", "Company ID (EIK)")} className="input" />
        <input name="website" defaultValue={store.website ?? ""} placeholder={t("Домейн (shop.bg)", "Domain (shop.bg)")} className="input" />
        <input name="address" defaultValue={store.address ?? ""} placeholder={t("Адрес на фирмата", "Company address")} className="input" />
        <input name="vat" defaultValue={store.vat_number ?? ""} placeholder={t("ЗДДС номер (ако сте регистрирани)", "VAT number (if registered)")} className="input" />
        <input name="nap" defaultValue={store.nap_shop_number ?? ""} placeholder={t("№ на магазина от НАП", "Shop number from the NRA")} className="input" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="mp" defaultChecked={store.is_marketplace} /> {t("Магазинът е платформа (marketplace)", "The shop is a marketplace")}
        </label>
        <button className="btn">{t("Запази", "Save")}</button>
      </form>
      <Billing key={`b-${store.id}`} store={store} />
      <Branding key={store.id} store={store} onSaved={onSaved} />
      <IntegrationsCard store={store} />
      <EmailSettings store={store} />
      <Privacy key={`p-${store.id}`} store={store} onDeleted={onDeleted} />
      <div className="card">
        <h3 className="font-bold">{t("Интеграция чрез API", "API integration")}</h3>
        <p className="mt-1 text-sm text-muted">{t("API ключът е таен. Не го публикувайте в публичен код.", "The API key is secret. Do not publish it in public code.")}</p>
        <code className="mt-2 block break-all rounded-xl bg-accent p-3 text-sm">{store.api_key}</code>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-foreground p-4 text-xs text-accent">{example}</pre>
      </div>
    </div>
  );
}
