import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendWithSmtp, explainSmtpError, platformSmtp } from "@/lib/mail";

export const runtime = "nodejs";
export const maxDuration = 30;

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// Вика се от n8n за служебни известия (напр. неизпратени бележки) от общата поща на платформата.
export async function POST(req: Request) {
  const secret = process.env.N8N_SECRET ?? "";
  if (!secret || !safeEqual(req.headers.get("x-kasabg-secret") ?? "", secret)) return NextResponse.json({ status: "forbidden" }, { status: 403 });
  const smtp = platformSmtp();
  if (!smtp) return NextResponse.json({ status: "no_smtp" }, { status: 503 });

  const { to, subject, html } = (await req.json().catch(() => ({}))) as { to?: string; subject?: string; html?: string };
  if (!to || !subject || !html || html.length > 200_000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ status: "error", message: "bad request" }, { status: 400 });
  try {
    await sendWithSmtp(smtp, { to, subject, html });
    return NextResponse.json({ status: "sent" });
  } catch (e) {
    return NextResponse.json({ status: "error", message: explainSmtpError(e) }, { status: 502 });
  }
}
