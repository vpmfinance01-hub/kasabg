// Одиторски XML файл по Приложение №38 към Наредба Н-18.
// Структурата следва публичната имплементация escapeboy/nra-audit-generator (MIT).
// Официалната XSD схема на НАП не е вградена: преди реална употреба валидирайте файла в системата на НАП.

export type AuditStore = {
  eik: string;
  napShopNumber: string; // уникален номер на онлайн магазина, получен от НАП (чл. 52р)
  domain: string;
  isMarketplace?: boolean;
};

export type AuditItem = { name: string; quantity: number; price: number; vatRate?: number };

export type AuditOrder = {
  orderNumber: string;
  orderDate: string; // YYYY-MM-DD
  docNumber: string;
  docDate: string;
  items: AuditItem[];
  discount?: number;
  paymentCode: number; // 1 без постплащане, 2 виртуален ПОС, 3 с постплащане, 4 платежна услуга, 5 друго, 6 с касова бележка
  posNumber?: string;
  transactionNumber?: string;
  processorId?: string;
};

export type AuditRefund = {
  orderNumber: string;
  amount: number;
  date: string;
  methodCode: number; // 1 IBAN, 2 карта, 3 в брой, 4 друго
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
const tag = (name: string, value: string | number, indent: string) =>
  `${indent}<${name}>${esc(String(value))}</${name}>\n`;

export function buildAuditXml(
  store: AuditStore,
  year: number,
  month: number,
  orders: AuditOrder[],
  refunds: AuditRefund[] = [],
  createdAt: string = new Date().toLocaleDateString("sv-SE")
): string {
  let x = `<?xml version="1.0" encoding="windows-1251"?>\n<audit>\n`;
  x += tag("eik", store.eik, "\t");
  x += tag("e_shop_n", store.napShopNumber, "\t");
  x += tag("domain_name", store.domain, "\t");
  x += tag("creation_date", createdAt, "\t");
  x += tag("mon", String(month).padStart(2, "0"), "\t");
  x += tag("god", year, "\t");
  x += tag("e_shop_type", store.isMarketplace ? 2 : 1, "\t");

  x += `\t<order>\n`;
  for (const o of orders) {
    const lines = o.items.map((i) => {
      const rate = i.vatRate ?? 20;
      const net = i.price * i.quantity;
      const vat = (net * rate) / 100;
      return { i, rate, net, vat, sum: net + vat };
    });
    const total1 = lines.reduce((s, l) => s + l.net, 0);
    const vat = lines.reduce((s, l) => s + l.vat, 0);
    const disc = o.discount ?? 0;
    x += `\t\t<orderenum>\n`;
    x += tag("ord_n", o.orderNumber, "\t\t\t");
    x += tag("ord_d", o.orderDate, "\t\t\t");
    x += tag("doc_n", o.docNumber, "\t\t\t");
    x += tag("doc_date", o.docDate, "\t\t\t");
    x += `\t\t\t<art>\n`;
    for (const l of lines) {
      x += `\t\t\t\t<artenum>\n`;
      x += tag("art_name", l.i.name, "\t\t\t\t\t");
      x += tag("art_quant", l.i.quantity, "\t\t\t\t\t");
      x += tag("art_price", money(l.i.price), "\t\t\t\t\t");
      x += tag("art_vat_rate", l.rate, "\t\t\t\t\t");
      x += tag("art_vat", money(l.vat), "\t\t\t\t\t");
      x += tag("art_sum", money(l.sum), "\t\t\t\t\t");
      x += `\t\t\t\t</artenum>\n`;
    }
    x += `\t\t\t</art>\n`;
    x += tag("ord_total1", money(total1), "\t\t\t");
    x += tag("ord_disc", money(disc), "\t\t\t");
    x += tag("ord_vat", money(vat), "\t\t\t");
    x += tag("ord_total2", money(total1 + vat - disc), "\t\t\t");
    x += tag("paym", o.paymentCode, "\t\t\t");
    if (o.posNumber) x += tag("pos_n", o.posNumber, "\t\t\t");
    if (o.transactionNumber) x += tag("trans_n", o.transactionNumber, "\t\t\t");
    if (o.processorId) x += tag("proc_id", o.processorId, "\t\t\t");
    x += `\t\t</orderenum>\n`;
  }
  x += `\t</order>\n`;

  x += tag("r_ord", refunds.length, "\t");
  x += tag("r_total", money(refunds.reduce((s, r) => s + r.amount, 0)), "\t");
  if (refunds.length) {
    x += `\t<rorder>\n`;
    for (const r of refunds) {
      x += `\t\t<rorderenum>\n`;
      x += tag("r_ord_n", r.orderNumber, "\t\t\t");
      x += tag("r_amount", money(r.amount), "\t\t\t");
      x += tag("r_date", r.date, "\t\t\t");
      x += tag("r_paym", r.methodCode, "\t\t\t");
      x += `\t\t</rorderenum>\n`;
    }
    x += `\t</rorder>\n`;
  }
  x += `</audit>\n`;
  return x;
}

// Кодира текста в windows-1251 (еднобайтово), както е указано в декларацията на файла.
export function encodeWindows1251(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  let n = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    let b: number;
    if (c < 0x80) b = c;
    else if (c >= 0x410 && c <= 0x44f) b = c - 0x350;
    else if (c === 0x401) b = 0xa8;
    else if (c === 0x451) b = 0xb8;
    else if (c === 0x2116) b = 0xb9; // №
    else if (c === 0x20ac) b = 0x88; // €
    else b = 0x3f; // ?
    out[n++] = b;
  }
  return out.slice(0, n);
}
