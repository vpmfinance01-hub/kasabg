// Сглобява работния процес за самостоятелния n8n (без Gmail и без PDF.co модул).
import { writeFileSync } from "node:fs";

const SECRET = process.env.KB_SECRET;
const SUPA = process.env.KB_SUPA_URL;
const ANON = process.env.KB_SUPA_ANON;
if (!SECRET || !SUPA || !ANON) throw new Error("липсват KB_SECRET / KB_SUPA_URL / KB_SUPA_ANON");

const compose = String.raw`const b = $('Нова бележка').item.json.body;
const esc = (s) => String(s == null ? '' : s).split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');
const m2 = (n) => (Math.round(n * 100) / 100).toFixed(2);
const fq = (n) => String(Math.round(n * 1000) / 1000);
const bi = b.lang === 'bi';
const L = (bg, en) => (bi ? bg + ' / ' + en : bg);
const col = /^#[0-9a-fA-F]{6}$/.test(b.brand_color || '') ? b.brand_color : '#000000';
const logoOk = /^https:\/\/[^\s'"<>]+$/.test(b.logo_url || '');
const FONT = 'font-family:Courier New,monospace;font-size:13px;line-height:1.5;color:#000;';
const row = (l, r, x) => '<tr><td style="text-align:left;padding:1px 6px 1px 0;' + (x || '') + '">' + l + '</td><td style="text-align:right;padding:1px 0;white-space:nowrap;' + (x || '') + '">' + r + '</td></tr>';
const mid = (t, x) => '<tr><td colspan="2" style="text-align:center;' + (x || '') + '">' + t + '</td></tr>';
const sep = '<tr><td colspan="2" style="border-top:1px dashed ' + col + ';font-size:4px;line-height:6px">&nbsp;</td></tr>';
const logoRow = logoOk ? '<tr><td colspan="2" style="text-align:center;padding-bottom:8px"><img src="' + b.logo_url + '" alt="" style="max-width:160px;max-height:60px"></td></tr>' : '';
const credit = b.kind === 'credit';
const num = String(b.number).padStart(10, '0');
const head = logoRow + mid(credit ? L('КРЕДИТНО ИЗВЕСТИЕ', 'CREDIT NOTE') : L('ЕЛЕКТРОННА КАСОВА БЕЛЕЖКА', 'ELECTRONIC RECEIPT'), 'font-weight:bold;color:' + col) + sep
  + mid(esc(b.store_name), 'font-weight:bold') + (b.address ? mid(esc(b.address)) : '') + mid(L('ЕИК', 'Company ID') + ' ' + esc(b.eik))
  + (b.vat_number ? mid(L('ЗДДС N', 'VAT No.') + ' ' + esc(b.vat_number)) : '') + (b.domain ? mid(L('Онлайн магазин', 'Online shop') + ': ' + esc(b.domain)) : '') + sep;
let main = '';
if (credit) {
  const amount = Number(b.amount);
  const vatc = amount - amount / 1.2;
  const methods = {1: L('Банков превод', 'Bank transfer'), 2: L('Към картата', 'To the card'), 3: L('В брой', 'Cash'), 4: L('Друг начин', 'Other')};
  main = row(L('Кредитно известие №', 'Credit note No.'), num) + row(L('Към бележка №', 'Re: receipt No.'), String(b.orig_number).padStart(10, '0')) + row(L('Поръчка', 'Order'), esc(b.order_ref)) + row(L('Дата', 'Date'), esc(b.date)) + sep
    + row(L('ВЪЗСТАНОВЕНА СУМА', 'REFUNDED AMOUNT') + ' ' + esc(b.currency), m2(amount), 'font-size:16px;font-weight:bold;color:' + col)
    + row(L('в т.ч. ДДС 20%', 'incl. VAT 20%'), m2(vatc)) + row(L('Начин', 'Method') + ': ' + (methods[b.method_code] || methods[4]), m2(amount)) + sep
    + mid(L('Документ за възстановена сума по Алтернативния режим на Наредба Н-18. Не е фискален бон.', 'Refund document under the alternative regime of Ordinance N-18. Not a fiscal receipt.'), 'font-size:10px;padding-top:8px');
} else {
  let rows = ''; let count = 0; let frac = false;
  for (const i of (b.items || [])) {
    const qty = Number(i.quantity); const unit = Number(i.price) * 1.2; count += qty; if (!Number.isInteger(qty)) frac = true;
    rows += '<tr><td colspan="2" style="font-weight:bold;padding-top:6px">' + esc(i.name) + '</td></tr>' + row(fq(qty) + ' × ' + m2(unit), m2(unit * qty));
  }
  const total = Number(b.total); const discount = Number(b.discount || 0); const vat = total - total / 1.2;
  const pays = {1: L('Банков превод', 'Bank transfer'), 2: L('Карта', 'Card'), 3: L('Наложен платеж', 'Cash on delivery'), 4: L('Платежна услуга', 'Payment service'), 5: L('Друго', 'Other')};
  const pay = pays[b.paym_code] || pays[5];
  const showTime = b.time && b.time !== '00:00:00';
  main = row(L('Бележка №', 'Receipt No.'), num) + row(L('Поръчка', 'Order'), esc(b.order_ref)) + row(L('Дата', 'Date'), esc(b.date)) + (showTime ? row(L('Час', 'Time'), esc(b.time)) : '') + sep + rows + sep
    + (discount > 0 ? row(L('Отстъпка', 'Discount'), m2(discount)) : '') + row(L('ОБЩА СУМА', 'TOTAL') + ' ' + esc(b.currency), m2(total), 'font-size:16px;font-weight:bold;color:' + col)
    + row(L('в т.ч. ДДС 20%', 'incl. VAT 20%'), m2(vat)) + row(L('Плащане', 'Payment') + ': ' + pay, m2(total)) + sep + mid(frac ? (b.items || []).length + ' ' + L('ПОЗИЦИИ', 'LINES') : count + ' ' + L('АРТИКУЛА', 'ITEMS'))
    + mid(L('Документ по Алтернативния режим на Наредба Н-18. Не е фискален бон.', 'Document under the alternative regime of Ordinance N-18. Not a fiscal receipt.'), 'font-size:10px;padding-top:8px');
}
const table = '<table style="width:300px;margin:0 auto;border-collapse:collapse;' + FONT + '">' + head + main + '</table>';
const html = '<html><head><meta charset="utf-8"></head><body style="margin:0;padding:16px;background:#fff">' + table + '</body></html>';
const st = esc(b.store_name);
const intro = credit
  ? (bi ? '<p>Здравейте, / Hello,</p><p>По Вашата поръчка в <b>' + st + '</b> е възстановена сума. Кредитното известие е прикачено като PDF и е показано по-долу.<br><i>A refund was made on your order at <b>' + st + '</b>. The credit note is attached as a PDF and shown below.</i></p>' : '<p>Здравейте,</p><p>По Вашата поръчка в <b>' + st + '</b> е възстановена сума. Кредитното известие е прикачено като PDF и е показано по-долу.</p>')
  : (bi ? '<p>Здравейте, / Hello,</p><p>Благодарим за поръчката в <b>' + st + '</b>. Електронната касова бележка е прикачена като PDF и е показана по-долу.<br><i>Thank you for your order at <b>' + st + '</b>. Your electronic receipt is attached as a PDF and shown below.</i></p>' : '<p>Здравейте,</p><p>Благодарим за поръчката в <b>' + st + '</b>. Електронната касова бележка е прикачена като PDF и е показана по-долу.</p>');
const emailHtml = intro + '<div style="border:1px dashed #999;padding:12px;width:300px;margin:0 auto;background:#fff">' + table + '</div>';
return { json: {
  html, emailHtml,
  subject: credit ? (bi ? 'Кредитно известие № ' + num + ' / Credit note No. ' + num + ' от ' + b.store_name : 'Кредитно известие № ' + num + ' от ' + b.store_name) : (bi ? 'Електронна бележка № ' + num + ' / Receipt No. ' + num + ' от ' + b.store_name : 'Електронна бележка № ' + num + ' от ' + b.store_name),
  filename: (credit ? 'kreditno-' : 'belezhka-') + num + '.pdf',
  to: b.email, store_id: b.store_id,
} };`;

const APP = "http://app:3000"; // вътрешният адрес на сайта в Docker мрежата
const hdr = (name, value) => ({ name, value });
const secretFilter = (id, path) => ({
  conditions: {
    options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
    conditions: [{ id, leftValue: '={{ $json.headers["x-kasabg-secret"] }}', rightValue: SECRET, operator: { type: "string", operation: "equals" } }],
    combinator: "and",
  },
  options: {},
});

const NO_PDF = process.env.KB_NO_PDF === "1";
let nodes = [
  { id: "n1", name: "Нова бележка", type: "n8n-nodes-base.webhook", typeVersion: 2.2, position: [0, 0], webhookId: "0eade1f2-3dbb-4c8d-a296-27a42c18e0a6", parameters: { httpMethod: "POST", path: "kasabg-receipt", options: {} } },
  { id: "n2", name: "Проверка на тайния ключ", type: "n8n-nodes-base.filter", typeVersion: 2.2, position: [224, 0], parameters: secretFilter("secret-check") },
  { id: "n3", name: "Състави бележката", type: "n8n-nodes-base.code", typeVersion: 2, position: [448, 0], parameters: { mode: "runOnceForEachItem", jsCode: compose } },
  {
    id: "n4", name: "Направи PDF", type: "n8n-nodes-base.httpRequest", typeVersion: 4.3, position: [672, 0],
    parameters: {
      method: "POST", url: `${APP}/api/receipt-pdf`, sendHeaders: true, headerParameters: { parameters: [hdr("x-kasabg-secret", SECRET)] },
      sendBody: true, specifyBody: "json",
      jsonBody: '={{ JSON.stringify($("Нова бележка").item.json.body) }}',
      options: { response: { response: { responseFormat: "file" } } },
    },
  },
  {
    id: "n6", name: "Изпрати от пощата", type: "n8n-nodes-base.httpRequest", typeVersion: 4.3, position: [896, 0],
    parameters: {
      method: "POST", url: `${APP}/api/send-receipt`, sendHeaders: true, headerParameters: { parameters: [hdr("x-kasabg-secret", SECRET)] },
      sendBody: true, contentType: "multipart-form-data",
      bodyParameters: { parameters: [
        { name: "store_id", value: "={{ $('Състави бележката').item.json.store_id }}" },
        { name: "to", value: "={{ $('Състави бележката').item.json.to }}" },
        { name: "subject", value: "={{ $('Състави бележката').item.json.subject }}" },
        { name: "html", value: "={{ $('Състави бележката').item.json.emailHtml }}" },
        { name: "filename", value: "={{ $('Състави бележката').item.json.filename }}" },
        ...(process.env.KB_NO_PDF === "1" ? [] : [{ parameterType: "formBinaryData", name: "pdf", inputDataFieldName: "data" }]),
      ] },
      options: {},
    },
  },
  {
    id: "n7", name: "Отбележи като изпратена", type: "n8n-nodes-base.httpRequest", typeVersion: 4.3, position: [1344, 0],
    parameters: {
      method: "POST", url: `${SUPA}/rest/v1/rpc/mark_receipt_sent`, sendHeaders: true,
      headerParameters: { parameters: [hdr("apikey", ANON), hdr("Content-Type", "application/json")] },
      sendBody: true, specifyBody: "json",
      jsonBody: `={{ JSON.stringify({ p_receipt_id: $("Нова бележка").item.json.body.receipt_id, p_secret: "${SECRET}" }) }}`,
      options: {},
    },
  },
  // известие за неизпратени бележки
  { id: "a1", name: "Известие: неизпратени", type: "n8n-nodes-base.webhook", typeVersion: 2.2, position: [0, 360], webhookId: "5b1c7f0e-2d2a-4c3b-9d1e-7a1f0c9e4a11", parameters: { httpMethod: "POST", path: "kasabg-alert", options: {} } },
  { id: "a2", name: "Проверка на ключа (известие)", type: "n8n-nodes-base.filter", typeVersion: 2.2, position: [224, 360], parameters: secretFilter("secret-check-alert") },
  {
    id: "a3", name: "Прати известие на собственика", type: "n8n-nodes-base.httpRequest", typeVersion: 4.3, position: [448, 360],
    parameters: {
      method: "POST", url: `${APP}/api/platform-mail`, sendHeaders: true, headerParameters: { parameters: [hdr("x-kasabg-secret", SECRET)] },
      sendBody: true, specifyBody: "json",
      jsonBody: "={{ JSON.stringify({ to: $json.body.to, subject: 'КасаБГ: ' + $json.body.count + ' неизпратени бележки в ' + $json.body.store_name, html: '<p>Здравейте,</p><p>В магазин <b>' + $json.body.store_name + '</b> не успяхме да изпратим ' + $json.body.count + ' електронни бележки на клиентите, въпреки няколкото опита.</p><p>Бележки: ' + $json.body.numbers + '</p><p>Най-честата причина е грешна парола или блокирана фирмена поща. Влезте в КасаБГ, проверете „Настройки → Имейл на магазина“, изпратете тестов имейл и натиснете „Изпрати отново“ в раздел „Бележки“.</p>' }) }}",
      options: {},
    },
  },
];

if (NO_PDF) nodes = nodes.filter((n) => n.id !== "n4");

const c = (from, to) => ({ [from]: { main: [[{ node: to, type: "main", index: 0 }]] } });
const connections = {
  ...c("Нова бележка", "Проверка на тайния ключ"),
  ...c("Проверка на тайния ключ", "Състави бележката"),
  ...(NO_PDF
    ? c("Състави бележката", "Изпрати от пощата")
    : { ...c("Състави бележката", "Направи PDF"), ...c("Направи PDF", "Изпрати от пощата") }),
  ...c("Изпрати от пощата", "Отбележи като изпратена"),
  ...c("Известие: неизпратени", "Проверка на ключа (известие)"),
  ...c("Проверка на ключа (известие)", "Прати известие на собственика"),
};

const wf = { id: "kasabgReceipt01", name: "КасаБГ: изпращане на електронна бележка", nodes, connections, settings: { executionOrder: "v1" }, active: false };
writeFileSync(process.argv[2], JSON.stringify([wf], null, 2));
console.log("записан", process.argv[2], nodes.length, "възела");
