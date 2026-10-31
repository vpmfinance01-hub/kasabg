import type { Item, Store } from "@/lib/types";
import { receiptLabels } from "@/lib/receiptLabels";

export type ReceiptOrder = {
  external_id: string;
  customer_email: string | null;
  customer_name?: string | null;
  total: number;
  currency: string;
  items: Item[];
  discount?: number;
  paym_code?: number;
  ordered_at?: string;
};

const fq = (n: number) => String(Math.round(n * 1000) / 1000);
const m2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

function Row({ l, r, bold }: { l: string; r: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${bold ? "font-bold" : ""}`}>
      <span>{l}</span>
      <span className="whitespace-nowrap">{r}</span>
    </div>
  );
}

const SepLine = ({ color }: { color: string }) => <div className="my-2 border-t border-dashed" style={{ borderColor: color }} />;

/** Преглед на електронната бележка: същото съдържание като в имейла и PDF. */
export default function ReceiptView({ store, number, order }: { store: Pick<Store, "name" | "eik" | "website" | "address" | "vat_number" | "logo_url" | "brand_color"> & { receipt_lang?: string }; number: number; order: ReceiptOrder }) {
  const color = store.brand_color && /^#[0-9a-fA-F]{6}$/.test(store.brand_color) ? store.brand_color : "#000000";
  const sep = <SepLine color={color} />;
  const L = receiptLabels(store.receipt_lang);
  const items = order.items ?? [];
  const total = Number(order.total);
  const vat = total - total / 1.2;
  const count = items.reduce((s, i) => s + Number(i.quantity), 0);
  const frac = items.some((i) => !Number.isInteger(Number(i.quantity)));
  const date = order.ordered_at ? order.ordered_at.slice(0, 10) : "";
  const time = order.ordered_at ? order.ordered_at.slice(11, 19) : "";

  return (
    <div className="mx-auto w-full max-w-xs rounded-xl border border-dashed border-[#dcdcdc] bg-[#fcfcfc] p-4 font-mono text-xs leading-relaxed text-[#161616]">
      {store.logo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={store.logo_url} alt="" className="mx-auto mb-2 max-h-14 max-w-[10rem] object-contain" />
      )}
      <div className="text-center font-bold" style={{ color }}>{L.title}</div>
      {sep}
      <div className="text-center font-bold">{store.name}</div>
      {store.address && <div className="text-center">{store.address}</div>}
      {store.eik && <div className="text-center">{L.eik} {store.eik}</div>}
      {store.vat_number && <div className="text-center">{L.vat} {store.vat_number}</div>}
      {store.website && <div className="text-center">{L.shop}: {store.website}</div>}
      {sep}
      <Row l={L.receiptNo} r={String(number).padStart(10, "0")} />
      <Row l={L.order} r={order.external_id} />
      {date && <Row l={L.date} r={date} />}
      {time && time !== "00:00:00" && <Row l={L.time} r={time} />}
      {order.customer_name && <Row l={L.customer} r={order.customer_name} />}
      {sep}
      {items.length === 0 ? (
        <div className="py-1 text-center text-[#6b6b6b]">{L.noItems}</div>
      ) : (
        items.map((i, k) => {
          const unit = Number(i.price) * 1.2;
          return (
            <div key={k} className="mb-2">
              <div className="font-bold">{i.name}</div>
              <Row l={`${fq(Number(i.quantity))} × ${m2(unit)}`} r={m2(unit * Number(i.quantity))} />
            </div>
          );
        })
      )}
      {sep}
      {!!order.discount && Number(order.discount) > 0 && <Row l={L.discount} r={m2(Number(order.discount))} />}
      <div className="text-sm" style={{ color }}>
        <Row l={`${L.total} ${order.currency}`} r={m2(total)} bold />
      </div>
      <Row l={L.vatIncl} r={m2(vat)} />
      <Row l={`${L.payment}: ${L.pays[order.paym_code ?? 5] ?? L.pays[5]}`} r={m2(total)} />
      {sep}
      <div className="text-center">{frac ? `${items.length} ${L.lines}` : `${count} ${L.items}`}</div>
      <div className="mt-2 text-center text-[10px]">{L.footer}</div>
    </div>
  );
}
