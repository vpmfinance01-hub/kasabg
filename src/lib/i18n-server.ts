// За сървърни компоненти: езикът идва от бисквитката.
import { cookies } from "next/headers";
import { LANG_COOKIE, makeT, normalizeLang, type Lang, type T } from "./i18n";

export async function getLang(): Promise<Lang> {
  return normalizeLang((await cookies()).get(LANG_COOKIE)?.value);
}

export async function getT(): Promise<T> {
  return makeT(await getLang());
}
