import { NextResponse } from "next/server";
import { anonClient } from "@/lib/mail";
import { DECLARATION_VERSION, validate, warnings, type Answers } from "@/lib/declaration";
import { tFromRequest } from "@/lib/i18n";

export const runtime = "nodejs";

// Записва декларацията на магазина. IP адресът и браузърът се вземат от заявката, не от клиента.
export async function POST(req: Request) {
  const t = tFromRequest(req);
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ ok: false, message: t("Не сте влезли.", "You are not logged in.") }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { store_id?: string; answers?: Answers; version?: number; lang?: string };
  if (!body.store_id || !/^[0-9a-f-]{36}$/i.test(body.store_id) || !body.answers)
    return NextResponse.json({ ok: false, message: t("Липсват данни.", "Data is missing.") }, { status: 400 });
  if (body.version !== DECLARATION_VERSION)
    return NextResponse.json({ ok: false, message: t("Въпросите са обновени. Презаредете страницата.", "The questions have been updated. Reload the page.") }, { status: 409 });

  const errors = validate(body.answers, t);
  if (errors.length) return NextResponse.json({ ok: false, message: errors[0], errors }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  const stored = { ...body.answers, shown_lang: body.lang === "en" ? "en" : "bg", warnings: warnings(body.answers).map((w) => w.text) };
  const { data, error } = await anonClient(token).rpc("save_declaration", {
    p_store: body.store_id,
    p_version: DECLARATION_VERSION,
    p_answers: stored,
    p_ip: ip,
    p_ua: req.headers.get("user-agent") ?? "",
  });
  if (error) return NextResponse.json({ ok: false, message: t("Не успяхме да запишем декларацията.", "We could not save the declaration.") }, { status: 403 });
  return NextResponse.json({ ok: true, id: data });
}
