// Изпращане през SMTP на магазина. Само за сървърни маршрути.
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { makeT, type T } from "./i18n.ts";

export type Smtp = { from_name: string; from_email: string; host: string; port: number; secure: boolean; user: string; password: string };

export const anonClient = (accessToken?: string) =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
  });

const clean = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function sendWithSmtp(
  smtp: Smtp,
  msg: { to: string; subject: string; html: string; attachments?: { filename: string; content: Buffer; contentType?: string }[] }
) {
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.password },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 25000,
  });
  const name = clean(smtp.from_name).replace(/"/g, "");
  return transport.sendMail({
    from: name ? `"${name}" <${clean(smtp.from_email)}>` : clean(smtp.from_email),
    replyTo: clean(smtp.from_email),
    to: clean(msg.to),
    subject: clean(msg.subject),
    html: msg.html,
    attachments: msg.attachments,
  });
}

/** Обща поща на платформата (PLATFORM_SMTP_*). Ползва се, когато магазинът няма своя, и за служебни известия. */
export function platformSmtp(): Smtp | null {
  const e = process.env;
  if (!e.PLATFORM_SMTP_HOST || !e.PLATFORM_SMTP_USER || !e.PLATFORM_SMTP_PASSWORD) return null;
  const port = Number(e.PLATFORM_SMTP_PORT ?? 465);
  return {
    from_name: e.PLATFORM_SMTP_FROM_NAME ?? "КасаБГ",
    from_email: e.PLATFORM_SMTP_FROM_EMAIL ?? e.PLATFORM_SMTP_USER,
    host: e.PLATFORM_SMTP_HOST,
    port,
    secure: e.PLATFORM_SMTP_SECURE ? e.PLATFORM_SMTP_SECURE === "true" : port === 465,
    user: e.PLATFORM_SMTP_USER,
    password: e.PLATFORM_SMTP_PASSWORD,
  };
}

/** Понятно съобщение за най-честите SMTP грешки. */
export function explainSmtpError(e: unknown, t: T = makeT("bg")): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/EAUTH|Invalid login|535|534|Username and Password not accepted/i.test(m))
    return t("Gmail отказа вход. Нужна е парола за приложение (16 символа), създадена в същия Google акаунт", "Gmail rejected the login. An app password (16 characters) created in the same Google account is needed");
  if (/ENOTFOUND|EAI_AGAIN/i.test(m)) return t("Не може да се намери SMTP сървърът. Проверете адреса (хоста).", "The SMTP server cannot be found. Check the address (host).");
  if (/ETIMEDOUT|ECONNREFUSED|ESOCKET|timeout/i.test(m)) return t("Няма връзка със сървъра. Проверете порта и опцията „SSL“ (465 = SSL, 587 = STARTTLS).", "Cannot connect to the server. Check the port and the “SSL” option (465 = SSL, 587 = STARTTLS).");
  if (/wrong version number|SSL|TLS/i.test(m)) return t("Грешка в защитата на връзката. Опитайте порт 465 с „SSL“ или порт 587 без „SSL“.", "Connection security error. Try port 465 with “SSL” or port 587 without “SSL”.");
  return m.slice(0, 200);
}
