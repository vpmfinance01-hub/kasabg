# КасаБГ: ръководство за програмиста

Състояние към 26.10.2026. Писано за преглед и поемане на проекта.

## 1. Какво е
SaaS за онлайн магазини по Алтернативния режим на Наредба Н-18: издава електронни касови бележки по имейл (PDF + текст), кредитни известия при възстановени суми, и подготвя месечния одиторски XML (Приложение 38). Интерфейсът е на български.

## 2. Архитектура
```
Магазин (WooCommerce / Shopify / JSON / CSV)
        │  POST /api/hooks/{woocommerce|shopify|generic}?key=<API ключ на магазина>
        ▼
Сайт (Next.js 16, App Router)  ──►  Supabase (Postgres, Auth, Storage)
        ▲                                   │ trigger → private.send_receipt()
        │                                   │ pg_net.http_post (x-kasabg-secret)
        │ /api/receipt-pdf, /api/send-receipt, /api/platform-mail
        │                                   ▼
        └────────────── n8n (webhook kasabg-receipt / kasabg-alert)
```
- **Сайт и API:** `src/app/**`. Работи едновременно на Vercel (smwebsites.org, сега публичният) и на VPS в Hostinger (временни адреси `*.187-126-13-139.sslip.io`, по-късно основният).
- **База:** Supabase проект `szbtrwqctfyopomxzrbv` (регион Франкфурт). Таблици: `stores, orders, receipts, refunds, store_members, store_email_settings, store_declarations, audit_exports, leads`; схема `private` (`settings`, `platform_admins`, помощни функции).
- **n8n:** работен процес „КасаБГ: изпращане на електронна бележка“, веригата е `Нова бележка → Проверка на ключа → Състави бележката → Направи PDF (HTTP към /api/receipt-pdf) → Изпрати от пощата (HTTP към /api/send-receipt) → Отбележи като изпратена (RPC mark_receipt_sent)`; втора верига за известие при неизпратени бележки. Източникът на процеса е `ops/n8n/build-workflow.mjs` (генерира JSON за внасяне).
- **VPS:** `/opt/kasabg` (Docker Compose: Caddy за HTTPS, node:22-alpine със сглобеното приложение, n8n). Сглобеното приложение е `next build` със `output: "standalone"`.

## 3. Как се стартира и тества
```
npm install
npm run dev        # http://localhost:3000
npm test           # node --experimental-strip-types --test (22 теста)
npx tsc --noEmit && npx eslint src
```
Нужни променливи: виж раздел 5.

## 4. Как се качва
- **Vercel:** `vercel --prod` (проект `kasabg`).
- **Сървър:** `ops/deploy-server.ps1` (сглобява, пакетира, качва, пресъздава контейнера).
- **n8n процес:** `node ops/n8n/build-workflow.mjs workflow.json` (променливи `KB_SECRET`, `KB_SUPA_URL`, `KB_SUPA_ANON`), после на сървъра `n8n import:workflow`, `n8n publish:workflow --id=kasabgReceipt01` и рестарт на n8n.
- **Внимание:** `docker compose restart` не презарежда `app.env`. Нужно е `docker compose up -d --force-recreate app`.

## 5. Тайни и настройки (имена, не стойности)
| Променлива | Къде |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel и `/opt/kasabg/app.env` (публични) |
| `N8N_SECRET` | Vercel, `app.env`, `private.settings.n8n_secret` (Supabase) и вътре в n8n процеса. **Един и същ ключ на 4 места.** |
| `PLATFORM_SMTP_HOST/PORT/USER/PASSWORD/FROM_NAME/FROM_EMAIL/SECURE` | само `/opt/kasabg/app.env` (обща поща на платформата) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_<ПЛАН>_<MONTHLY\|YEARLY>` | още не са зададени (виж `docs/BILLING.md`) |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_LOGIN` | по избор |
| `private.settings`: `n8n_receipt_url`, `n8n_alert_url`, `n8n_secret`, `smtp_key` | Supabase. `smtp_key` шифрова паролите на пощите на магазините |

## 6. Модел на сигурност
- RLS на всички таблици; помощни функции `private.is_owner(store)` и `private.is_member(store)`.
- Колоните на `stores` са отворени за запис само за безобидни полета. План, пробен период, `subscription_status` и Stripe данни се променят само чрез `billing_apply` (таен ключ) и `admin_update_store`.
- `api_key` на магазина се чете само от собственика чрез `get_api_key`.
- SECURITY DEFINER функции: `ingest_order`, `ingest_refund`, `save_declaration`, `anonymize_customer`, `delete_store`, `resend_receipt`, `resend_credit`, `billing_apply`, `mark_receipt_sent` и др. Проверете `search_path` и проверките за собственост във всяка.
- Вътрешни API маршрути са защитени със `x-kasabg-secret` (сравнение с `timingSafeEqual`). Публични: `/api/hooks/*` (ключ на магазина в адреса), `/api/stripe/webhook` (подпис на Stripe), `/api/declaration`, `/api/billing/checkout`, `/api/test-email` (Bearer токен на потребителя).
- Паролите на пощите на магазините се пазят криптирани в `store_email_settings.smtp_password_enc`.

## 7. Известни ограничения и дългове (честно)
1. **Няма файлове с миграции.** Схемата е прилагана през инструмента на Supabase. Трябва да се изнесе (`supabase db dump` или `supabase/migrations`) и да влезе в хранилището.
2. **Няма Git.** Кодът е само на един компютър. Първо създайте хранилище.
3. **Тайните са твърдо записани** в n8n процеса (ключът за webhook-а и Supabase publishable key). Преместете ги в credentials на n8n.
4. **Няма ограничение на заявките** (rate limit) на `/api/hooks/*`, `/api/declaration`, `/api/send-receipt`.
5. **Няма HMAC подпис на входящите webhook-ове** (WooCommerce/Shopify); ключът е в адреса.
6. **Резервни копия:** безплатният план на Supabase няма; VPS има само седмично копие. Томът на n8n не се копира извън сървъра.
7. **Бележката не съдържа още:** номер на финансовата транзакция, данъчна група и QR код (чл. 52о, ал. 1, т. 4, 5, 6 на Н-18). Спецификацията на QR не е намерена.
8. **PDF логото:** само PNG и JPEG; WebP се пропуска.
9. Двата работни процеса в n8n Cloud (старият) трябва да се спрат; Vercel и VPS работят паралелно, а `smwebsites.org` още сочи към Vercel.
10. Одиторският XML (`src/lib/auditXml.ts`) следва публична имплементация и **не е валидиран от НАП**.
11. Stripe е написан, но не е тестван с реални ключове.
12. Тестовите данни в Supabase (магазини „Кетен“, „Superman“, „Тестов магазин“) трябва да се изчистят.

## 8. Карта на кода
- `src/app/(site)/**` публичен сайт; `src/app/app/page.tsx` табло; `src/components/dash/**` разделите на таблото.
- `src/lib/integrations/**` разчитане на WooCommerce, Shopify и универсален JSON; `test/**` тестове.
- `src/lib/receiptPdf.ts` PDF; `src/lib/pack.ts` ZIP справка за счетоводителя; `src/lib/auditXml.ts` XML; `src/lib/declaration.ts` декларация при регистрация; `src/lib/plans.ts` планове.
- `ops/**` скриптове за сървъра и n8n.
