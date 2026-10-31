import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { getT } from "@/lib/i18n-server";

export default async function Faq() {
  const t = await getT();

  const groups: { title: string; items: [string, string][] }[] = [
    {
      title: t("Основното", "The basics"),
      items: [
        [t("Какво е Алтернативният режим?", "What is the alternative regime?"), t("Режим по Наредба Н-18, при който онлайн магазин не използва касов апарат, а издава електронна бележка на клиента и подава месечен одиторски файл към НАП.", "A regime under Ordinance N-18 where an online shop does not use a cash register but issues an electronic receipt to the customer and files a monthly audit file with the Bulgarian NRA.")],
        [t("Подходящ ли е за моя магазин?", "Is it right for my shop?"), t("Зависи от начина, по който получавате плащанията, и от изискванията на наредбата за вашия случай. Преди да минете към режима, обсъдете го със счетоводителя си. КасаБГ ви дава бележките и файла, но не заменя счетоводна консултация.", "It depends on how you receive payments and on what the ordinance requires in your case. Discuss it with your accountant before switching. KasaBG gives you the receipts and the file but does not replace accounting advice.")],
        [t("Какво са електронните касови бележки?", "What are electronic receipts?"), t("Електронен документ, който клиентът получава по имейл след поръчката: PDF и копие в самото писмо. В него са артикулите, цените с ДДС, общата сума и начинът на плащане.", "An electronic document the customer receives by email after the order: a PDF and a copy in the email itself. It lists the items, prices with VAT, the total and the payment method.")],
        [t("Работи ли с наложен платеж?", "Does it work with cash on delivery?"), t("Поддържаме го като начин на плащане. Алтернативният режим обаче е за неприсъствено плащане с карта, затова за наложения платеж уточнете със счетоводителя или с НАП дали бележката от КасаБГ е достатъчна.", "We support it as a payment method. The alternative regime, however, is for remote card payments, so for cash on delivery check with your accountant or the NRA whether the KasaBG receipt is enough.")],
      ],
    },
    {
      title: t("Свързване", "Connecting"),
      items: [
        [t("С кои платформи работи?", "Which platforms does it work with?"), t("WooCommerce и Shopify имат готова връзка. За PrestaShop, Wix, Ecwid, BigCommerce и други ползвате Make или Zapier, а собствените магазини изпращат поръчките като JSON. Има и импорт от CSV.", "WooCommerce and Shopify have a ready connection. For PrestaShop, Wix, Ecwid, BigCommerce and others use Make or Zapier, and your own shops send orders as JSON. There is also a CSV import.")],
        [t("Колко време отнема свързването?", "How long does connecting take?"), t("За WooCommerce и Shopify около 2 минути: поставяте един адрес в настройките на магазина. Упътването е в таблото, в „Настройки“.", "About 2 minutes for WooCommerce and Shopify: you paste one address into your shop's settings. The instructions are in the dashboard under “Settings”.")],
        [t("От чия поща се изпращат бележките?", "Whose mailbox do the receipts come from?"), t("От фирмената поща на магазина. Настройвате я веднъж в таблото и клиентите виждат вашето име и адрес като подател.", "From the shop's own company mailbox. You set it up once in the dashboard and customers see your name and address as the sender.")],
      ],
    },
    {
      title: t("Бележки и възстановени суми", "Receipts and refunds"),
      items: [
        [t("Може ли бележката да е с логото ми?", "Can the receipt carry my logo?"), t("Да, във всички планове. Качвате лого и избирате цвят, а прегледът се вижда веднага.", "Yes, in every plan. You upload a logo and pick a colour, and the preview shows at once.")],
        [t("Какво става, ако пощата ми не работи?", "What if my mailbox stops working?"), t("Опитваме автоматично още няколко пъти. Ако пак не успее, получавате имейл, а бележката остава в таблото с бутон „Изпрати отново“. Нищо не се губи.", "We retry automatically a few more times. If it still fails you get an email and the receipt stays in the dashboard with a “Send again” button. Nothing is lost.")],
        [t("Какво става при възстановена сума?", "What happens on a refund?"), t("Записва се във „Възстановени суми“ и клиентът получава кредитно известие към първоначалната бележка. Сумата влиза и в месечния файл.", "It is recorded under “Refunds” and the customer gets a credit note linked to the original receipt. The amount also goes into the monthly file.")],
        [t("Как се обработват валутите?", "How are currencies handled?"), t("Сумите в евро се записват директно, а левовите се превръщат по официалния курс 1 € = 1,95583 лв.", "Euro amounts are stored as they are, and leva amounts are converted at the official rate of €1 = 1.95583 BGN.")],
      ],
    },
    {
      title: t("Файлът за НАП", "The NRA file"),
      items: [
        [t("Кога се подава одиторският файл?", "When is the audit file filed?"), t("Файлът за предходния месец се подава до 15-о число. В таблото виждате срока и колко дни остават.", "The file for the previous month is filed by the 15th. The dashboard shows the deadline and how many days are left.")],
        [t("Подавате ли файла вместо мен?", "Do you file it for me?"), t("Не. Вие или счетоводителят ви го сваляте от таблото и го подавате в системата на НАП. Преди това таблото ви показва проверки за грешки.", "No. You or your accountant download it from the dashboard and file it in the NRA system. Before that the dashboard shows you error checks.")],
        [t("Какво получава счетоводителят?", "What does my accountant get?"), t("Достъп до таблото и един ZIP пакет за месеца: одиторския файл, таблици с поръчките, бележките и възстановените суми и кратко резюме.", "Access to the dashboard and one ZIP package for the month: the audit file, tables of the orders, receipts and refunds, and a short summary.")],
      ],
    },
    {
      title: t("Цена и данни", "Price and data"),
      items: [
        [t("Колко струва?", "How much does it cost?"), t("От 19 € на месец без ДДС за до 100 поръчки на месец. Първите 14 дни са безплатни и не искаме карта. Всички планове са на страницата с цени.", "From €19 a month excluding VAT for up to 100 orders a month. The first 14 days are free and we do not ask for a card. All plans are on the pricing page.")],
        [t("Какво става след пробния период?", "What happens after the trial?"), t("Ако не изберете план, бележките не се губят: пазим ги и ги изпращаме веднага след като изберете план.", "If you do not choose a plan the receipts are not lost: we keep them and send them as soon as you choose one.")],
        [t("Къде се пазят данните ми?", "Where is my data stored?"), t("В базата данни в Европейския съюз. Можете да свалите всичко от „Настройки → Лични данни“, да заличите данните на клиент или да изтриете магазина.", "In a database in the European Union. You can download everything from “Settings → Personal data”, erase a customer's data or delete the shop.")],
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 pb-8 pt-10">
      <Reveal><div className="eyebrow">{t("Въпроси и отговори", "Questions and answers")}</div></Reveal>
      <Reveal delay={80}><h1 className="mt-4 text-5xl sm:text-6xl">{t("Каквото обикновено ни питат.", "What people usually ask us.")}</h1></Reveal>
      {groups.map((g) => (
        <section key={g.title} className="mt-14">
          <Reveal><h2 className="font-[family-name:var(--font-display)] text-2xl italic text-brand-dark">{g.title}</h2></Reveal>
          <div className="mt-3 border-t-[1.5px] border-foreground">
            {g.items.map(([q, a], i) => (
              <Reveal key={q} delay={i * 50}>
                <details className="faq-item border-b border-line">
                  <summary className="flex items-center justify-between gap-6 py-5 text-lg font-semibold transition-colors hover:text-brand">
                    {q}
                    <span className="plus flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-foreground text-xl leading-none">+</span>
                  </summary>
                  <div className="faq-body pb-6 pr-14 leading-relaxed text-muted">{a}</div>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      ))}
      <p className="mt-14 text-center text-muted">
        {t("Не намирате отговор?", "Cannot find an answer?")} <Link href="/contact" className="ulink font-semibold text-brand-dark">{t("Пишете ни", "Write to us")}</Link>.
      </p>
    </div>
  );
}
