import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { clearUser } from "../../features/authSlice";
import { clearActivePortfolio } from "../../features/portfolioSlice";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";
import "../../style.css";
import "./navbar.css";

/* ===========================================================================
   Navigation (approved design, 2026-11): five places, the same five on every
   screen size. On a computer they sit in the top bar; on a phone they move
   to a tab bar at the bottom, within thumb's reach, and the top bar keeps
   only the brand, the language and signing out.

     Portfolios (/user)   Arena (/arena)   Feed (/feed)   Search (/search)   Me (/player)

   The Market page and stock pages count as Search; the Player Card's own
   pages (achievements, medals, rewards) count as Me.

   Dark only: the light variant is retired, so any stored preference for it
   is cleared on load.
   =========================================================================== */

const TABS: { to: string; label: MessageKey; icon: string; also: string[] }[] = [
  { to: "/user", label: "nav_tab_portfolios", icon: "M4 19V9M10 19V5M16 19v-7M22 19H2", also: ["/compare", "/performance"] },
  { to: "/arena", label: "nav_leaderboard", icon: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 6h3v2a3 3 0 0 1-3 3M7 6H4v2a3 3 0 0 0 3 3", also: ["/investor"] },
  { to: "/feed", label: "nav_feed", icon: "M4 6h16M4 12h16M4 18h10", also: [] },
  { to: "/search", label: "nav_tab_search", icon: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM20 20l-4.3-4.3", also: ["/market", "/stock"] },
  { to: "/player", label: "nav_tab_me", icon: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0", also: [] },
];

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const { lang, dir, setLang, t } = useLanguage();

  // Dark only: undo any light-mode choice stored by the old toggle.
  useEffect(() => {
    document.body.classList.remove("light-mode");
    try {
      localStorage.removeItem("investments_theme");
    } catch {
      /* storage may be unavailable; nothing to undo then */
    }
  }, []);

  // The tab bar needs room at the bottom of the page on phones.
  useEffect(() => {
    document.body.classList.toggle("has-tabbar", !!user);
    return () => document.body.classList.remove("has-tabbar");
  }, [user]);

  const isActive = (tab: (typeof TABS)[number]) =>
    pathname === tab.to || pathname.startsWith(`${tab.to}/`) || tab.also.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const logout = () => {
    dispatch(clearUser());
    // Whoever signs in on this browser next must not start in someone else's book.
    dispatch(clearActivePortfolio());
    navigate("/");
  };

  const tabs = (cls: string) => (
    <nav className={cls} aria-label={t("nav_main")}>
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={isActive(tab) ? "is-on" : ""} aria-current={isActive(tab) ? "page" : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={tab.icon} />
          </svg>
          <span>{t(tab.label)}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <header className="topbar" dir={dir} lang={lang}>
        <div className="topbar-in">
          <Link to={user ? "/user" : "/"} className="tb-brand">INVESTMENTS</Link>
          {user && tabs("tb-tabs")}
          <div className="tb-tools">
            <button
              type="button"
              onClick={() => setLang(lang === "he" ? "en" : "he")}
              className="tb-tool"
            >
              {/* The visible name is in the other language and is read in
                  it; the hidden part says what the button does, in the
                  current one. The accessible name contains the visible text,
                  so voice control ("click English") still finds it. */}
              <span lang={lang === "he" ? "en" : "he"}>{t("nav_switch_language")}</span>
              <span className="visually-hidden"> ({t("nav_switch_language_label")})</span>
            </button>
            {user ? (
              <button type="button" onClick={logout} className="tb-tool">
                {t("nav_logout")}
              </button>
            ) : (
              <Link to="/login" className="tb-tool">{t("nav_sign_in")}</Link>
            )}
          </div>
        </div>
      </header>
      {user && (
        <div className="tabbar" dir={dir} lang={lang}>
          {tabs("tabbar-in")}
        </div>
      )}
    </>
  );
};

export default Navbar;
