"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { Arrow, IcoCheck } from "@/components/site/Icons";
import { useT } from "@/components/LangProvider";

export default function Contact() {
  const t = useT();
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().from("leads").insert({
      name: f.get("name"), email: f.get("email"), message: f.get("message"),
    });
    setState(error ? "err" : "ok");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-8 pt-10 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <Reveal><div className="eyebrow">{t("Контакти", "Contact")}</div></Reveal>
        <Reveal delay={80}><h1 className="mt-4 text-5xl sm:text-6xl">{t("Кажете ни как продавате.", "Tell us how you sell.")}</h1></Reveal>
        <Reveal delay={160}><p className="mt-5 max-w-md text-lg text-muted">{t("Заявете демо или задайте въпрос. Ще ви отговорим на имейла, който оставите.", "Request a demo or ask a question. We will reply to the email you leave.")}</p></Reveal>
      </div>
      <Reveal variant="scale">
        {state === "ok" ? (
          <div className="rounded-2xl border-[1.5px] border-foreground bg-card p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage text-white"><IcoCheck className="h-7 w-7" /></span>
            <h2 className="mt-4 text-3xl">{t("Получихме съобщението.", "We got your message.")}</h2>
            <p className="mt-2 text-muted">{t("Ще се свържем с вас скоро.", "We will be in touch soon.")}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl border-[1.5px] border-foreground bg-card p-7 sm:p-9">
            <label className="block text-sm font-semibold">{t("Име", "Name")}<input name="name" required className="input mt-1.5 font-normal" /></label>
            <label className="block text-sm font-semibold">{t("Имейл", "Email")}<input name="email" type="email" required className="input mt-1.5 font-normal" /></label>
            <label className="block text-sm font-semibold">{t("Съобщение", "Message")}<textarea name="message" rows={5} className="input mt-1.5 font-normal" /></label>
            <button className="btn w-full">{t("Изпрати", "Send")} <Arrow /></button>
            {state === "err" && <p className="text-sm text-red-700">{t("Грешка. Опитайте отново.", "Something went wrong. Please try again.")}</p>}
          </form>
        )}
      </Reveal>
    </div>
  );
}
