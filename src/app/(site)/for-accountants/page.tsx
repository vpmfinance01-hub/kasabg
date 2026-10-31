import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { Arrow } from "@/components/site/Icons";
import { getT } from "@/lib/i18n-server";

export default async function ForAccountants() {
  const t = await getT();

  const points = [
    [t("Клиентите ви на едно място", "Your clients in one place"), t("Виждате магазините, към които имате достъп, и как стои месецът за всеки.", "See the shops you have access to and how the month stands for each one.")],
    [t("Проверки преди подаване", "Checks before filing"), t("Липсващи данни, повтарящи се документи и непълни плащания през ПОС се показват преди да свалите файла.", "Missing data, duplicate documents and incomplete POS payments are shown before you download the file.")],
    [t("Файл и таблици в един пакет", "The file and tables in one package"), t("Одиторският XML по Приложение №38, плюс таблици с поръчките, бележките и възстановените суми.", "The audit XML under Annex 38, plus tables of the orders, receipts and refunds.")],
    [t("Отбелязвате подаването", "You mark it as filed"), t("Записвате кога е подаден файлът и собственикът го вижда.", "You record when the file was filed and the owner sees it.")],
    [t("Безопасен достъп", "Safe access"), t("Само за четене и сваляне. Не променяте и не изтривате поръчките на клиента.", "Read-only and download. You cannot change or delete the client's orders.")],
    [t("Декларацията на магазина е пред очите ви", "The shop's declaration is in front of you"), t("Виждате какво е заявил клиентът за плащанията и регистрацията си в НАП, с дата.", "You see what the client declared about payments and their NRA registration, with a date.")],
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-10">
      <Reveal><div className="eyebrow">{t("За счетоводители", "For accountants")}</div></Reveal>
      <Reveal delay={80}><h1 className="mt-4 max-w-3xl text-5xl sm:text-6xl">{t("Без гонене на експорти в края на месеца.", "No more chasing exports at month end.")}</h1></Reveal>
      <Reveal delay={160}><p className="mt-5 max-w-xl text-lg text-muted">{t("Клиентът ви дава достъп, а вие подготвяте месечния файл от един екран.", "Your client gives you access and you prepare the monthly file from one screen.")}</p></Reveal>

      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border-[1.5px] border-foreground bg-foreground md:grid-cols-2 lg:grid-cols-3">
        {points.map(([title, d], i) => (
          <Reveal key={title} delay={(i % 3) * 80} className="bg-card">
            <div className="h-full p-7 transition-colors hover:bg-accent/60">
              <span className="num-xl text-3xl">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold leading-snug">{title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-16 grid items-center gap-8 rounded-3xl bg-ink p-8 text-ink-text lg:grid-cols-[1fr_auto] lg:p-12">
          <div>
            <div className="eyebrow !text-sun">{t("Как получавате достъп", "How you get access")}</div>
            <ol className="mt-5 space-y-3 text-lg">
              <li><span className="mr-3 font-mono text-sun">1</span>{t("Клиентът добавя вашия имейл в раздел „Счетоводител“.", "Your client adds your email in the “Accountant” section.")}</li>
              <li><span className="mr-3 font-mono text-sun">2</span>{t("Вие се регистрирате безплатно със същия имейл.", "You sign up for free with the same email.")}</li>
              <li><span className="mr-3 font-mono text-sun">3</span>{t("Магазинът се появява във вашето табло.", "The shop appears in your dashboard.")}</li>
            </ol>
          </div>
          <Link href="/register" className="btn btn-on-ink">{t("Създай безплатен профил", "Create a free account")} <Arrow /></Link>
        </div>
      </Reveal>
    </div>
  );
}
