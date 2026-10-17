import { createContext, useContext } from "react";
import { Lang, MessageKey } from "./messages";

export interface LanguageValue {
  lang: Lang;
  /** Writing direction for a translated screen's root element. */
  dir: "rtl" | "ltr";
  /** BCP 47 tag for Intl number and date formatting; undefined means the browser's own. */
  locale: string | undefined;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey) => string;
}

export const LanguageContext = createContext<LanguageValue | null>(null);

export const useLanguage = (): LanguageValue => {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return value;
};
