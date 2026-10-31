"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store, Order, Refund } from "@/lib/types";
import Overview from "@/components/dash/Overview";
import Orders from "@/components/dash/Orders";
import Refunds from "@/components/dash/Refunds";
import Receipts from "@/components/dash/Receipts";
import Team from "@/components/dash/Team";
import Settings from "@/components/dash/Settings";
import Declaration from "@/components/dash/Declaration";
import ThemeToggle from "@/components/ThemeToggle";
import { Logo } from "@/components/SiteChrome";
import { LangToggle, useT } from "@/components/LangProvider";

const STORE_COLS = "id,owner_id,name,platform,eik,website,plan,created_at,nap_shop_number,is_marketplace,trial_ends_at,subscription_status,current_period_end,address,vat_number,logo_url,brand_color,receipt_lang";

type Tab = "overview" | "orders" | "receipts" | "refunds" | "team" | "settings";

export default function Dashboard() {
  const t = useT();
  const router = useRouter();
  const sb = supabaseBrowser();
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("shop");
  const [admin, setAdmin] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [ready, setReady] = useState(false);
  const [adding, setAdding] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [now] = useState(() => Date.now());

  const base = stores.find((s) => s.id === selId) ?? null;
  const sel: Store | null = base ? { ...base, api_key: apiKey } : null;
  const isOwner = !!base && base.owner_id === uid;

  const loadStores = useCallback(async () => {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return router.replace("/login");
    setUid(u.user.id);
    setEmail(u.user.email ?? "");
    setRole((u.user.user_metadata?.role as string) ?? "shop");
    sb.rpc("is_platform_admin").then(({ data }) => setAdmin(data === true));
    const { data } = await sb.from("stores").select(STORE_COLS).order("created_at");
    setStores((data as unknown as Store[]) ?? []);
    setSelId((cur) => cur ?? data?.[0]?.id ?? null);
    setReady(true);
  }, [sb, router]);

  const loadData = useCallback(
    async (id: string) => {
      const [o, r] = await Promise.all([
        sb.from("orders").select("*").eq("store_id", id).order("ordered_at", { ascending: false }).limit(2000),
        sb.from("refunds").select("*").eq("store_id", id).order("refunded_at", { ascending: false }),
      ]);
      setOrders((o.data as Order[]) ?? []);
      setRefunds((r.data as Refund[]) ?? []);
    },
    [sb]
  );

  useEffect(() => {
    loadStores();
  }, [loadStores]);
  useEffect(() => {
    if (selId) loadData(selId);
  }, [selId, loadData]);
  useEffect(() => {
    setApiKey("");
    if (selId && isOwner) sb.rpc("get_api_key", { sid: selId }).then(({ data }) => setApiKey((data as string) ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId, isOwner]);

  async function createStore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { data } = await sb
      .from("stores")
      .insert({ name: f.get("name"), eik: f.get("eik"), website: f.get("website"), platform: f.get("platform") })
      .select(STORE_COLS)
      .single();
    if (data) {
      setAdding(false);
      setSelId(data.id);
      await loadStores();
    }
  }

  if (!ready) return <div className="p-10 text-center text-muted">{t("Зареждане…", "Loading…")}</div>;

  const tabs: [Tab, string][] = [
    ["overview", t("Преглед", "Overview")],
    ["orders", t("Поръчки", "Orders")],
    ["receipts", t("Бележки", "Receipts")],
    ["refunds", t("Възстановени суми", "Refunds")],
    ...(isOwner ? ([["team", t("Счетоводител", "Accountant")], ["settings", t("Настройки", "Settings")]] as [Tab, string][]) : []),
  ];
  const trialDays = sel ? Math.ceil((new Date(sel.trial_ends_at).getTime() - now) / 86400000) : 0;
  // същото правило като в базата (private.store_active): 3 дни толеранс
  const stopped = !!sel && (
    sel.subscription_status === "trial"
      ? trialDays + 3 <= 0
      : sel.subscription_status === "active"
        ? false
        : !!sel.current_period_end && new Date(sel.current_period_end).getTime() + (sel.subscription_status === "past_due" ? 3 * 86400000 : 0) <= now
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label={t("КасаБГ, начало", "KasaBG, home")}><Logo /></Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted sm:inline">{email}</span>
          <LangToggle className="!h-9" />
          <ThemeToggle className="!h-9 !w-9" />
          {admin && <Link href="/admin" className="font-semibold text-brand-dark">Admin</Link>}
          <Link href="/help" className="font-semibold text-brand-dark">{t("Помощ", "Help")}</Link>
          <button
            className="btn btn-ghost !py-1.5 text-sm"
            onClick={async () => {
              await sb.auth.signOut();
              router.push("/");
            }}
          >
            {t("Изход", "Log out")}
          </button>
        </div>
      </div>

      {stores.length === 0 && role === "accountant" && (
        <div className="card mx-auto mt-10 max-w-md space-y-3 text-center">
          <h1 className="text-2xl font-bold">{t("Очаква се достъп", "Waiting for access")}</h1>
          <p className="text-sm text-muted">
            {t("Още няма магазини, споделени с", "No shops have been shared with")} <b>{email}</b>{t(". Дайте този имейл на клиента си и го помолете да го добави в раздел „Счетоводител“. След това опреснете страницата.", " yet. Give this email to your client and ask them to add it in the “Accountant” section. Then refresh the page.")}
          </p>
          <button className="btn" onClick={() => location.reload()}>{t("Опресни", "Refresh")}</button>
          <button className="block w-full text-sm text-brand-dark" onClick={() => setRole("shop")}>
            {t("Всъщност имам собствен магазин", "Actually, I have my own shop")}
          </button>
        </div>
      )}

      {((stores.length === 0 && role !== "accountant") || adding) && (
        <form onSubmit={createStore} className="card mx-auto mt-8 max-w-md space-y-3">
          <h1 className="text-2xl font-bold">{stores.length === 0 ? t("Добавете първия си магазин", "Add your first shop") : t("Нов магазин", "New shop")}</h1>
          <p className="text-sm text-muted">
            {t("Ако сте счетоводител, не създавайте магазин. Помолете клиента да добави имейла ви в раздел „Счетоводител“.", "If you are an accountant, do not create a shop. Ask your client to add your email in the “Accountant” section.")}
          </p>
          <input name="name" required placeholder={t("Име на магазина", "Shop name")} className="input" />
          <input name="eik" placeholder={t("ЕИК", "Company ID (EIK)")} className="input" />
          <input name="website" placeholder={t("Домейн (shop.bg)", "Domain (shop.bg)")} className="input" />
          <select name="platform" className="input">
            {["shopify", "woocommerce", "wix", "prestashop", "api"].map((p) => <option key={p}>{p}</option>)}
          </select>
          <div className="flex gap-2">
            <button className="btn flex-1">{t("Създай", "Create")}</button>
            {adding && <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>{t("Отказ", "Cancel")}</button>}
          </div>
        </form>
      )}

      {stores.length > 0 && !adding && sel && (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {stores.map((s) => (
              <button key={s.id} onClick={() => setSelId(s.id)} className={`btn text-sm ${selId === s.id ? "" : "btn-ghost"}`}>
                {s.name}{s.owner_id !== uid ? t(" (счетоводител)", " (accountant)") : ""}
              </button>
            ))}
            {(role !== "accountant" || stores.some((x) => x.owner_id === uid)) && (
              <button className="btn btn-ghost text-sm" onClick={() => setAdding(true)}>{t("+ Магазин", "+ Shop")}</button>
            )}
          </div>

          {isOwner && (
            <div className={`mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl p-3 text-sm ${stopped ? "bg-red-50 text-red-900" : "bg-accent"}`}>
              <span>
                {t("План", "Plan")} <b className="capitalize">{sel.plan}</b> ·{" "}
                {sel.subscription_status === "active"
                  ? t("активен", "active")
                  : sel.subscription_status === "past_due"
                    ? t("неплатена фактура", "payment overdue")
                    : sel.subscription_status === "canceled"
                      ? t("прекратен", "cancelled")
                      : trialDays > 0
                        ? t(`безплатен пробен период: остават ${trialDays} дни`, `free trial: ${trialDays} days left`)
                        : t("пробният период е изтекъл", "the trial has ended")}
                {stopped && t(" · изпращането на бележки е спряно. Новите бележки се пазят и тръгват веднага след избор на план.", " · sending receipts is paused. New receipts are kept and go out as soon as you choose a plan.")}
              </span>
              {(stopped || sel.subscription_status !== "active") && (
                <button className="font-semibold text-brand-dark" onClick={() => setTab("settings")}>{t("Избор на план", "Choose a plan")}</button>
              )}
            </div>
          )}

          {isOwner && <Declaration key={`d-${sel.id}`} store={sel} />}

          <div className="mt-6 flex flex-wrap gap-1 border-b border-line">
            {tabs.map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-4 py-2 text-sm font-semibold ${tab === k ? "border-b-2 border-brand text-brand-dark" : "text-muted"}`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === "overview" && <Overview store={sel} orders={orders} refunds={refunds} />}
            {tab === "orders" && <Orders store={sel} orders={orders} reload={() => loadData(sel.id)} readOnly={!isOwner} />}
            {tab === "receipts" && <Receipts store={sel} readOnly={!isOwner} />}
            {tab === "refunds" &&<Refunds store={sel} refunds={refunds} reload={() => loadData(sel.id)} readOnly={!isOwner} />}
            {tab === "team" && isOwner && <Team store={sel} />}
            {tab === "settings" && isOwner && (
              <Settings
                store={sel}
                onSaved={(s) => setStores((all) => all.map((x) => (x.id === s.id ? s : x)))}
                onDeleted={() => {
                  setStores((all) => all.filter((x) => x.id !== sel.id));
                  setSelId(null);
                  setTab("overview");
                  loadStores();
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
