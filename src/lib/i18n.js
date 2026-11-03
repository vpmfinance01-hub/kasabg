export const LANG_COOKIE = "lang";
export const DEFAULT_LANG = "bg";
export const normalizeLang = (v) => (v === "en" ? "en" : "bg");
export const makeT = (lang) => (bg, en) => (lang === "en" ? en : bg);
/** Език от бисквитката на заявката (за API маршрути). */
export function tFromRequest(req) {
  const m = /(?:^|;\s*)lang=(\w+)/.exec(req.headers.get("cookie") ?? "");
  return makeT(normalizeLang(m?.[1]));
}
