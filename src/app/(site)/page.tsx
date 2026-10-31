import Link from "next/link";
import HeroReceipt from "@/components/site/HeroReceipt";
import { Reveal, Spot } from "@/components/site/Reveal";
import { Arrow, IcoFolder, IcoPalette, IcoReceipt, IcoRetry, IcoUndo, IcoCheck } from "@/components/site/Icons";
import { getT } from "@/lib/i18n-server";

const recent = [
  ["0000000127", "#4821", "66.57", "sent"],
  ["0000000126", "#4820", "24.00", "sent"],
  ["0000000125", "#4819", "112.80", "retry"],
  ["0000000124", "#4818", "9.90", "sent"],
] as const;

export default async function Home() {
  const t = await getT();

  const platforms = [
    "WooCommerce", "Shopify", "Make", "Zapier",
    t("CSV файл", "CSV file"), t("собствен магазин (JSON)", "your own shop (JSON)"),
    t("PrestaShop през Make", "PrestaShop via Make"), t("Wix през Make", "Wix via Make"),
  ];

  const timeline = [
    ["01", t("Клиентът плаща", "The customer pays"), t("Магазинът ви праща поръчката към КасаБГ: автоматично от WooCommerce и Shopify, а от другите платформи през Make, Zapier или CSV.", "Your shop sends the order to KasaBG: automatically from WooCommerce and Shopify, and from other platforms through Make, Zapier or CSV.")],
    ["02", t("Бележката тръгва", "The receipt goes out"), t("Получава номер в редицата на вашия магазин и излиза като PDF и като текст в самото писмо, от вашата фирмена поща.", "It gets the next number in your shop's own sequence and leaves as a PDF and as text in the email itself, from your company mailbox.")],
    ["03", t("Месецът се затваря", "The month closes"), t("Преди 15-о число таблото проверява данните и ви казва какво липсва: ЕИК, номер от НАП, поръчки без имейл.", "Before the 15th the dashboard checks your data and tells you what is missing: company ID, NRA shop number, orders without an email.")],
    ["04", t("Подавате файла", "You file the report"), t("Вие или счетоводителят ви сваляте одиторския файл (и пакет с таблици) и го подавате към НАП.", "You or your accountant download the audit file (and a package of tables) and submit it to the Bulgarian NRA.")],
  ];

  const compare: [string, string, string][] = [
    [t("Устройство", "Equipment"), t("Фискално устройство, регистрация и сервиз", "A fiscal device, registration and servicing"), t("Нищо за купуване. Работи през браузъра", "Nothing to buy. Works in the browser")],
    [t("Бележка към клиента", "Receipt to the customer"), t("Хартиен бон или ръчно изпращане", "A paper slip or sending it by hand"), t("PDF по имейл, с вашето лого", "A PDF by email, with your logo")],
    [t("Месечен отчет", "Monthly report"), t("Ръчно събиране на данни", "Collecting data by hand"), t("Готов файл с проверки за грешки", "A ready file with error checks")],
    [t("Възстановена сума", "Refunds"), t("Ръчен документ", "A manual document"), t("Кредитно известие към бележката", "A credit note linked to the receipt")],
    [t("Свързване с магазина", "Connecting your shop"), t("Ръчно въвеждане", "Typing orders in by hand"), t("WooCommerce и Shopify за 2 минути", "WooCommerce and Shopify in 2 minutes")],
  ];

  const honest = [
    [t("Не заменяме счетоводителя ви.", "We do not replace your accountant."), t("Алтернативният режим е за неприсъствено плащане с карта. Преди да минете към него, обсъдете със счетоводителя си как плащате и дали режимът е за вашия магазин.", "The alternative regime is for remote payments by card. Before you switch to it, talk to your accountant about how you take payments and whether the regime suits your shop.")],
    [t("Не подаваме файла вместо вас.", "We do not file the report for you."), t("Готвим го и ви показваме грешките. Подаването към НАП остава ваше или на счетоводителя.", "We prepare it and show you the errors. Filing with the NRA stays with you or your accountant.")],
    [t("Не обещаваме повече, отколкото е проверено.", "We do not promise more than has been checked."), t("Следим изискванията на Наредба Н-18 и ги проверяваме с вас. Ако нещо се промени, ще го видите тук, а не от глоба.", "We follow the requirements of Ordinance N-18 and check them with you. If something changes you will see it here, not from a fine.")],
  ];

  const audiences = [
    [t("За собственици на магазини", "For shop owners"), t("Не искате да мислите за касов апарат и срокове. Свързвате магазина и получавате бележки и файл.", "You do not want to think about cash registers and deadlines. Connect your shop and get receipts and the file."), "/for-shops"],
    [t("За счетоводители", "For accountants"), t("Виждате магазините на клиентите си на едно място и сваляте файла без да чакате експорти по пощата.", "See your clients' shops in one place and download the file without waiting for exports by email."), "/for-accountants"],
    [t("За разработчици", "For developers"), t("Изпращате поръчките като JSON. Всеки магазин има собствен ключ.", "Send orders as JSON. Every shop has its own key."), "/integrations"],
  ];

  return (
    <>
      {/* ---------- начало ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-14">
        <div>
          <Reveal><div className="eyebrow">{t("Алтернативен режим · Наредба Н-18", "Alternative regime · Ordinance N-18")}</div></Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-[2.7rem] sm:text-6xl lg:text-[4.4rem]">
              {t("Бележките и файлът за НАП,", "Receipts and the NRA report,")}{" "}
              <span className="relative inline-block italic text-brand">
                {t("без касов апарат", "no cash register")}
                <svg className="draw absolute -bottom-2 left-0 w-full" viewBox="0 0 300 14" fill="none" preserveAspectRatio="none" aria-hidden>
                  <path d="M3 9c60-8 130-9 200-4 30 2 60 3 94 1" style={{ stroke: "var(--brand)" }} strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
              {t(
                "Свързвате магазина веднъж. След това всяка поръчка получава електронна бележка по имейл, а в края на месеца одиторският файл е готов за подаване.",
                "Connect your shop once. After that every order gets an electronic receipt by email, and at the end of the month the audit file is ready to file."
              )}
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/register" className="btn text-base">{t("Започни безплатно", "Start for free")} <Arrow /></Link>
              <a href="#kak" className="btn btn-ghost text-base">{t("Как минава една поръчка", "How an order flows")}</a>
            </div>
            <p className="mt-4 text-sm text-muted">{t("14 дни безплатно. Не искаме карта.", "14 days free. No card needed.")}</p>
          </Reveal>
        </div>
        <div>
          <HeroReceipt />
          <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-widest text-muted">{t("Примерна бележка", "Sample receipt (issued in Bulgarian)")}</p>
        </div>
      </section>

      {/* ---------- платформи ---------- */}
      <section className="border-y-[1.5px] border-foreground bg-accent/70 py-4" aria-label={t("Свързва се с", "Connects with")}>
        <div className="marquee">
          {[0, 1].map((k) => (
            <div key={k} className="marquee-track font-[family-name:var(--font-display)] text-xl italic text-foreground" aria-hidden={k === 1}>
              {platforms.map((p) => (
                <span key={p} className="flex items-center gap-12 whitespace-nowrap">
                  {p}
                  <span className="text-brand">✶</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- как минава ---------- */}
      <section id="kak" className="mx-auto mt-28 max-w-6xl scroll-mt-24 px-5">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal><div className="eyebrow">{t("Как минава една поръчка", "How an order flows")}</div></Reveal>
            <Reveal delay={80}><h2 className="mt-4 text-4xl sm:text-5xl">{t("От плащането до подадения файл.", "From payment to the filed report.")}</h2></Reveal>
            <Reveal delay={160}><p className="mt-5 max-w-sm text-muted">{t("Четири стъпки. Първите две се случват сами, а за последните две ви показваме точно какво остава.", "Four steps. The first two happen on their own, and for the last two we show you exactly what is left.")}</p></Reveal>
          </div>
          <ol className="relative">
            <span className="grow-line absolute bottom-3 left-[5.7rem] top-3 hidden w-px bg-foreground/30 sm:block" aria-hidden />
            {timeline.map(([n, title, d], i) => (
              <Reveal as="li" key={n} delay={i * 90} className="relative flex gap-6 pb-12 last:pb-0 sm:gap-9">
                <span className="num-xl relative z-10 w-[4.7rem] shrink-0 text-[3.6rem]">{n}</span>
                <div className="pt-2">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">{title}</h3>
                  <p className="mt-2 max-w-md leading-relaxed text-muted">{d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- какво има вътре ---------- */}
      <section className="mx-auto mt-32 max-w-6xl px-5">
        <Reveal><div className="eyebrow">{t("Вътре в таблото", "Inside the dashboard")}</div></Reveal>
        <Reveal delay={80}><h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl">{t("Направено за онзи, който ще го ползва всеки месец.", "Built for the person who will use it every month.")}</h2></Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-6">
          <Reveal className="md:col-span-4" variant="scale">
            <Spot className="card h-full !p-0">
              <div className="p-7 pb-4">
                <IcoReceipt className="h-7 w-7 text-brand" />
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold">{t("Всяка бележка е на една ръка разстояние", "Every receipt is one click away")}</h3>
                <p className="mt-2 max-w-lg text-muted">{t("Вижда се кое е изпратено, кое чака и кое не е успяло. Отваряте бележката такава, каквато я е получил клиентът.", "You can see what was sent, what is waiting and what failed. Open the receipt exactly as the customer received it.")}</p>
              </div>
              <div className="mx-5 mb-5 overflow-hidden rounded-xl border border-line bg-card font-mono text-[12.5px]">
                <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr] border-b border-line bg-accent/60 px-4 py-2 text-[11px] uppercase tracking-wider text-muted">
                  <span>{t("Бележка", "Receipt")}</span><span>{t("Поръчка", "Order")}</span><span>{t("Сума", "Total")}</span><span>{t("Статус", "Status")}</span>
                </div>
                {recent.map(([n, o, s, st], i) => (
                  <div key={n} className="row-in grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr] items-center border-b border-line/70 px-4 py-2.5 last:border-0" style={{ "--i": i } as React.CSSProperties}>
                    <span>{n}</span><span>{o}</span><span>{s}</span>
                    <span className={`flex items-center gap-1.5 ${st === "sent" ? "text-sage" : "text-brand-dark"}`}>
                      <i className={`inline-block h-2 w-2 rounded-full ${st === "sent" ? "bg-sage" : "pulse-dot bg-brand"}`} />
                      {st === "sent" ? t("изпратена", "sent") : t("опитва пак", "retrying")}
                    </span>
                  </div>
                ))}
              </div>
            </Spot>
          </Reveal>

          <Reveal className="md:col-span-2" delay={100} variant="scale">
            <Spot className="card h-full">
              <IcoRetry className="h-7 w-7 text-brand" />
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold">{t("Нищо не се губи", "Nothing gets lost")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("Ако пощата откаже, опитваме пак след 5, 10 и 15 минути. После получавате имейл.", "If the mailbox refuses, we try again after 5, 10 and 15 minutes. After that you get an email.")}</p>
              <div className="mt-5 flex items-end gap-2 font-mono text-[11px] text-muted">
                {["5′", "10′", "15′"].map((m, i) => (
                  <div key={m} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-brand/80" style={{ height: 18 + i * 16 }} />
                    {m}
                  </div>
                ))}
              </div>
            </Spot>
          </Reveal>

          <Reveal className="md:col-span-2" delay={60} variant="scale">
            <Spot className="card h-full">
              <IcoPalette className="h-7 w-7 text-brand" />
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold">{t("С вашето лице", "With your own look")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("Лого и цвят на бележката, във всички планове. Писмото излиза от вашата поща.", "Your logo and colour on the receipt, in every plan. The email goes out from your own mailbox.")}</p>
              <div className="mt-5 flex gap-2">
                {["#f2b705", "#0f7f79", "#14a39b", "#f2b705", "#1b1b1b"].map((c, i) => (
                  <span key={i} className="h-8 w-8 rounded-full border-2 border-white shadow transition-transform hover:scale-125" style={{ background: c }} />
                ))}
              </div>
            </Spot>
          </Reveal>

          <Reveal className="md:col-span-2" delay={140} variant="scale">
            <Spot className="card h-full">
              <IcoUndo className="h-7 w-7 text-brand" />
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold">{t("Възстановена сума", "Refunds")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("Клиентът получава кредитно известие към първата бележка, а сумата влиза в месечния файл.", "The customer gets a credit note linked to the first receipt, and the amount goes into the monthly file.")}</p>
            </Spot>
          </Reveal>

          <Reveal className="md:col-span-2" delay={220} variant="scale">
            <Spot className="card h-full">
              <IcoFolder className="h-7 w-7 text-brand" />
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold">{t("Пакет за счетоводителя", "Accountant's package")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("Един ZIP: файлът за НАП, поръчките, бележките, възстановените суми и кратко резюме.", "One ZIP: the NRA file, the orders, the receipts, the refunds and a short summary.")}</p>
            </Spot>
          </Reveal>
        </div>
      </section>

      {/* ---------- честно ---------- */}
      <section className="mt-32 bg-ink py-20 text-ink-text">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Reveal><div className="eyebrow !text-sun">{t("Честно", "In plain words")}</div></Reveal>
            <Reveal delay={80}><h2 className="mt-4 text-4xl sm:text-5xl">{t("Какво", "What we")} <em className="text-sun">{t("не", "do not")}</em> {t("правим.", "do.")}</h2></Reveal>
          </div>
          <div className="space-y-6 text-[1.02rem] leading-relaxed">
            {honest.map(([title, d], i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="border-t border-ink-line pt-5">
                  <b className="font-[family-name:var(--font-display)] text-xl font-bold text-ink-bright">{title}</b>
                  <p className="mt-1.5 text-ink-soft">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- сравнение ---------- */}
      <section className="mx-auto mt-28 max-w-4xl px-5">
        <Reveal><h2 className="text-4xl sm:text-5xl">{t("Колко по-лесно става.", "How much easier it gets.")}</h2></Reveal>
        <Reveal delay={100}>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left">
              <thead>
                <tr className="eyebrow border-b-[1.5px] border-foreground">
                  <th className="py-3 pr-4 font-normal"> </th><th className="py-3 pr-4 font-normal">{t("Без КасаБГ", "Without KasaBG")}</th><th className="py-3 font-normal !text-brand-dark">{t("С КасаБГ", "With KasaBG")}</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([a, b, c]) => (
                  <tr key={a} className="group border-b border-line transition-colors hover:bg-accent/50">
                    <td className="py-4 pr-4 font-semibold">{a}</td>
                    <td className="py-4 pr-4 text-muted">{b}</td>
                    <td className="py-4 font-medium"><IcoCheck className="mr-1.5 inline h-5 w-5 -translate-y-0.5 text-sage" />{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <p className="mt-4 text-sm text-muted">{t("Алтернативният режим не е за всеки магазин.", "The alternative regime is not for every shop.")} <Link href="/faq" className="ulink font-semibold text-brand-dark">{t("Въпроси и отговори", "Questions and answers")}</Link></p>
      </section>

      {/* ---------- за кого ---------- */}
      <section className="mx-auto mt-28 grid max-w-6xl gap-5 px-5 md:grid-cols-3">
        {audiences.map(([title, d, h], i) => (
          <Reveal key={h} delay={i * 100}>
            <Link href={h} className="lift group block h-full rounded-2xl border-[1.5px] border-foreground bg-card p-7">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight">{title}</h3>
              <p className="mt-3 text-muted">{d}</p>
              <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-dark">{t("Научете повече", "Learn more")} <Arrow className="transition-transform group-hover:translate-x-1.5" /></span>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* ---------- призив ---------- */}
      <section className="mx-auto mt-28 max-w-5xl px-5">
        <Reveal variant="scale">
          <div className="zig-bottom bg-brand px-8 pt-14 text-center text-[#161616] sm:px-16">
            <h2 className="mx-auto max-w-2xl text-4xl sm:text-5xl">{t("Първата бележка може да тръгне днес.", "Your first receipt can go out today.")}</h2>
            <p className="mx-auto mt-4 max-w-md text-[#161616]/80">{t("Свържете магазина, изпратете тестова поръчка на собствения си имейл и вижте как изглежда.", "Connect your shop, send a test order to your own email and see how it looks.")}</p>
            <Link href="/register" className="btn mt-8 btn-on-ink">{t("Започни безплатно", "Start for free")} <Arrow /></Link>
            <p className="mb-2 mt-3 text-sm text-[#161616]/70">{t("14 дни безплатно, без карта", "14 days free, no card")}</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
