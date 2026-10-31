# Български шаблони за писмата на Supabase

Къде се поставят: Supabase → Authentication → Emails → Templates. За всеки шаблон сменете **Subject** и **Message body**, после Save.

Линковете са с `token_hash`, така че работят във всеки браузър и на телефон, не само в този, от който е поискано писмото.

---

## Reset password (Нова парола)

**Subject:** Нова парола за КасаБГ

**Message body:**

```html
<h2>Нова парола</h2>
<p>Получихме заявка за нова парола за вашия профил в КасаБГ.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset">Задайте нова парола</a></p>
<p>Линкът е валиден за кратко време. Ако не сте поискали това, просто игнорирайте писмото.</p>
```

---

## Confirm signup (Потвърждение на регистрация)

**Subject:** Потвърдете профила си в КасаБГ

**Message body:**

```html
<h2>Добре дошли в КасаБГ</h2>
<p>Потвърдете имейла си, за да активирате профила.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/app">Потвърди имейла</a></p>
<p>Ако не сте се регистрирали, игнорирайте писмото.</p>
```

---

Забележка: `{{ .SiteURL }}` е Site URL от Authentication → URL Configuration. Сега е `https://smwebsites.org`.


## Двуезични писма за вход (български и английски)

При регистрация приложението записва езика на потребителя в `user_metadata.lang` (`bg` или `en`). В шаблоните на Supabase (Authentication → Email Templates) може да се ползва като `{{ .Data.lang }}`, така че едно и също писмо да излиза на езика на потребителя.

Пример за „Confirm signup“ (темата и тялото):

```
Тема: {{ if eq .Data.lang "en" }}Confirm your KasaBG account{{ else }}Потвърдете профила си в КасаБГ{{ end }}

{{ if eq .Data.lang "en" }}
<p>Hello,</p>
<p>Press the button to confirm your email and start using KasaBG.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/app">Confirm email</a></p>
{{ else }}
<p>Здравейте,</p>
<p>Натиснете бутона, за да потвърдите имейла си и да започнете работа с КасаБГ.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/app">Потвърди имейла</a></p>
{{ end }}
```

Същото важи за „Reset password“ (`type=recovery&next=/reset`). Потребители, регистрирани преди тази промяна, нямат `lang` и получават българския вариант (`{{ else }}`).


## Вход с линк по имейл (Magic Link)

В Supabase: Authentication → Email Templates → **Magic Link**. Ползва се и за нови потребители (създава профил при първия вход). Двуезичен шаблон:

```
Тема: {{ if eq .Data.lang "en" }}Your KasaBG sign-in link{{ else }}Вашият линк за вход в КасаБГ{{ end }}

{{ if eq .Data.lang "en" }}
<p>Hello,</p>
<p>Press the button to sign in to KasaBG. The link works once and expires soon.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/app">Sign in</a></p>
<p>If you did not ask for this, ignore this message.</p>
{{ else }}
<p>Здравейте,</p>
<p>Натиснете бутона, за да влезете в КасаБГ. Линкът важи веднъж и изтича скоро.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/app">Вход</a></p>
<p>Ако не сте го поискали вие, пренебрегнете това писмо.</p>
{{ end }}
```

Ако шаблонът ползва `{{ .ConfirmationURL }}` вместо горния адрес, входът пак работи (страницата `/auth/callback` го приема).
За нови потребители изпраща „Confirm signup“ вместо „Magic Link“: поддържайте и двата шаблона.
