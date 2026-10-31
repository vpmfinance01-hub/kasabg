import { Reveal } from "@/components/site/Reveal";
import { IcoShield, IcoUsers, IcoPlug, IcoReceipt, IcoFolder, IcoCheck } from "@/components/site/Icons";
import { getT } from "@/lib/i18n-server";

export default async function Security() {
  const t = await getT();
  const items = [
    [IcoFolder, t("Данни в Европейския съюз", "Data in the European Union"), t("Базата данни е в регион Франкфурт (eu-central-1).", "The database is in the Frankfurt region (eu-central-1).")],
    [IcoUsers, t("Изолация между клиентите", "Isolation between customers"), t("Всеки потребител вижда само данните на своите магазини. Това се налага на ниво база данни, а не само в приложението.", "Each user sees only the data of their own shops. This is enforced at the database level, not just in the application.")],
    [IcoShield, t("Роли с ограничен достъп", "Roles with limited access"), t("Счетоводителят има достъп само за четене и сваляне на файлове.", "An accountant has read-only access and can download files.")],
    [IcoPlug, t("Таен ключ за всеки магазин", "A secret key for every shop"), t("Ключът се вижда само на собственика и не се показва на счетоводители. Собственикът не може сам да променя плана и данните за плащане.", "The key is visible only to the owner and is never shown to accountants. The owner cannot change the plan or the payment details alone.")],
    [IcoReceipt, t("Записана декларация", "A recorded declaration"), t("Какво е потвърдил магазинът при регистрация се пази с дата и не може да се променя назад.", "What the shop confirmed at registration is kept with a date and cannot be changed afterwards.")],
    [IcoCheck, t("Криптирана връзка", "Encrypted connection"), t("Целият сайт работи през HTTPS, а паролите към пощите на магазините се пазят криптирани.", "The whole site runs over HTTPS and the passwords to shops' mailboxes are stored encrypted.")],
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-8 pt-10">
      <Reveal><div className="eyebrow">{t("Сигурност и доверие", "Security and trust")}</div></Reveal>
      <Reveal delay={80}><h1 className="mt-4 max-w-3xl text-5xl sm:text-6xl">{t("Как пазим данните на вашите магазини.", "How we protect your shops' data.")}</h1></Reveal>
      <div className="mt-14 grid gap-x-14 gap-y-10 md:grid-cols-2">
        {items.map(([Ico, title, d], i) => (
          <Reveal key={title} delay={(i % 2) * 90}>
            <div className="flex gap-5 border-t-[1.5px] border-foreground pt-6">
              <Ico className="mt-1 h-9 w-9 shrink-0 text-brand" />
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mt-14 max-w-2xl border-l-[3px] border-brand pl-5 text-lg leading-relaxed">
          {t("Вие носите отговорност за верността на данните, подадени към НАП. КасаБГ не заменя счетоводител.", "You are responsible for the accuracy of the data filed with the NRA. KasaBG does not replace an accountant.")}
        </p>
      </Reveal>
    </div>
  );
}
