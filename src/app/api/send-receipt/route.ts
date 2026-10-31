import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { anonClient, sendWithSmtp, explainSmtpError, platformSmtp, type Smtp } from "@/lib/mail";

export const runtime = "nodejs";
export const maxDuration = 30;

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// Вика се от n8n. Праща бележката от пощата на магазина, ако е настроена и проверена.
// Отговор: { status: "sent" | "no_smtp" | "error" }
export async function POST(req: Request) {
  const secret = process.env.N8N_SECRET ?? "";
  const given = req.headers.get("x-kasabg-secret") ?? "";
  if (!secret || !safeEqual(given, secret)) return NextResponse.json({ status: "forbidden" }, { status: 403 });

  // бърза проверка от n8n: има ли магазинът проверена фирмена поща
  if ((req.headers.get("content-type") ?? "").includes("application/json")) {
    const { store_id: sid } = (await req.json().catch(() => ({}))) as { store_id?: string };
    if (!sid || !/^[0-9a-f-]{36}$/i.test(sid)) return NextResponse.json({ configured: false }, { status: 400 });
    const r = await anonClient().rpc("get_store_smtp_for_send", { p_store: sid, p_secret: secret });
    return NextResponse.json({ configured: !r.error && !!r.data });
  }

  const form = await req.formData();
  const storeId = String(form.get("store_id") ?? "");
  const to = String(form.get("to") ?? "");
  const subject = String(form.get("subject") ?? "");
  const html = String(form.get("html") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(storeId) || !to || !subject || !html || html.length > 1_000_000) {
    return NextResponse.json({ status: "error", message: "bad request" }, { status: 400 });
  }

  const { data, error } = await anonClient().rpc("get_store_smtp_for_send", { p_store: storeId, p_secret: secret });
  if (error) return NextResponse.json({ status: "error", message: "settings lookup failed" }, { status: 502 });
  // без своя поща магазинът изпраща от общата поща на платформата, ако е настроена
  const smtp = (data as Smtp | null) ?? platformSmtp();
  // без никаква поща не връщаме „успех“: n8n не бива да отбележи бележката като изпратена
  if (!smtp) return NextResponse.json({ status: "no_smtp", message: "Няма настроена поща нито за магазина, нито за платформата." }, { status: 503 });

  const attachments: { filename: string; content: Buffer; contentType?: string }[] = [];
  const pdf = form.get("pdf");
  if (pdf && typeof pdf !== "string") {
    attachments.push({
      filename: String(form.get("filename") ?? "belezhka.pdf").replace(/[^\w.\-]+/g, "_"),
      content: Buffer.from(await pdf.arrayBuffer()),
      contentType: "application/pdf",
    });
  }

  try {
    await sendWithSmtp(smtp, { to, subject, html, attachments });
    return NextResponse.json({ status: "sent" });
  } catch (e) {
    return NextResponse.json({ status: "error", message: explainSmtpError(e) }, { status: 502 });
  }
}
