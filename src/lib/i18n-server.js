// За сървърни компоненти: езикът идва от бисквитката.
import { cookies } from "next/headers";
import { LANG_COOKIE, makeT, normalizeLang } from "./i18n";
export async function getLang() {
  return normalizeLang((await cookies()).get(LANG_COOKIE)?.value);
}
export async function getT() {
  return makeT(await getLang());
}
