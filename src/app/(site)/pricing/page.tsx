"use client";
import Link from "next/link";
import { useState } from "react";
import { PLANS, YEARLY_DISCOUNT } from "@/lib/plans";
import { Reveal } from "@/components/site/Reveal";
import { Arrow, IcoCheck } from "@/components/site/Icons";
import { useLang, useT } from "@/components/LangProvider";

const keys = ["starter", "essential", "premium", "enterprise"] as const;

export default function Pricing() {
  const t = useT();
  const en = useLang() === "en";
  const [yearly, setYearly] = useState(false);
  const [orders, setOrders] = useState(300);
  const cashRegister = 25 + 0.04 * orders + 15; // примерна оценка: наем/сервиз + такси
  const plan = orders <= 100 ? PLANS.starter : orders <= 1000 ? PLANS.essential : PLANS.premium;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-10">
      <Reveal><div className="eyebrow">{t("Цени", "Pricing")}</div></Reveal>
      <Reveal delay={80}><h1 className="mt-4 max-w-3xl text-5xl sm:text-6xl">{t("Плащате според поръчките, не според броя на функциите.", "You pay by the number of orders, not by the number of features.")}</h1></Reveal>
      <Reveal delay={160}>
        <p className="mt-5 max-w-xl text-lg text-muted">{t("Всички планове включват лого и цветове на бележката, имейл от вашата поща, автоматичен повтор при грешка и одиторски файл за НАП. Цените са в евро, без ДДС.", "Every plan includes your logo and colours on the receipt, email from your own mailbox, automatic retry on errors and the audit file for the NRA. Prices are in euro, excluding VAT.")}</p>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-8 inline-flex rounded-xl border-[1.5px] border-foreground p-1 text-sm font-semibold" role="group" aria-label={t("Период на плащане", "Billing period")}>
          <button className={`rounded-lg px-4 py-1.5 transition ${yearly ? "" : "bg-foreground text-background"}`} onClick={() => setYearly(false)}>{t("Месечно", "Monthly")}</button>
          <button className={`rounded-lg px-4 py-1.5 transition ${yearly ? "bg-foreground text-background" : ""}`} onClick={() => setYearly(true)}>{t("Годишно", "Yearly")} −{Math.round(YEARLY_DISCOUNT * 100)}%</button>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {keys.map((k, i) => {
          const p = PLANS[k];
          const hot = k === "essential";
          const price = p.price ? Math.round(p.price * (yearly ? 1 - YEARLY_DISCOUNT : 1)) : null;
          return (
            <Reveal key={k} delay={i * 90}>
              <div className={`lift relative flex h-full flex-col rounded-2xl border-[1.5px] border-foreground p-6 ${hot ? "bg-ink text-ink-text" : "bg-card"}`}>
                {hot && <span className="absolute -top-3 left-5 rounded-md bg-sun px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#1b1b1b]">{t("За повечето магазини", "For most shops")}</span>}
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">{p.name}</h3>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-6xl font-extrabold leading-none">{price ?? "—"}</span>
                  {price !== null && <span className={`text-sm ${hot ? "text-ink-soft" : "text-muted"}`}>{t("€ / месец", "€ / month")}</span>}
                </div>
                <p className={`mt-3 text-sm ${hot ? "text-ink-soft" : "text-muted"}`}>{en ? p.blurbEn : p.blurb}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {[
                    t("Бележки и кредитни известия", "Receipts and credit notes"),
                    t("Месечен файл за НАП", "Monthly file for the NRA"),
                    k === "enterprise" ? t("Помощ при внедряване", "Help with onboarding") : t("Достъп за счетоводител", "Accountant access"),
                  ].map((x) => (
                    <li key={x} className="flex items-start gap-2"><IcoCheck className={`mt-0.5 h-5 w-5 shrink-0 ${hot ? "text-sun" : "text-sage"}`} />{x}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <p className={`mb-3 text-xs ${hot ? "text-ink-soft" : "text-muted"}`}>{p.price ? t("14 дни безплатно", "14 days free") : t("Свържете се с нас", "Get in touch")}</p>
                  <Link href={p.price ? "/register" : "/contact"} className={`btn w-full text-sm ${hot ? "btn-on-ink" : ""}`}>
                    {p.price ? t("Започни", "Start") : t("Пишете ни", "Write to us")} <Arrow />
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <div className="mt-24 grid gap-8 rounded-3xl border-[1.5px] border-foreground bg-card p-8 lg:grid-cols-[1fr_1fr] lg:p-12">
          <div>
            <h2 className="text-3xl sm:text-4xl">{t("Касов апарат или КасаБГ?", "A cash register or KasaBG?")}</h2>
            <p className="mt-3 text-muted">{t("Плъзнете, колкото поръчки правите на месец.", "Slide to the number of orders you get each month.")}</p>
            <label className="mt-8 block font-mono text-sm" htmlFor="ord">{t("Поръчки на месец:", "Orders per month:")} <b className="text-2xl text-brand">{orders}</b></label>
            <input id="ord" type="range" min={10} max={5000} step={10} value={orders} onChange={(e) => setOrders(+e.target.value)} className="mt-3 w-full accent-[var(--brand)]" />
            <p className="mt-4 text-xs text-muted">{t("Стойността за касовия апарат е груба оценка (наем, сервиз, такси) и подлежи на уточнение при вас.", "The cash register figure is a rough estimate (rental, servicing, fees) and needs to be confirmed for your case.")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 self-center text-center">
            <div className="rounded-2xl border border-line bg-accent/60 p-6">
              <div className="eyebrow !text-muted">{t("Касов апарат", "Cash register")}</div>
              <div className="mt-2 font-[family-name:var(--font-display)] text-5xl font-extrabold tabular-nums">{cashRegister.toFixed(0)}<span className="text-2xl"> €</span></div>
            </div>
            <div className="rounded-2xl bg-ink p-6 text-ink-text">
              <div className="eyebrow !text-sun">{t("КасаБГ", "KasaBG")} · {plan.name}</div>
              <div className="mt-2 font-[family-name:var(--font-display)] text-5xl font-extrabold tabular-nums">{plan.price}<span className="text-2xl"> €</span></div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
