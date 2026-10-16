import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./LanguageContext";
import { Lang, LOCALES, MESSAGES, MessageKey } from "./messages";

/* ===========================================================================
   The chosen interface language.
   ---------------------------------------------------------------------------
   Remembered per browser, and defaulting to Hebrew for a browser set to
   Hebrew, English otherwise.

   It sets `lang` on <html> but deliberately NOT `dir`. Only translated
   screens are ready for right-to-left: the rest of the stylesheet still uses
   physical left/right, and flipping the whole document would mirror screens
   that have not been ported. A translated screen sets `dir` on its own root
   instead, so the switch can spread one screen at a time.
   =========================================================================== */

const STORAGE_KEY = "investments_lang";

const initialLang = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "he" || saved === "en") return saved;
  } catch {
    // Storage can be unavailable in private browsing; fall through.
  }
  return navigator.language?.toLowerCase().startsWith("he") ? "he" : "en";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered across visits; the choice still applies now.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      dir: lang === "he" ? ("rtl" as const) : ("ltr" as const),
      locale: LOCALES[lang],
      setLang,
      t: (key: MessageKey) => MESSAGES[lang][key],
    }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
