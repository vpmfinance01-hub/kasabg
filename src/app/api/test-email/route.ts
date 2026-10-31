import { NextResponse } from "next/server";
import { anonClient, sendWithSmtp, explainSmtpError, type Smtp } from "@/lib/mail";
import { tFromRequest } from "@/lib/i18n";

export const runtime = "nodejs";
export const maxDuration = 30;

// Вика се от таблото. Праща тестов имейл от пощата на магазина до самата нея и отбелязва проверката.
export async function POST(req: Request) {
  const t = tFromRequest(req);
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ ok: false, message: t("Не сте влезли.", "You are not logged in.") }, { status: 401 });

  const { store_id: storeId } = (await req.json().catch(() => ({}))) as { store_id?: string };
  if (!storeId || !/^[0-9a-f-]{36}$/i.test(storeId)) return NextResponse.json({ ok: false, message: t("Липсва магазин.", "No shop given.") }, { status: 400 });

  const sb = anonClient(token);
  const { data, error } = await sb.rpc("get_store_smtp_owner", { p_store: storeId });
  if (error) return NextResponse.json({ ok: false, message: t("Нямате право да променяте този магазин.", "You are not allowed to change this shop.") }, { status: 403 });
  if (!data) return NextResponse.json({ ok: false, message: t("Първо запазете настройките и паролата.", "Save the settings and the password first.") }, { status: 400 });
  const smtp = data as Smtp;

  try {
    await sendWithSmtp(smtp, {
      to: smtp.from_email,
      subject: t("Тест на пощата за електронни бележки (КасаБГ)", "Test of the mailbox for electronic receipts (KasaBG)"),
      html: t("<p>Здравейте,</p><p>Това е тестово писмо от КасаБГ. Пощата на магазина е настроена правилно и бележките към клиентите ще се изпращат от този адрес.</p>", "<p>Hello,</p><p>This is a test message from KasaBG. The shop mailbox is set up correctly and receipts to customers will be sent from this address.</p>"),
    });
    await sb.rpc("set_store_email_status", { p_store: storeId, p_ok: true });
    return NextResponse.json({ ok: true, message: t(`Тестовото писмо е изпратено до ${smtp.from_email}.`, `The test message was sent to ${smtp.from_email}.`) });
  } catch (e) {
    const message = explainSmtpError(e, t);
    await sb.rpc("set_store_email_status", { p_store: storeId, p_ok: false, p_error: message });
    return NextResponse.json({ ok: false, message }, { status: 200 });
  }
}
