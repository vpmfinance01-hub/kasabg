"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { buildAuditXml, encodeWindows1251, type AuditOrder } from "@/lib/auditXml";
import JSZip from "jszip";
import { runChecks, deadline } from "@/lib/checks";
import { ordersCsv, receiptsCsv, refundsCsv, summaryTxt, type PackReceipt, type PackRefund } from "@/lib/pack";
import type { Store, Order, Refund, Export } from "@/lib/types";
import { useT } from "@/components/LangProvider";

const color = { error: "bg-red-50 text-red-800", warn: "bg-amber-50 text-amber-900", info: "bg-accent text-foreground" };
const icon = { error: "⛔", warn: "⚠️", info: "ℹ️" };

export default function Overview({ store, orders, refunds }: { store: Store; orders: Order[]; refunds: Refund[] }) {
  const t = useT();
  const sb = supabaseBrowser();
  const [period, setPeriod] = useState(() => {
    // предходен месец по местно време (не по UTC)
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [exp, setExp] = useState<Export | null>(null);

  const loadExp = async () => {
    const { data } = await sb.from("audit_exports").select("*").eq("store_id", store.id).eq("period", period).maybeSingle();
    setExp(data);
  };
  useEffect(() => {
    loadExp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id, period]);

  const checks = runChecks(store, orders, refunds, period, t);
  const blocking = checks.some((c) => c.level === "error");
  const dl = deadline(period);
  const inP = orders.filter((o) => o.ordered_at.startsWith(period));
  const sum = inP.reduce((s, o) => s + Number(o.total_eur ?? o.total), 0);

  const [year, month] = period.split("-").map(Number);
  const next = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
  const rf = refunds.filter((r) => r.refunded_at >= `${period}-01` && r.refunded_at < `${next}-01`);

  function makeXml() {
    const list: AuditOrder[] = inP.map((o) => ({
      orderNumber: o.external_id,
      orderDate: o.ordered_at.slice(0, 10),
      docNumber: o.doc_number ?? o.external_id,
      docDate: o.doc_date ?? o.ordered_at.slice(0, 10),
      items: o.items.length
        ? o.items
        : [{ name: "Поръчка " + o.external_id, quantity: 1, price: +((o.total_eur ?? o.total) / 1.2).toFixed(2) }],
      discount: o.discount,
      paymentCode: o.paym_code,
      posNumber: o.pos_n ?? undefined,
      transactionNumber: o.trans_n ?? undefined,
      processorId: o.proc_id ?? undefined,
    }));
    return buildAuditXml(
      { eik: store.eik ?? "", napShopNumber: store.nap_shop_number ?? "", domain: store.website ?? "", isMarketplace: store.is_marketplace },
      year,
      month,
      list,
      rf.map((r) => ({ orderNumber: r.order_ref, amount: +r.amount, date: r.refunded_at, methodCode: r.method_code }))
    );
  }

  const xmlName = `audit-${store.nap_shop_number ?? "shop"}-${period}.xml`;

  function save(blob: Blob, name: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }

  async function markDownloaded() {
    if (exp?.status !== "submitted")
      await sb.from("audit_exports").upsert({ store_id: store.id, period, status: "downloaded" }, { onConflict: "store_id,period" });
    loadExp();
  }

  async function download() {
    if (blocking && !confirm(t("Има грешки. Сигурни ли сте, че искате да свалите файла?", "There are errors. Are you sure you want to download the file?"))) return;
    save(new Blob([encodeWindows1251(makeXml()) as BlobPart], { type: "application/xml" }), xmlName);
    await markDownloaded();
  }

  // ZIP: одиторски файл + таблици за счетоводителя
  async function downloadPack() {
    if (blocking && !confirm(t("Има грешки. Сигурни ли сте, че искате да свалите пакета?", "There are errors. Are you sure you want to download the package?"))) return;
    const { data } = await sb
      .from("receipts")
      .select("number,status,sent_at,orders!inner(external_id,ordered_at)")
      .eq("store_id", store.id)
      .gte("orders.ordered_at", `${period}-01`)
      .lt("orders.ordered_at", `${next}-01`)
      .order("number");
    const receipts: PackReceipt[] = ((data ?? []) as unknown as { number: number; status: string; sent_at: string | null; orders: { external_id: string } }[]).map((r) => ({
      number: r.number, order_ref: r.orders.external_id, status: r.status, sent_at: r.sent_at,
    }));
    const pr: PackRefund[] = rf.map((r) => ({ number: r.number, order_ref: r.order_ref, refunded_at: r.refunded_at, method_code: r.method_code, amount: r.amount, status: r.status }));
    const bom = "﻿";
    const zip = new JSZip();
    zip.file(xmlName, encodeWindows1251(makeXml()));
    zip.file(`porachki-${period}.csv`, bom + ordersCsv(inP, t));
    zip.file(`belezhki-${period}.csv`, bom + receiptsCsv(receipts, t));
    zip.file(`vazstanovyavaniya-${period}.csv`, bom + refundsCsv(pr, t));
    zip.file(`rezyume-${period}.txt`, bom + summaryTxt(store.name, period, inP, pr, receipts, t));
    save(await zip.generateAsync({ type: "blob" }), `kasabg-${period}.zip`);
    await markDownloaded();
  }

  async function toggleSubmitted() {
    const submitted = exp?.status === "submitted";
    await sb.from("audit_exports").upsert(
      { store_id: store.id, period, status: submitted ? "downloaded" : "submitted", submitted_at: submitted ? null : new Date().toISOString() },
      { onConflict: "store_id,period" }
    );
    loadExp();
  }

  const status =
    exp?.status === "submitted"
      ? t("✅ Подаден към НАП", "✅ Filed with the NRA")
      : exp?.status === "downloaded"
        ? t("📄 Свален, още не е отбелязан като подаден", "📄 Downloaded, not yet marked as filed")
        : t("⏳ Още не е свален", "⏳ Not downloaded yet");

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3">
        <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="input !w-auto" />
        <div className="text-sm">
          <div><b>{status}</b></div>
          <div className="text-muted">
            {t("Срок за подаване:", "Filing deadline:")} {dl.date} {dl.daysLeft >= 0 ? t(`(остават ${dl.daysLeft} дни)`, `(${dl.daysLeft} days left)`) : t("(срокът е минал)", "(the deadline has passed)")}
          </div>
        </div>
      </div>
      {(() => {
        const steps: [boolean, string][] = [
          [!!(store.eik && store.website && store.nap_shop_number), t("Попълнете ЕИК, домейн и № от НАП в „Настройки“", "Fill in the company ID, domain and NRA number in “Settings”")],
          [orders.length > 0, t("Добавете първата поръчка (CSV, API или „+ Нова поръчка“)", "Add your first order (CSV, API or “+ New order”)")],
          [exp?.status === "downloaded" || exp?.status === "submitted", t("Свалете файла за НАП за избрания месец", "Download the NRA file for the selected month")],
        ];
        if (steps.every(([done]) => done)) return null;
        return (
          <div className="card">
            <h3 className="font-bold">{t("Първи стъпки", "First steps")}</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {steps.map(([done, label]) => (
                <li key={label} className={done ? "text-muted line-through" : ""}>{done ? "✅" : "⬜"} {label}</li>
              ))}
            </ul>
          </div>
        );
      })()}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><div className="text-sm text-muted">{t("Поръчки за месеца", "Orders this month")}</div><div className="text-3xl font-extrabold">{inP.length}</div></div>
        <div className="card"><div className="text-sm text-muted">{t("Оборот (EUR)", "Turnover (EUR)")}</div><div className="text-3xl font-extrabold">{sum.toFixed(2)}</div></div>
        <div className="card">
          <div className="text-sm text-muted">{t("Възстановени суми за месеца", "Refunds this month")}</div>
          <div className="text-3xl font-extrabold">{refunds.filter((r) => r.refunded_at.startsWith(period)).length}</div>
        </div>
      </div>
      <div className="card">
        <h3 className="font-bold">{t("Проверки преди подаване", "Checks before filing")}</h3>
        <div className="mt-3 space-y-2">
          {checks.length === 0 && <div className="rounded-xl bg-green-50 p-3 text-green-800">{t("✅ Всичко изглежда наред.", "✅ Everything looks fine.")}</div>}
          {checks.map((c, i) => (
            <div key={i} className={`rounded-xl p-3 text-sm ${color[c.level]}`}>{icon[c.level]} {c.text}</div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn" onClick={download}>{t("Свали одиторски XML", "Download audit XML")}</button>
          <button className="btn btn-ghost" onClick={downloadPack}>{t("Пакет за счетоводителя (ZIP)", "Accountant's package (ZIP)")}</button>
          <button className="btn btn-ghost" onClick={toggleSubmitted}>
            {exp?.status === "submitted" ? t("Отбележи като неподаден", "Mark as not filed") : t("Отбележи като подаден", "Mark as filed")}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          {t("Файлът следва публично достъпна имплементация на Приложение №38. Преди подаване го проверете в системата на НАП.", "The file follows a publicly available implementation of Annex 38. Check it in the NRA system before filing.")}
        </p>
      </div>
    </div>
  );
}
