import Link from "next/link";
import { getT } from "@/lib/i18n-server";

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="mt-12 scroll-mt-24 text-2xl font-extrabold">{children}</h2>;
}

export default async function Help() {
  const t = await getT();
  const toc = [
    ["start", t("1. Регистрация и първи магазин", "1. Sign-up and your first shop")],
    ["nap", t("2. Данни за НАП", "2. NRA details")],
    ["orders", t("3. Как влизат поръчките", "3. How orders come in")],
    ["receipts", t("4. Електронни бележки", "4. Electronic receipts")],
    ["refunds", t("5. Възстановени суми", "5. Refunds")],
    ["month", t("6. Месечният файл за НАП", "6. The monthly file for the NRA")],
    ["accountant", t("7. Работа със счетоводител", "7. Working with an accountant")],
    ["problems", t("8. Чести проблеми", "8. Common problems")],
  ];
  const problems = [
    [t("Не получавам имейл за потвърждение", "I do not get the confirmation email"), t("Проверете папка „Спам“. Ако още го няма, опитайте да се регистрирате отново.", "Check your Spam folder. If it is still missing, try signing up again.")],
    [t("Файлът излиза празен", "The file comes out empty"), t("Проверете избрания месец. Файлът включва само поръчки от този месец.", "Check the selected month. The file only includes orders from that month.")],
    [t("Грешка „повтарящ се номер на документ“", "Error “duplicate document number”"), t("Две поръчки имат един и същ номер. Проверете номерата в CSV.", "Two orders have the same number. Check the numbers in your CSV.")],
    [t("Плащане с карта е с грешка", "A card payment shows an error"), t("Попълнете ПОС номер, RRN и ЕИК на доставчика. Тези данни ги има при вашия платежен доставчик.", "Fill in the POS number, the RRN and the provider's company ID. Your payment provider has these details.")],
    [t("Не виждам магазина на клиента (счетоводител)", "I cannot see the client's shop (accountant)"), t("Клиентът трябва да е добавил точно вашия имейл, а вие да сте влезли със същия.", "The client must have added exactly your email, and you must be signed in with it.")],
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-extrabold">{t("Ръководство за употреба", "User guide")}</h1>
      <p className="mt-3 text-muted">{t("Стъпка по стъпка от регистрацията до подаването на файла към НАП.", "Step by step from signing up to filing the file with the NRA.")}</p>

      <nav className="card mt-6">
        <div className="font-bold">{t("Съдържание", "Contents")}</div>
        <ul className="mt-2 space-y-1">
          {toc.map(([id, title]) => (
            <li key={id}><a href={`#${id}`} className="text-brand-dark hover:underline">{title}</a></li>
          ))}
        </ul>
      </nav>

      <H id="start">{t("1. Регистрация и първи магазин", "1. Sign-up and your first shop")}</H>
      <ol className="mt-3 list-decimal space-y-2 pl-6">
        <li>{t("Натиснете", "Press")} <Link href="/register" className="text-brand-dark">{t("„Започни безплатно“", "“Start for free”")}</Link>{t(", въведете имейл и парола (поне 8 символа).", ", enter an email and a password (at least 8 characters).")}</li>
        <li>{t("Потвърдете имейла си от писмото, което ще получите, и влезте.", "Confirm your email from the message you receive, and sign in.")}</li>
        <li>{t("Попълнете име на магазина, ЕИК и домейн, и изберете платформата. Натиснете „Създай“.", "Enter the shop name, company ID and domain, and pick the platform. Press “Create”.")}</li>
        <li>{t("Попълнете кратката декларация на екрана: тя записва какви плащания приемате.", "Fill in the short declaration on the screen: it records which payments you accept.")}</li>
      </ol>
      <p className="mt-3 text-sm text-muted">{t("Пробният период е 14 дни. Остатъкът се вижда най-горе в таблото.", "The trial lasts 14 days. The time left is shown at the top of the dashboard.")}</p>

      <H id="nap">{t("2. Данни за НАП", "2. NRA details")}</H>
      <p className="mt-3">{t("Преди да подадете файл, магазинът трябва да е деклариран в НАП. След декларирането получавате", "Before you file, the shop must be registered with the NRA. After registering you receive a")} <b>{t("уникален номер на магазина", "unique shop number")}</b>.</p>
      <ol className="mt-3 list-decimal space-y-2 pl-6">
        <li>{t("Отворете раздел", "Open the")} <b>{t("Настройки", "Settings")}</b>.</li>
        <li>{t("Попълнете", "Fill in")} <b>{t("ЕИК", "company ID")}</b>, <b>{t("домейн", "domain")}</b> {t("и", "and")} <b>{t("№ на магазина от НАП", "the shop number from the NRA")}</b>.</li>
        <li>{t("Натиснете „Запази“.", "Press “Save”.")}</li>
      </ol>
      <p className="mt-3 text-sm text-muted">{t("Без тези три полета файлът няма да е валиден и таблото ще ви го покаже като грешка.", "Without these three fields the file will not be valid and the dashboard will show it as an error.")}</p>

      <H id="orders">{t("3. Как влизат поръчките", "3. How orders come in")}</H>
      <p className="mt-3">{t("Има няколко начина. Изберете един.", "There are several ways. Pick one.")}</p>

      <h3 className="mt-5 text-lg font-bold">{t("А) Ръчно, в таблото", "A) By hand, in the dashboard")}</h3>
      <p className="mt-2">{t("Раздел Поръчки → „+ Нова поръчка“. Попълнете номер, дата и имейл на клиента, после артикулите: име, бройки и цена с ДДС за 1 бройка. Бройките могат да са и под 1 (например 0,5). „+ Добави още артикул“ добавя нов ред, а общата сума се смята сама.", "Orders → “+ New order”. Enter the number, the date and the customer's email, then the items: name, quantity and the price per unit including VAT. Quantities can also be below 1 (for example 0.5). “+ Add another item” adds a row, and the total is calculated for you.")}</p>

      <h3 className="mt-5 text-lg font-bold">{t("Б) CSV файл", "B) A CSV file")}</h3>
      <ol className="mt-2 list-decimal space-y-2 pl-6">
        <li>{t("Раздел", "Open")} <b>{t("Поръчки", "Orders")}</b> → {t("„Свали примерен CSV“.", "“Download sample CSV”.")}</li>
        <li>{t("Попълнете го с поръчките си. Един ред е един артикул. Редовете с един и същ", "Fill it in with your orders. One row is one item. Rows with the same")} <code>order_id</code> {t("са една поръчка.", "are one order.")}</li>
        <li>{t("„Импорт от CSV“ и изберете файла. Ще видите колко са импортирани.", "Press “Import from CSV” and pick the file. You will see how many were imported.")}</li>
      </ol>
      <div className="card mt-3 overflow-x-auto text-sm">
        <table className="w-full text-left">
          <thead><tr><th className="pr-4">{t("Колона", "Column")}</th><th>{t("Значение", "Meaning")}</th></tr></thead>
          <tbody className="align-top">
            <tr><td className="pr-4"><code>order_id</code></td><td>{t("Номер на поръчката (задължително)", "Order number (required)")}</td></tr>
            <tr><td className="pr-4"><code>date</code></td><td>{t("Дата, например 2026-09-03", "Date, for example 2026-09-03")}</td></tr>
            <tr><td className="pr-4"><code>total</code>, <code>currency</code></td><td>{t("Обща сума с ДДС и валута (EUR)", "Total including VAT and the currency (EUR)")}</td></tr>
            <tr><td className="pr-4"><code>email</code>, <code>name</code></td><td>{t("Клиент. Без имейл не се изпраща бележка", "The customer. No receipt is sent without an email")}</td></tr>
            <tr><td className="pr-4"><code>payment</code></td><td>card, cod ({t("наложен платеж", "cash on delivery")}), bank, paypal, stripe, other</td></tr>
            <tr><td className="pr-4"><code>pos_n</code>, <code>rrn</code>, <code>processor_eik</code></td><td>{t("За плащане с карта: номер на виртуален ПОС, референтен номер (RRN) и ЕИК на доставчика", "For card payments: virtual POS number, reference number (RRN) and the provider's company ID")}</td></tr>
            <tr><td className="pr-4"><code>item_name</code>, <code>item_qty</code>, <code>item_price_no_vat</code></td><td>{t("Артикул, брой и единична цена без ДДС", "Item, quantity and unit price excluding VAT")}</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="mt-5 text-lg font-bold">{t("В) WooCommerce или Shopify (автоматично)", "C) WooCommerce or Shopify (automatic)")}</h3>
      <p className="mt-2">{t("В таблото, раздел", "In the dashboard, under")} <b>{t("Настройки → „Свързване на магазина“", "Settings → “Connect your shop”")}</b>{t(", намирате готов адрес за вашата платформа с бутон „Копирай“ и стъпките за настройка. Накратко:", " you will find a ready address for your platform with a “Copy” button and the setup steps. In short:")}</p>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li><b>WooCommerce:</b> {t("Настройки → Разширени → Webhooks → Добавяне. Тема:", "Settings → Advanced → Webhooks → Add. Topic:")} <i>Order updated</i>. {t("Адрес: копираният от нас.", "Address: the one we copied for you.")}</li>
        <li><b>Shopify:</b> Settings → Notifications → Webhooks. {t("Три webhook-а:", "Three webhooks:")} Order creation, Order payment, Order update (JSON). {t("Адрес: копираният от нас.", "Address: the one we copied for you.")}</li>
      </ul>
      <p className="mt-2 text-sm text-muted">{t("Чакащите, отказаните и тестовите поръчки се пропускат. Възстановените суми се записват сами.", "Pending, cancelled and test orders are skipped. Refunds are recorded automatically.")}</p>

      <h3 className="mt-5 text-lg font-bold">{t("Г) Друга платформа или собствен магазин", "D) Another platform or your own shop")}</h3>
      <p className="mt-2">{t("Универсалният webhook приема поръчка като JSON с метод POST: подходящ за собствени магазини, а за PrestaShop, Wix и други можете да ползвате Make или Zapier. Примерът е в таблото. Ключът е таен: не го слагайте в публичен код.", "The universal webhook accepts an order as JSON with the POST method: good for your own shops, and for PrestaShop, Wix and others you can use Make or Zapier. The example is in the dashboard. The key is secret: do not put it in public code.")}</p>

      <H id="receipts">{t("4. Електронни бележки", "4. Electronic receipts")}</H>
      <p className="mt-3">{t("За всяка поръчка с имейл се създава бележка и клиентът я получава с PDF към писмото. Статусите са:", "A receipt is created for every order with an email and the customer receives it with a PDF attached. The statuses are:")}</p>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li><b>{t("Чака изпращане", "Waiting to send")}</b> — {t("системата опитва автоматично няколко пъти;", "the system retries automatically a few times;")}</li>
        <li><b>{t("Изпратена", "Sent")}</b>;</li>
        <li><b>{t("Не е изпратена", "Not sent")}</b> — {t("след няколко опита; получавате имейл и можете да я пратите отново;", "after several attempts; you get an email and can send it again;")}</li>
        <li><b>{t("Няма имейл", "No email")}</b> — {t("поръчката е без имейл, бележка не се изпраща;", "the order has no email, so no receipt is sent;")}</li>
        <li><b>{t("Чака избор на план", "Waiting for a plan")}</b> — {t("пробният период е свършил; бележките тръгват след избор на план.", "the trial has ended; receipts go out once you choose a plan.")}</li>
      </ul>
      <p className="mt-3 text-sm text-muted">{t("Ако поръчката няма имейл, помислете как клиентът ще получи документа по друг начин.", "If an order has no email, think about how the customer will get the document another way.")}</p>

      <H id="refunds">{t("5. Възстановени суми", "5. Refunds")}</H>
      <p className="mt-3">{t("Раздел", "Open")} <b>{t("Възстановени суми", "Refunds")}</b> → {t("попълнете номер на поръчката, сума, дата и метод (IBAN, карта, в брой, друго). Клиентът получава кредитно известие, а сумата влиза във файла за месеца, в който е възстановена.", "enter the order number, amount, date and method (IBAN, card, cash, other). The customer gets a credit note, and the amount goes into the file of the month in which it was refunded.")}</p>

      <H id="month">{t("6. Месечният файл за НАП", "6. The monthly file for the NRA")}</H>
      <p className="mt-3">{t("Файлът за предходния месец се подава от 1-во до 15-о число.", "The file for the previous month is filed between the 1st and the 15th.")}</p>
      <ol className="mt-3 list-decimal space-y-2 pl-6">
        <li>{t("Отворете", "Open")} <b>{t("Преглед", "Overview")}</b> {t("и изберете месеца.", "and choose the month.")}</li>
        <li>{t("Прочетете", "Read")} <b>{t("Проверките преди подаване", "the checks before filing")}</b>. {t("Червените редове са грешки и трябва да се поправят. Жълтите са предупреждения, а сините са информация.", "Red rows are errors and must be fixed. Yellow are warnings and blue are information.")}</li>
        <li>{t("Натиснете", "Press")} <b>{t("„Свали одиторски XML“", "“Download audit XML”")}</b> {t("или", "or")} <b>{t("„Пакет за счетоводителя (ZIP)“", "“Accountant's package (ZIP)”")}</b>.</li>
        <li>{t("Подайте файла в портала на НАП.", "File the file in the NRA portal.")}</li>
        <li>{t("Върнете се и натиснете", "Come back and press")} <b>{t("„Отбележи като подаден“", "“Mark as filed”")}</b>{t(", за да се знае, че месецът е приключил.", " so that it is clear the month is done.")}</li>
      </ol>
      <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        {t("Важно: преди първото реално подаване проверете файла в системата на НАП. Услугата не замества вашия счетоводител.", "Important: before your first real filing, check the file in the NRA system. The service does not replace your accountant.")}
      </div>

      <H id="accountant">{t("7. Работа със счетоводител", "7. Working with an accountant")}</H>
      <p className="mt-3"><b>{t("Като собственик:", "As an owner:")}</b> {t("раздел", "open")} <b>{t("Счетоводител", "Accountant")}</b> → {t("въведете имейла му → „Добавете“. Можете да го премахнете по всяко време.", "enter their email → “Add”. You can remove them at any time.")}</p>
      <p className="mt-3"><b>{t("Като счетоводител:", "As an accountant:")}</b> {t("регистрирайте се безплатно със същия имейл. Магазинът ще се появи в таблото ви с бележка „(счетоводител)“. Можете да четете поръчки и възстановени суми, да сваляте XML и да отбелязвате подаването. Не можете да променяте данни.", "sign up for free with the same email. The shop will appear in your dashboard marked “(accountant)”. You can read orders and refunds, download the XML and mark it as filed. You cannot change data.")}</p>

      <H id="problems">{t("8. Чести проблеми", "8. Common problems")}</H>
      <div className="mt-3 space-y-3">
        {problems.map(([q, a]) => (
          <details key={q} className="card">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-2 text-muted">{a}</p>
          </details>
        ))}
      </div>

      <p className="mt-10">{t("Нещо не е ясно?", "Something unclear?")} <Link href="/contact" className="text-brand-dark">{t("Пишете ни", "Write to us")}</Link>.</p>
    </div>
  );
}
