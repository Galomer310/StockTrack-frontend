import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "../style.css"; // Import the CSS file for styling

const Home = () => {
  const { t, dir, lang } = useLanguage();
  return (
    <div className="home-container" dir={dir} lang={lang}>
      <div className="hero">
        {/* The eyebrow line above the buttons is drawn by CSS (::before),
            which reads its text from data-eyebrow so it can be translated. */}
        <div className="hero-overlay" data-eyebrow={t("auth_eyebrow_home")}>
          <div className="hero-buttons">
            <Link to="/login" className="btn">
              {/* Link styled as a button for login */}
              {t("auth_login")}
            </Link>
            <Link to="/register" className="btn">
              {/* Link styled as a button for registration */}
              {t("auth_register")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
