import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

type SupportedLang = "pt" | "en";
const SUPPORTED_LANGS: SupportedLang[] = ["pt", "en"];
const DEFAULT_LANG: SupportedLang = "pt";

const isBrowser = typeof window !== "undefined";

// Detect the user's preferred language before loading any resources
function detectInitialLang(): SupportedLang {
  if (!isBrowser) return DEFAULT_LANG;
  const stored = localStorage.getItem("fenrir-privacy-lang");
  if (stored && SUPPORTED_LANGS.includes(stored as SupportedLang)) {
    return stored as SupportedLang;
  }
  const browserLang = navigator.language.split("-")[0];
  if (SUPPORTED_LANGS.includes(browserLang as SupportedLang)) {
    return browserLang as SupportedLang;
  }
  return DEFAULT_LANG;
}

// Dynamically import a locale — Vite splits these into separate chunks
async function loadLocale(lang: SupportedLang): Promise<Record<string, unknown>> {
  const mod = await import(`./locales/${lang}/index.ts`);
  return mod.default;
}

// Register a locale into i18n if not already loaded
async function ensureLocaleLoaded(lang: string): Promise<void> {
  if (!SUPPORTED_LANGS.includes(lang as SupportedLang)) return;
  if (i18n.hasResourceBundle(lang, "translation")) return;
  const translations = await loadLocale(lang as SupportedLang);
  i18n.addResourceBundle(lang, "translation", translations);
}

// Load the initial language's resources before init so no flash of missing keys
const initialLang = detectInitialLang();
const initialTranslations = await loadLocale(initialLang);

const resources: Record<string, { translation: Record<string, unknown> }> = {
  [initialLang]: { translation: initialTranslations },
};

// If initial lang isn't the fallback, preload fallback too (prevents broken UI)
if (initialLang !== DEFAULT_LANG) {
  resources[DEFAULT_LANG] = { translation: await loadLocale(DEFAULT_LANG) };
}

const i18nConfig = {
  resources,
  lng: initialLang,
  fallbackLng: DEFAULT_LANG,
  debug: import.meta.env.DEV && isBrowser,
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: isBrowser ? ["localStorage", "navigator"] : [],
    caches: isBrowser ? ["localStorage"] : [],
    lookupLocalStorage: "fenrir-privacy-lang",
  },
  react: {
    useSuspense: false,
  },
};

if (!i18n.isInitialized) {
  try {
    if (isBrowser) {
      i18n.use(LanguageDetector);
    }
    i18n
      .use(initReactI18next)
      .init(i18nConfig)
      .catch((err) => {
        console.error("[i18n] Failed to initialize:", err);
      });
  } catch (error) {
    console.error("[i18n] Error during initialization:", error);
    i18n
      .use(initReactI18next)
      .init(i18nConfig)
      .catch((err) => {
        console.error("[i18n] Fallback initialization failed:", err);
      });
  }
}

// Lazy-load locales when the user switches language
i18n.on("languageChanged", (lang: string) => {
  ensureLocaleLoaded(lang).catch((err) => {
    console.error("[i18n] Failed to load locale:", lang, err);
  });
});

export default i18n;
