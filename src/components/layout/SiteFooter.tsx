import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";

/* ===========================================================================
   Site footer: the accessibility and privacy statements, on every page.
   ---------------------------------------------------------------------------
   The Israeli accessibility regulations expect the statement to be reachable
   from every page, and the privacy statement belongs next to it. Both
   routes are public.
   =========================================================================== */

const SiteFooter = () => {
  const { t, dir, lang } = useLanguage();
  return (
    <footer className="site-footer" dir={dir} lang={lang}>
      <nav aria-label={t("footer_nav_label")}>
        <ul>
          <li><Link to="/accessibility">{t("footer_accessibility")}</Link></li>
          <li><Link to="/privacy">{t("footer_privacy")}</Link></li>
        </ul>
      </nav>
    </footer>
  );
};

export default SiteFooter;
