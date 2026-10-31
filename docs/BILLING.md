# Плащане със Stripe

Докато не са зададени ключовете, плащането е изключено: бутоните „Избери“ в таблото показват съобщение, а `/api/stripe/webhook` връща 503. Пробният период и блокирането на бележките работят и без Stripe.

## Какво да настроите

1. В Stripe създайте 3 продукта (Starter, Essential, Premium), всеки с цена на месец и на година (годишната = месечната × 12 × 0,8).
2. В Vercel (Environment Variables) задайте:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_STARTER_YEARLY`
   - `STRIPE_PRICE_ESSENTIAL_MONTHLY`, `STRIPE_PRICE_ESSENTIAL_YEARLY`
   - `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_YEARLY`
   - по избор `NEXT_PUBLIC_SITE_URL` (по подразбиране `https://smwebsites.org`)
3. В Stripe → Developers → Webhooks добавете адрес `https://smwebsites.org/api/stripe/webhook` със събития
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
4. В Stripe включете Customer portal (за смяна на карта и фактури).
5. Преиздайте сайта (`vercel --prod`).

## Как работи

- Цените и лимитите са в `src/lib/plans.ts`.
- Статусът на магазина е в `stores.subscription_status` (`trial`, `active`, `past_due`, `canceled`). Собственикът не може да го променя; променя се само от Stripe webhook-а (`billing_apply`) и от админ панела.
- Правилото „активен ли е планът“ е в `private.store_active()`: пробен период + 3 дни толеранс, неплатена фактура + 3 дни, прекратен до края на платения период.
- Без активен план новите бележки и кредитни известия получават статус `blocked` и тръгват сами след активиране.
- Над лимита на плана бележките продължават да се изпращат; таблото показва предупреждение.
