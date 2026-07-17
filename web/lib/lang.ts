/**
 * Detect a post's language. The site is Azerbaijani-first but intentionally
 * carries some English and German posts (PROJECT-PLAN.md §2). Heuristic:
 *  - Azerbaijani-specific letters (ə ı ğ ş) → az
 *  - German-specific letters (ä ß) or common German stopwords → de
 *  - otherwise → en
 */
export type PostLang = "az" | "en" | "de";

export const LANG_LABEL: Record<PostLang, string> = { az: "AZ", en: "EN", de: "DE" };

export function detectPostLanguage(text: string): PostLang {
  if (/[əığşĞŞİƏ]/.test(text)) return "az";
  const lower = text.toLowerCase();
  const germanWords =
    /\b(und|der|die|das|den|dem|mit|für|eine|ist|von|bei|auf|nicht|sich|oder|zur|zum|durch|werden|einer|beim)\b/;
  if (/[äß]/.test(text) || germanWords.test(lower)) return "de";
  return "en";
}
