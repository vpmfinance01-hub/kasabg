// Прост CSV парсер (запетая или точка и запетая, кавички).
export function parseCsv(text: string): Record<string, string>[] {
  const clean = text.replace(/^\uFEFF/, "");
  const first = clean.split(/\r?\n/)[0] ?? "";
  const sep = (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let cur: string[] = [], field = "", q = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (q) {
      if (ch === '"' && clean[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') q = false;
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { cur.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      cur.push(field); field = "";
      if (cur.some((x) => x.trim() !== "")) rows.push(cur);
      cur = [];
    } else field += ch;
  }
  cur.push(field);
  if (cur.some((x) => x.trim() !== "")) rows.push(cur);
  const head = (rows.shift() ?? []).map((h) => h.trim().toLowerCase());
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}

export const PAYMENT_CODES: Record<string, number> = {
  bank: 1, transfer: 1, "банков превод": 1,
  card: 2, vpos: 2, карта: 2,
  cod: 3, "наложен платеж": 3,
  paypal: 4, stripe: 4, service: 4,
  other: 5,
};

export const CSV_TEMPLATE =
  "order_id,date,total,currency,email,name,payment,pos_n,rrn,processor_eik,item_name,item_qty,item_price_no_vat\n" +
  "1001,2026-09-03,23.99,EUR,client@example.com,Иван Иванов,card,VPOS-77,RRN123456789,130175000,Чаша за кафе,2,9.99\n" +
  "1002,2026-09-10,45.00,EUR,,Мария Петрова,cod,,,,Комплект чинии,1,37.50\n";
