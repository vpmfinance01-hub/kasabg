"use client";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store, Member } from "@/lib/types";
import { useT } from "@/components/LangProvider";

export default function Team({ store }: { store: Store }) {
  const t = useT();
  const sb = supabaseBrowser();
  const [members, setMembers] = useState<Member[]>([]);

  const load = useCallback(async () => {
    const { data } = await sb.from("store_members").select("*").eq("store_id", store.id).order("created_at");
    setMembers(data ?? []);
  }, [sb, store.id]);
  useEffect(() => {
    load();
  }, [load]);

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email")).trim().toLowerCase();
    await sb.from("store_members").insert({ store_id: store.id, email });
    form.reset();
    load();
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-bold">{t("Достъп за счетоводител", "Accountant access")}</h3>
        <p className="mt-1 text-sm text-muted">
          {t("Добавете имейла на счетоводителя. Когато се регистрира или влезе с него в КасаБГ, ще вижда поръчките на този магазин, ще сваля XML и ще отбелязва подаването. Не може да променя данни или да трие.", "Add your accountant's email. When they sign up or log in to KasaBG with it, they will see this shop's orders, download the XML and mark it as filed. They cannot change or delete data.")}
        </p>
        <form onSubmit={invite} className="mt-3 flex gap-2">
          <input name="email" type="email" required placeholder="schetovoditel@example.com" className="input" />
          <button className="btn">{t("Добави", "Add")}</button>
        </form>
      </div>
      <div className="card">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between border-b border-line py-2 last:border-0">
            <span>{m.email} <span className="text-xs text-muted">· {t("счетоводител", "accountant")}</span></span>
            <button
              className="text-sm text-brand-dark"
              onClick={async () => {
                await sb.from("store_members").delete().eq("id", m.id);
                load();
              }}
            >
              {t("Премахни", "Remove")}
            </button>
          </div>
        ))}
        {members.length === 0 && <div className="text-center text-muted">{t("Още няма добавени счетоводители", "No accountants added yet")}</div>}
      </div>
    </div>
  );
}
