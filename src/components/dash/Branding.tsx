"use client";
import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store } from "@/lib/types";
import ReceiptView from "./ReceiptView";
import { useT } from "@/components/LangProvider";

const SAMPLE = {
  external_id: "1001",
  customer_email: null,
  total: 24,
  currency: "EUR",
  items: [{ name: "Примерен артикул", quantity: 1, price: 20 }],
  paym_code: 2,
  ordered_at: "2026-10-24T10:00:00Z",
};

const OK_TYPES = ["image/png", "image/jpeg", "image/webp"];

/** Лого и цвят на бележката. Логото се пази публично, защото имейл клиентите го зареждат от адрес. */
export default function Branding({ store, onSaved }: { store: Store; onSaved: (s: Store) => void }) {
  const t = useT();
  const sb = supabaseBrowser();
  const file = useRef<HTMLInputElement>(null);
  const [color, setColor] = useState(store.brand_color ?? "#000000");
  const [logo, setLogo] = useState(store.logo_url);
  const [lang, setLang] = useState(store.receipt_lang ?? "bg");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(patch: { logo_url?: string | null; brand_color?: string | null; receipt_lang?: string }) {
    const { error } = await sb.from("stores").update(patch).eq("id", store.id);
    if (error) {
      setMsg(t("Грешка при запис: ", "Error while saving: ") + error.message);
      return false;
    }
    onSaved({ ...store, ...patch });
    return true;
  }

  async function upload(f: File) {
    setMsg("");
    if (!OK_TYPES.includes(f.type)) return setMsg(t("Логото трябва да е PNG, JPG или WebP.", "The logo must be PNG, JPG or WebP."));
    if (f.size > 512 * 1024) return setMsg(t("Логото е по-голямо от 512 KB. Намалете го и опитайте пак.", "The logo is larger than 512 KB. Make it smaller and try again."));
    setBusy(true);
    const ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
    const path = `${store.id}/logo-${Date.now()}.${ext}`;
    const up = await sb.storage.from("logos").upload(path, f, { contentType: f.type, upsert: false });
    if (up.error) {
      setBusy(false);
      return setMsg(t("Грешка при качване: ", "Upload error: ") + up.error.message);
    }
    const url = sb.storage.from("logos").getPublicUrl(path).data.publicUrl;
    if (await save({ logo_url: url })) {
      setLogo(url);
      setMsg(t("Логото е качено.", "The logo was uploaded."));
    }
    setBusy(false);
  }

  async function removeLogo() {
    if (await save({ logo_url: null })) {
      setLogo(null);
      setMsg(t("Логото е премахнато.", "The logo was removed."));
    }
  }

  async function saveLang(v: string) {
    setLang(v);
    if (await save({ receipt_lang: v })) setMsg(t("Езикът на бележката е запазен.", "The receipt language was saved."));
  }

  async function saveColor() {
    if (await save({ brand_color: color === "#000000" ? null : color })) setMsg(t("Цветът е запазен.", "The colour was saved."));
  }

  return (
    <div className="card">
      <h3 className="font-bold">{t("Външен вид на бележката", "Receipt appearance")}</h3>
      <p className="mt-1 text-sm text-muted">{t("Логото и цветът се виждат в имейла и в PDF файла, който получава клиентът.", "The logo and colour appear in the email and the PDF the customer receives.")}</p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium">{t("Лого", "Logo")}</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              <button className="btn" disabled={busy} onClick={() => file.current?.click()}>{busy ? t("Качва се…", "Uploading…") : logo ? t("Смени логото", "Change logo") : t("Качи лого", "Upload logo")}</button>
              {logo && <button className="btn btn-ghost" onClick={removeLogo}>{t("Премахни", "Remove")}</button>}
            </div>
            <p className="mt-2 text-xs text-muted">{t("PNG, JPG или WebP, до 512 KB. Най-добре е на бял или прозрачен фон.", "PNG, JPG or WebP, up to 512 KB. Best on a white or transparent background.")}</p>
          </div>
          <div>
            <div className="text-sm font-medium">{t("Цвят", "Colour")}</div>
            <div className="mt-2 flex items-center gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-white p-1" aria-label={t("Цвят на бележката", "Receipt colour")} />
              <button className="btn btn-ghost" onClick={saveColor}>{t("Запази цвета", "Save colour")}</button>
              {color !== "#000000" && <button className="text-sm text-brand-dark" onClick={() => setColor("#000000")}>{t("Черен", "Black")}</button>}
            </div>
            <p className="mt-2 text-xs text-muted">{t("Оцветява заглавието, разделителите и общата сума. Изберете тъмен цвят, за да се чете добре и при печат.", "It colours the title, the dividers and the total. Choose a dark colour so it reads well when printed.")}</p>
          </div>
          <div>
            <div className="text-sm font-medium">{t("Език на бележката към клиента", "Language of the customer's receipt")}</div>
            <select value={lang} onChange={(e) => saveLang(e.target.value)} className="input mt-2 !w-auto">
              <option value="bg">{t("Само български", "Bulgarian only")}</option>
              <option value="bi">{t("Български и английски", "Bulgarian and English")}</option>
            </select>
            <p className="mt-2 text-xs text-muted">{t("Бележката е документ по българска наредба, затова българският винаги присъства. Английският се добавя до всеки етикет.", "The receipt is a document under a Bulgarian ordinance, so Bulgarian is always present. English is added next to each label.")}</p>
          </div>
          {msg && <div className="text-sm text-muted">{msg}</div>}
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">{t("Преглед", "Preview")}</div>
          <ReceiptView store={{ ...store, logo_url: logo, brand_color: color, receipt_lang: lang }} number={1} order={SAMPLE} />
        </div>
      </div>
    </div>
  );
}
