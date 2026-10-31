import { NextResponse } from "next/server";
import { anonClient } from "@/lib/mail";
import { parseWoo } from "@/lib/integrations/woocommerce";
import { parseShopify } from "@/lib/integrations/shopify";
import { parseGeneric } from "@/lib/integrations/generic";
import type { NormOrder, Parsed } from "@/lib/integrations/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const PARSERS: Record<string, (b: Record<string, any>) => Parsed> = {
  woocommerce: parseWoo,
  shopify: parseShopify,
  generic: parseGeneric,
};

// Приема webhook от магазин: /api/hooks/<woocommerce|shopify|generic>?key=<API ключ на магазина>
export async function POST(req: Request, ctx: { params: Promise<{ platform: string }> }) {
  const { platform } = await ctx.params;
  const parse = PARSERS[platform];
  if (!parse) return NextResponse.json({ status: "error", message: "unknown platform" }, { status: 404 });

  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!/^[0-9a-f]{32,64}$/i.test(key)) return NextResponse.json({ status: "error", message: "missing or invalid key" }, { status: 401 });

  const ctype = req.headers.get("content-type") ?? "";
  const raw = await req.text();
  if (raw.length > 2_000_000) return NextResponse.json({ status: "error", message: "payload too large" }, { status: 413 });

  // WooCommerce праща при създаване на webhook „пинг“ във форма (webhook_id=…): отговаряме успешно
  if (!ctype.includes("json") && /^webhook_id=/.test(raw)) return NextResponse.json({ status: "ok", message: "ping" });

  let body: Record<string, any>;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    return NextResponse.json({ status: "error", message: "invalid json" }, { status: 400 });
  }

  const parsed = parse(body);
  if (!parsed.ok) return NextResponse.json({ status: "ignored", reason: parsed.ignored });
  const o: NormOrder = parsed.order;

  const sb = anonClient();
  const { error } = await sb.rpc("ingest_order", {
    p_api_key: key,
    p_external_id: o.externalId,
    p_total: o.total,
    p_currency: o.currency,
    p_payment_method: o.paymentMethod,
    p_customer_name: o.customerName ?? null,
    p_customer_email: o.customerEmail ?? null,
    p_country: o.country ?? "BG",
    p_ordered_at: o.orderedAt,
    p_items: o.items,
    p_paym_code: o.paymentCode,
  });
  if (error) {
    // невалиден ключ → 401 (платформата не бива да повтаря безкрайно)
    const bad = /invalid api key/i.test(error.message);
    return NextResponse.json({ status: "error", message: bad ? "invalid key" : "could not save order" }, { status: bad ? 401 : 502 });
  }

  let refunds = 0;
  for (const r of o.refunds) {
    const { error: e2 } = await sb.rpc("ingest_refund", {
      p_api_key: key, p_order_ref: o.externalId, p_amount: r.amount, p_date: r.date, p_method: r.method, p_external_ref: r.externalRef,
    });
    if (!e2) refunds++;
  }
  return NextResponse.json({ status: "ok", order: o.externalId, items: o.items.length, refunds });
}

// Помощна проверка от браузър: показва, че адресът е жив (без данни).
export async function GET(_req: Request, ctx: { params: Promise<{ platform: string }> }) {
  const { platform } = await ctx.params;
  return NextResponse.json({ status: "ok", platform, method: "POST" });
}
