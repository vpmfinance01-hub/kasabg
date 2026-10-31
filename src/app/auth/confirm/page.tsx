"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/components/LangProvider";

const TYPES: EmailOtpType[] = ["recovery", "signup", "email", "invite", "magiclink", "email_change"];

// Потвърждава линк от писмо по token_hash. Работи във всеки браузър и устройство,
// за разлика от PKCE кода, който изисква същия браузър, от който е поискано писмото.
function Inner() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const tokenHash = params.get("token_hash");
    const type = params.get("type") as EmailOtpType | null;
    const raw = params.get("next") ?? "/app";
    const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app";
    if (!tokenHash || !type || !TYPES.includes(type)) {
      setFailed(true);
      return;
    }
    supabaseBrowser()
      .auth.verifyOtp({ token_hash: tokenHash, type })
      .then(({ error }) => {
        if (error) setFailed(true);
        else router.replace(next);
      });
  }, [params, router]);

  if (failed)
    return (
      <div className="card mx-auto mt-24 max-w-md space-y-3 text-center">
        <p>{t("Линкът е изтекъл или вече е използван.", "The link has expired or was already used.")}</p>
        <Link href="/forgot" className="btn inline-block">{t("Поискай нов линк", "Request a new link")}</Link>
        <div><Link href="/login" className="text-sm text-brand-dark">{t("Към вход", "To log in")}</Link></div>
      </div>
    );
  return <div className="p-10 text-center text-muted">{t("Потвърждаване…", "Confirming…")}</div>;
}

export default function Confirm() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted">…</div>}>
      <Inner />
    </Suspense>
  );
}