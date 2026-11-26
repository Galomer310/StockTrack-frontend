import { useLanguage } from "../../i18n/LanguageContext";

/* ===========================================================================
   "Skip to main content" (IS 5568 / WCAG 2.4.1, bypass blocks).
   ---------------------------------------------------------------------------
   The first focusable element on every page. Hidden until it receives
   keyboard focus, then shown at the top corner, so a keyboard or
   screen-reader user does not have to Tab through the header and the five
   tabs on every screen.
   =========================================================================== */

export const MAIN_ID = "main-content";

export const SkipLink = () => {
  const { t, dir, lang } = useLanguage();

  const skip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // The router owns the URL: move focus without adding #main-content to it.
    e.preventDefault();
    const main = document.getElementById(MAIN_ID);
    main?.focus();
    main?.scrollIntoView();
  };

  return (
    <a href={`#${MAIN_ID}`} className="skip-link" onClick={skip} dir={dir} lang={lang}>
      {t("a11y_skip_to_content")}
    </a>
  );
};
