"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/components/LangProvider";

// Приема линк от писмо. Сесията идва в адреса (#access_token=…) и се прочита от клиента автоматично.
function Inner() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    const raw = params.get("next") ?? "/app";
    const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app";

    // грешка, върната от Supabase в адреса (изтекъл или използван линк)
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    const err = hash.get("error_description") ?? params.get("error_description");
    if (err) {
      setFailed(err.replace(/\+/g, " "));
      return;
    }

    const code = params.get("code");
    (async () => {
      if (code) await sb.auth.exchangeCodeForSession(code).catch(() => null);
      let { data } = await sb.auth.getSession();
      if (!data.session) {
        await new Promise((r) => setTimeout(r, 800));
        data = (await sb.auth.getSession()).data;
      }
      if (!data.session) return setFailed("link");
      // след линк за нова парола: към формата за парола
      const type = hash.get("type");
      router.replace(type === "recovery" ? "/reset" : next);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, router]);

  if (failed)
    return (
      <div className="card mx-auto mt-24 max-w-md space-y-3 text-center">
        <p>{failed === "link" ? t("Линкът е изтекъл или вече е използван.", "The link has expired or was already used.") : t("Входът не успя.", "Sign-in failed.")}</p>
        {failed !== "link" && <p className="text-xs text-muted">{failed}</p>}
        {failed === "link" && <Link href="/forgot" className="btn inline-block">{t("Поискай нов линк", "Request a new link")}</Link>}
        <div><Link href="/login" className="text-sm text-brand-dark">{t("Към вход", "To log in")}</Link></div>
      </div>
    );
  return <div className="p-10 text-center text-muted">{t("Влизане…", "Signing in…")}</div>;
}

export default function Callback() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted">…</div>}>
      <Inner />
    </Suspense>
  );
}