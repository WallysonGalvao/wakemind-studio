import en from "./locales/en/index";
import pt from "./locales/pt/index";

export type Locale = "pt" | "en";

const translations = {
  pt,
  en,
};

/**
 * Get translations for server-side components
 * @param locale - The locale to get translations for (default: "pt")
 * @returns The translation object for the specified locale
 */
export function getTranslations(locale: Locale = "pt") {
  return translations[locale] || translations.pt;
}

/**
 * Get a specific translation key from the translations
 * @param locale - The locale to get translation for
 * @param key - The dot-notation key path (e.g., "seo.metadata.title")
 * @returns The translated string or the key if not found
 */
export function t(locale: Locale, key: string): string {
  const keys = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = translations[locale] || translations.pt;

  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = result[k];
    } else {
      return key;
    }
  }

  return typeof result === "string" ? result : key;
}

/**
 * Get array of translations
 * @param locale - The locale to get translation for
 * @param key - The dot-notation key path
 * @returns The translated array or empty array if not found
 */
export function tArray(locale: Locale, key: string): string[] {
  const keys = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = translations[locale] || translations.pt;

  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = result[k];
    } else {
      return [];
    }
  }

  return Array.isArray(result) ? result : [];
}

export { en, pt };
