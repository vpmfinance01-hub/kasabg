import type { Metadata } from "next";
import { JetBrains_Mono, Onest, Oswald } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { getLang } from "@/lib/i18n-server";

const display = Oswald({ subsets: ["latin", "cyrillic"], variable: "--font-display-src", weight: ["500", "600", "700"], display: "swap" });
const body = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-body-src", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-mono-src", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLang()) === "en";
  return en
    ? {
        title: "KasaBG — electronic receipts and the audit file for online shops",
        description: "Automatic audit XML file for the Bulgarian NRA and electronic receipts for online shops under Ordinance N-18.",
      }
    : {
        title: "КасаБГ — одиторски файл и електронни касови бележки",
        description: "Автоматичен одиторски XML файл за НАП и електронни касови бележки за онлайн магазини по Наредба Н-18.",
      };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"||t==="nexus")document.documentElement.dataset.theme=t}catch(e){}` }} />
      </head>
      <body>
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
