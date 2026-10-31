import { getT } from "@/lib/i18n-server";

export default async function Terms() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-extrabold">{t("Общи условия", "Terms of service")}</h1>
      <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        {t(
          "Чернова. Този текст е примерен и трябва да бъде прегледан от юрист и допълнен с данните на дружеството, преди публично пускане.",
          "Draft. This text is a sample and must be reviewed by a lawyer and completed with the company's details before public launch. The Bulgarian version is the one that applies."
        )}
      </div>
      <div className="mt-6 space-y-4 leading-relaxed">
        <h2 className="text-xl font-bold">{t("1. Доставчик", "1. Provider")}</h2>
        <p>{t("Услугата КасаБГ се предоставя от [наименование на дружеството], ЕИК [ЕИК], със седалище [адрес].", "The KasaBG service is provided by [company name], company ID [ID], registered at [address].")}</p>
        <h2 className="text-xl font-bold">{t("2. Предмет", "2. Subject")}</h2>
        <p>{t("Услугата подпомага онлайн магазини при издаване на електронни касови бележки и подготовка на одиторски XML файл по Наредба Н-18.", "The service helps online shops issue electronic receipts and prepare an audit XML file under Ordinance N-18.")}</p>
        <h2 className="text-xl font-bold">{t("3. Отговорност на потребителя", "3. The user's responsibility")}</h2>
        <p>{t("Потребителят отговаря за верността на въведените данни и за навременното подаване на файла към НАП. Услугата не представлява счетоводна, данъчна или правна консултация.", "The user is responsible for the accuracy of the data entered and for filing the file with the NRA on time. The service is not accounting, tax or legal advice.")}</p>
        <h2 className="text-xl font-bold">{t("4. Пробен период и плащане", "4. Trial and payment")}</h2>
        <p>{t("Новите потребители получават безплатен пробен период. Условията за платените планове се публикуват на страница „Цени“. Цените са без ДДС.", "New users get a free trial. The terms of the paid plans are published on the Pricing page. Prices exclude VAT.")}</p>
        <h2 className="text-xl font-bold">{t("5. Ограничение на отговорността", "5. Limitation of liability")}</h2>
        <p>{t("Доставчикът не носи отговорност за санкции, произтичащи от неверни или закъснели данни, подадени от потребителя.", "The provider is not liable for penalties resulting from incorrect or late data supplied by the user.")}</p>
        <h2 className="text-xl font-bold">{t("6. Прекратяване", "6. Termination")}</h2>
        <p>{t("Потребителят може да прекрати ползването по всяко време. При поискване данните му се изтриват, освен когато закон изисква друго.", "The user may stop using the service at any time. On request their data is deleted, unless the law requires otherwise.")}</p>
      </div>
    </div>
  );
}
