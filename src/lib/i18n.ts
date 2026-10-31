// Езици на интерфейса: български (основен) и английски. Изборът се пази в бисквитка `lang`.
export type Lang = "bg" | "en";
export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "bg";
export const normalizeLang = (v: string | undefined | null): Lang => (v === "en" ? "en" : "bg");

/** Превод по двойка текстове: t("Български", "English"). */
export type T = (bg: string, en: string) => string;
export const makeT = (lang: Lang): T => (bg, en) => (lang === "en" ? en : bg);

/** Език от бисквитката на заявката (за API маршрути). */
export function tFromRequest(req: Request): T {
  const m = /(?:^|;\s*)lang=(\w+)/.exec(req.headers.get("cookie") ?? "");
  return makeT(normalizeLang(m?.[1]));
}
