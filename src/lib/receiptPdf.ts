// PDF на електронната бележка и на кредитното известие, правен в самия сайт (без външна услуга).
// Данните са същите като в писмото. Широчина 80 мм, като касова лента; височината се смята според съдържанието.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFImage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { receiptLabels } from "./receiptLabels.ts";

export type ReceiptPayload = {
  kind?: "credit";
  number: number | string;
  orig_number?: number | string;
  store_name: string;
  eik?: string;
  vat_number?: string;
  address?: string;
  domain?: string;
  order_ref: string;
  date: string;
  time?: string;
  currency: string;
  paym_code?: number;
  method_code?: number;
  amount?: number;
  total?: number;
  discount?: number;
  items?: { name: string; quantity: number; price: number }[];
  logo_url?: string;
  brand_color?: string;
  lang?: string;
};

const PAGE_W = 226.77; // 80 мм
const MARGIN = 14;
const FS = 8.6;
const LH = FS * 1.45;

const fq = (n: number) => String(Math.round(n * 1000) / 1000);
const m2 = (n: number) => (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);

let fonts: Promise<{ regular: Buffer; bold: Buffer }> | null = null;
const loadFonts = () =>
  (fonts ??= (async () => {
    const dir = path.join(process.cwd(), "src", "assets", "fonts");
    const [regular, bold] = await Promise.all([readFile(path.join(dir, "DejaVuSansMono.ttf")), readFile(path.join(dir, "DejaVuSansMono-Bold.ttf"))]);
    return { regular, bold };
  })());

const hexColor = (hex: string | undefined) => {
  const ok = /^#[0-9a-fA-F]{6}$/.test(hex ?? "");
  const h = ok ? (hex as string) : "#000000";
  return rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
};

/** Логото се взема от публичен адрес. PNG и JPEG се слагат, други формати се пропускат. */
async function fetchLogo(url: string | undefined): Promise<{ bytes: Uint8Array; type: "png" | "jpg" } | null> {
  if (!url || !/^https:\/\/[^\s'"<>]+$/.test(url)) return null;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    if (buf.length > 600_000) return null;
    if (buf[0] === 0x89 && buf[1] === 0x50) return { bytes: buf, type: "png" };
    if (buf[0] === 0xff && buf[1] === 0xd8) return { bytes: buf, type: "jpg" };
    return null;
  } catch {
    return null;
  }
}

type Line =
  | { k: "text"; t: string; align?: "center" | "left"; bold?: boolean; size?: number; color?: boolean; gray?: boolean }
  | { k: "row"; l: string; r: string; bold?: boolean; size?: number; color?: boolean }
  | { k: "sep" }
  | { k: "gap"; h: number };

function lines(b: ReceiptPayload): Line[] {
  const credit = b.kind === "credit";
  const L = receiptLabels(b.lang);
  const num = String(b.number).padStart(10, "0");
  const out: Line[] = [
    { k: "text", t: credit ? L.creditTitle : L.title, align: "center", bold: true, color: true },
    { k: "sep" },
    { k: "text", t: b.store_name, align: "center", bold: true },
  ];
  if (b.address) out.push({ k: "text", t: b.address, align: "center" });
  out.push({ k: "text", t: `${L.eik} ${b.eik ?? ""}`, align: "center" });
  if (b.vat_number) out.push({ k: "text", t: `${L.vat} ${b.vat_number}`, align: "center" });
  if (b.domain) out.push({ k: "text", t: `${L.shop}: ${b.domain}`, align: "center" });
  out.push({ k: "sep" });

  if (credit) {
    const amount = Number(b.amount ?? 0);
    out.push(
      { k: "row", l: L.creditNo, r: num },
      { k: "row", l: L.toReceipt, r: String(b.orig_number ?? "").padStart(10, "0") },
      { k: "row", l: L.order, r: b.order_ref },
      { k: "row", l: L.date, r: b.date },
      { k: "sep" },
      { k: "row", l: `${L.refunded} ${b.currency}`, r: m2(amount), bold: true, size: FS + 1.4, color: true },
      { k: "row", l: L.vatIncl, r: m2(amount - amount / 1.2) },
      { k: "row", l: `${L.method}: ${L.methods[b.method_code ?? 4] ?? L.methods[4]}`, r: m2(amount) },
      { k: "sep" },
      { k: "text", t: L.creditFooter, align: "center", size: FS - 1.6, gray: true },
    );
    return out;
  }

  const total = Number(b.total ?? 0);
  const discount = Number(b.discount ?? 0);
  out.push({ k: "row", l: L.receiptNo, r: num }, { k: "row", l: L.order, r: b.order_ref }, { k: "row", l: L.date, r: b.date });
  if (b.time && b.time !== "00:00:00") out.push({ k: "row", l: L.time, r: b.time });
  out.push({ k: "sep" });
  let count = 0;
  let frac = false;
  for (const i of b.items ?? []) {
    const qty = Number(i.quantity);
    const unit = Number(i.price) * 1.2;
    count += qty;
    if (!Number.isInteger(qty)) frac = true;
    out.push(
      { k: "gap", h: 3 },
      { k: "text", t: i.name, bold: true },
      { k: "row", l: `${fq(qty)} × ${m2(unit)}`, r: m2(unit * qty) },
    );
  }
  out.push({ k: "sep" });
  if (discount > 0) out.push({ k: "row", l: L.discount, r: m2(discount) });
  out.push(
    { k: "row", l: `${L.total} ${b.currency}`, r: m2(total), bold: true, size: FS + 1.4, color: true },
    { k: "row", l: L.vatIncl, r: m2(total - total / 1.2) },
    { k: "row", l: `${L.payment}: ${L.pays[b.paym_code ?? 5] ?? L.pays[5]}`, r: m2(total) },
    { k: "sep" },
    { k: "text", t: frac ? `${(b.items ?? []).length} ${L.lines}` : `${count} ${L.items}`, align: "center" },
    { k: "gap", h: 4 },
    { k: "text", t: L.footer, align: "center", size: FS - 1.6, gray: true },
  );
  return out;
}

/** Дели текст на редове по ширина, по думи; много дълга дума се реже. */
function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const res: string[] = [];
  for (const para of String(text).split("\n")) {
    let cur = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const test = cur ? `${cur} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= width) {
        cur = test;
        continue;
      }
      if (cur) res.push(cur);
      let w = word;
      while (font.widthOfTextAtSize(w, size) > width && w.length > 1) {
        let n = w.length - 1;
        while (n > 1 && font.widthOfTextAtSize(w.slice(0, n), size) > width) n--;
        res.push(w.slice(0, n));
        w = w.slice(n);
      }
      cur = w;
    }
    res.push(cur);
  }
  return res;
}

export async function buildReceiptPdf(b: ReceiptPayload): Promise<Uint8Array> {
  const f = await loadFonts();
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(f.regular, { subset: true });
  const bold = await doc.embedFont(f.bold, { subset: true });
  const brand = hexColor(b.brand_color);
  const ink = rgb(0.13, 0.08, 0.06);
  const gray = rgb(0.46, 0.38, 0.31);

  let logo: PDFImage | null = null;
  const lg = await fetchLogo(b.logo_url);
  if (lg) {
    try {
      logo = lg.type === "png" ? await doc.embedPng(lg.bytes) : await doc.embedJpg(lg.bytes);
    } catch {
      logo = null;
    }
  }
  const logoDims = logo ? logo.scaleToFit(130, 46) : null;

  const width = PAGE_W - MARGIN * 2;
  const L = lines(b);

  // първо мерим височината
  const h = (ln: Line): number => {
    switch (ln.k) {
      case "gap": return ln.h;
      case "sep": return LH * 0.9;
      case "text": {
        const size = ln.size ?? FS;
        return wrap(ln.t, ln.bold ? bold : regular, size, width).length * size * 1.45;
      }
      case "row": {
        const size = ln.size ?? FS;
        const font = ln.bold ? bold : regular;
        const rw = font.widthOfTextAtSize(ln.r, size);
        return Math.max(1, wrap(ln.l, font, size, width - rw - 6).length) * size * 1.45;
      }
    }
  };
  const bodyH = L.reduce((s, ln) => s + h(ln), 0);
  const logoH = logoDims ? logoDims.height + 8 : 0;
  const pageH = Math.ceil(MARGIN * 2 + logoH + bodyH + 6);
  const page = doc.addPage([PAGE_W, pageH]);

  let y = pageH - MARGIN;
  if (logo && logoDims) {
    page.drawImage(logo, { x: (PAGE_W - logoDims.width) / 2, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
    y -= logoH;
  }

  for (const ln of L) {
    if (ln.k === "gap") {
      y -= ln.h;
    } else if (ln.k === "sep") {
      const yy = y - LH * 0.35;
      page.drawLine({ start: { x: MARGIN, y: yy }, end: { x: PAGE_W - MARGIN, y: yy }, thickness: 0.7, color: brand, dashArray: [3, 2] });
      y -= LH * 0.9;
    } else if (ln.k === "text") {
      const size = ln.size ?? FS;
      const font = ln.bold ? bold : regular;
      for (const part of wrap(ln.t, font, size, width)) {
        const x = ln.align === "center" ? (PAGE_W - font.widthOfTextAtSize(part, size)) / 2 : MARGIN;
        page.drawText(part, { x, y: y - size, size, font, color: ln.color ? brand : ln.gray ? gray : ink });
        y -= size * 1.45;
      }
    } else {
      const size = ln.size ?? FS;
      const font = ln.bold ? bold : regular;
      const rw = font.widthOfTextAtSize(ln.r, size);
      const color = ln.color ? brand : ink;
      const parts = wrap(ln.l, font, size, width - rw - 6);
      parts.forEach((part, i) => {
        page.drawText(part, { x: MARGIN, y: y - size, size, font, color });
        if (i === parts.length - 1) page.drawText(ln.r, { x: PAGE_W - MARGIN - rw, y: y - size, size, font, color });
        y -= size * 1.45;
      });
    }
  }

  doc.setTitle(b.kind === "credit" ? `Кредитно известие № ${String(b.number).padStart(10, "0")}` : `Електронна бележка № ${String(b.number).padStart(10, "0")}`);
  doc.setProducer("КасаБГ");
  return doc.save();
}
