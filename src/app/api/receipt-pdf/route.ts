import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { buildReceiptPdf, type ReceiptPayload } from "@/lib/receiptPdf";

export const runtime = "nodejs";
export const maxDuration = 30;

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// Вика се от n8n с данните на бележката. Връща PDF.
export async function POST(req: Request) {
  const secret = process.env.N8N_SECRET ?? "";
  if (!secret || !safeEqual(req.headers.get("x-kasabg-secret") ?? "", secret)) return NextResponse.json({ status: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as ReceiptPayload | null;
  if (!body || typeof body !== "object" || body.number == null || !body.store_name || !body.order_ref) {
    return NextResponse.json({ status: "error", message: "bad request" }, { status: 400 });
  }
  if ((body.items?.length ?? 0) > 200) return NextResponse.json({ status: "error", message: "too many items" }, { status: 400 });

  try {
    const pdf = await buildReceiptPdf(body);
    return new NextResponse(Buffer.from(pdf), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="belezhka.pdf"', "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json({ status: "error", message: e instanceof Error ? e.message.slice(0, 200) : "pdf failed" }, { status: 500 });
  }
}
