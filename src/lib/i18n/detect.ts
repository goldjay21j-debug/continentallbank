import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./dictionaries";

const COOKIE_NAME = "cb_locale";

function parseAcceptLanguage(value: string | null): Locale | null {
  if (!value) return null;
  const tags = value
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";");
      const q = qPart?.startsWith("q=") ? Number(qPart.slice(2)) : 1;
      return { tag: tag.toLowerCase().split("-")[0], q: Number.isFinite(q) ? q : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    const match = SUPPORTED_LOCALES.find((l) => l === tag);
    if (match) return match;
  }
  return null;
}

/**
 * Server-side locale resolution.
 *   1. explicit cookie (set by the language switcher / saved preference)
 *   2. saved profile preference for signed-in users
 *   3. Accept-Language header
 *   4. CF / Vercel country header → language mapping (fallback only)
 *   4. DEFAULT_LOCALE
 */
export async function detectLocale(options: { preferredLocale?: string | null } = {}): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIE_NAME)?.value as Locale | undefined;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;

  const preferredLocale = options.preferredLocale as Locale | undefined;
  if (preferredLocale && SUPPORTED_LOCALES.includes(preferredLocale)) return preferredLocale;

  const h = await headers();
  const fromHeader = parseAcceptLanguage(h.get("accept-language"));
  if (fromHeader) return fromHeader;

  const country = (h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? "").toUpperCase();
  const countryMap: Record<string, Locale> = {
    FR: "fr",
    DE: "de",
    AT: "de",
    CH: "de",
    ES: "es",
    IT: "it",
    AE: "ar",
    SA: "ar",
    EG: "ar",
    CN: "zh",
    HK: "zh",
    TW: "zh",
  };
  const fromCountry = countryMap[country];
  if (fromCountry) return fromCountry;

  return DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = COOKIE_NAME;
