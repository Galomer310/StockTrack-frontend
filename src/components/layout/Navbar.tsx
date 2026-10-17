// frontend/src/components/Navbar.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { clearUser } from "../../features/authSlice";
import { clearActivePortfolio } from "../../features/portfolioSlice";
import { useLanguage } from "../../i18n/LanguageContext";
import "../../style.css";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Current user from Redux; drives whether the Logout button is shown
  const user = useSelector((state: RootState) => state.auth.user);

  // Interface language. The navbar is translated and sets its own `dir`, so
  // in Hebrew it reads right to left - and its drawer opens from the left -
  // even while the pages below are not yet ported (see LanguageProvider).
  const { lang, dir, setLang, t } = useLanguage();

  // State to track if the Search Stocks link is disabled
  const [searchDisabled, setSearchDisabled] = useState(false);
  // State to store the countdown (in seconds) for the Search Stocks button
  const [countdown, setCountdown] = useState(60);

  // Mobile menu. Below the tablet breakpoint the links collapse behind a
  // hamburger; above it this state is irrelevant because the panel is static.
  const [menuOpen, setMenuOpen] = useState(false);

  // The design is dark by default; this opts into the light variant instead.
  // Restored from localStorage so the choice survives a reload.
  const [lightMode, setLightMode] = useState(
    () => localStorage.getItem("investments_theme") === "light"
  );

  // Apply the variant to <body> and remember the preference
  useEffect(() => {
    document.body.classList.toggle("light-mode", lightMode);
    localStorage.setItem("investments_theme", lightMode ? "light" : "dark");
  }, [lightMode]);

  // Any navigation closes the menu, so tapping a link never leaves it hanging open
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Escape closes the menu, and while it is open the page behind must not scroll
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("nav-locked");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("nav-locked");
    };
  }, [menuOpen]);

  // useEffect to handle Search Stocks button countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (searchDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setSearchDisabled(false);
            return 10; // Reset countdown for next use
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [searchDisabled]);

  // Handler for the Search Stocks link click
  const handleSearchClick = () => {
    if (!searchDisabled) {
      navigate("/search");
      setSearchDisabled(true);
      setCountdown(11);
    }
  };

  // Handler for switching between the dark and light variants
  const toggleDarkMode = () => {
    setLightMode((prev) => !prev);
  };

  // Handler for logging out: clear the session (which also removes the
  // persisted copy in localStorage) and return to the landing page.
  const handleLogout = () => {
    dispatch(clearUser());
    // Forget which portfolio was open too: whoever signs in on this browser
    // next must not start out pointing at someone else's book.
    dispatch(clearActivePortfolio());
    navigate("/");
  };

  return (
    <>
      <nav className="navbar" dir={dir} lang={lang}>
        <div className="navbar-brand">Investments</div>

        {/* Hamburger, shown only below the tablet breakpoint. The three bars
            morph into a cross while the panel is open. */}
        <button
          className={`nav-toggle${menuOpen ? " is-open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={t(menuOpen ? "nav_close_menu" : "nav_open_menu")}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <ul
          id="primary-navigation"
          className={`navbar-links${menuOpen ? " is-open" : ""}`}
        >
          <li>
            <Link to="/">{t("nav_home")}</Link>
          </li>
          <li>
            <Link to="/user">{t("nav_dashboard")}</Link>
          </li>
          <li>
            <Link to="/player">{t("nav_player_card")}</Link>
          </li>
          <li>
            {searchDisabled ? (
              <span className="nav-disabled">
                {t("nav_search")} (<bdi>{countdown}</bdi>)
              </span>
            ) : (
              <span className="nav-action" onClick={handleSearchClick}>
                {t("nav_search")}
              </span>
            )}
          </li>
          {/* No Performance link: it lives on the dashboard now, under the
              over-time chart, because it describes whichever portfolio you
              have open rather than being a place of its own. */}
          <li>
            <Link to="/market">{t("nav_market")}</Link>
          </li>
          <li>
            <Link to="/feed">{t("nav_feed")}</Link>
          </li>
          <li>
            <Link to="/leaderboard">{t("nav_leaderboard")}</Link>
          </li>
          <li className="nav-controls">
            {/* Language toggle, labelled in the language it switches to */}
            <button
              onClick={() => setLang(lang === "he" ? "en" : "he")}
              className="toggle-lang"
              lang={lang === "he" ? "en" : "he"}
              aria-label={t("nav_switch_language_label")}
            >
              {t("nav_switch_language")}
            </button>
            {/* Theme toggle */}
            <button onClick={toggleDarkMode} className="toggle-dark-mode">
              {t(lightMode ? "nav_dark_mode" : "nav_light_mode")}
            </button>
            {user && (
              /* Logout, only rendered while a session is active */
              <button onClick={handleLogout} className="logout-btn">
                {t("nav_logout")}
              </button>
            )}
          </li>
        </ul>
      </nav>

      {/* Tap-anywhere-to-close scrim behind the open mobile panel */}
      <div
        className={`nav-scrim${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    </>
  );
};

export default Navbar;
