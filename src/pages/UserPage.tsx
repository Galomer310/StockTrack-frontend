import { useState, useEffect } from "react"; // Import the useState and useEffect hooks
import { clearUser, setUser } from "../features/authSlice"; // Import the clearUser and setUser action creators
import { useSelector, useDispatch } from "react-redux"; // Import useSelector to access Redux state
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { RootState } from "../store"; // Import RootState for type definitions
import Watchlist from "./Watchlist"; // Import the Watchlist component
import TokenRefreshAlert from "../components/alerts/TokenRefreshAlert";
import TradeJournal from "../components/trades/TradeJournal";
import PortfolioSwitcher from "../components/portfolio/PortfolioSwitcher";
import { MyPortfolio } from "../api/portfolios";
import { useLanguage } from "../i18n/LanguageContext";

// Define the UserPage functional component

const UserPage = () => {
  const { accessToken, user, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // The dashboard is translated and sets its own direction (see
  // LanguageProvider for why direction is set per screen).
  const { t, dir, lang } = useLanguage();

  // The book currently open. Everything below it - holdings, cash, the trade
  // journal - is scoped to this one, and switching swaps all of them at once.
  const [active, setActive] = useState<MyPortfolio | null>(null);
  // Bumped after a trade so the switcher re-reads cash and equity, which a
  // buy or a sell has just changed.
  const [portfolioRefresh, setPortfolioRefresh] = useState(0);

  useEffect(() => {
    // Set timer for 60 minutes (60 * 60 * 1000 ms)
    const timer = setTimeout(() => {
      setShowRefreshAlert(true);
    }, 60 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [accessToken]);

  const handleUserResponse = async (isActive: boolean) => {
    if (isActive) {
      // User confirmed they are still here.
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }), // Send the refresh token in the body
          }
        );
        if (!response.ok) {
          throw new Error("Refresh failed");
        }
        const data = await response.json();
        // The endpoint returns both a new access token and a rotated refresh token.
        if (!data.accessToken || !data.refreshToken || !user) {
          throw new Error("Refresh response missing tokens");
        }
        // Store the new pair in Redux. Because the timer effect above depends on
        // accessToken, this also re-arms the 60 minute countdown for the next session.
        dispatch(
          setUser({
            user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
        );
        setShowRefreshAlert(false);
      } catch (error) {
        console.error("Error during refresh:", error);
        // If refresh fails, clear user state and redirect to login.
        dispatch(clearUser());
        navigate("/login");
      }
    } else {
      // Time ran out – log the user out.
      dispatch(clearUser());
      navigate("/login");
    }
  };

  // Return the user dashboard UI
  return (
    <div className="user-page-container" dir={dir} lang={lang}>
      {/* Container with CSS class for the user page */}
      {user ? ( // If user exists, render the dashboard
        <div>
          <section className="dashboard-info">
            {/* Section for dashboard descriptive text */}
            <h1>{t("dash_title")}</h1>
          </section>

          {/* Pick the book to work in. Everything below follows it. */}
          <PortfolioSwitcher
            refreshKey={portfolioRefresh}
            onPortfolioChange={setActive}
          />

          {active ? (
            <>
              {/* Remounted per portfolio: switching books should start from a
                  clean fetch rather than briefly showing the previous one's
                  holdings under the new one's name. */}
              <Watchlist
                key={active.id}
                portfolio={active}
                onTraded={() => setPortfolioRefresh((k) => k + 1)}
              />
              <section className="dashboard-journal">
                <h3>
                  <bdi>{active.name}</bdi> · {t("dash_journal")}
                </h3>
                <TradeJournal key={active.id} portfolioId={active.id} />
              </section>
            </>
          ) : (
            <p className="stock-empty">{t("dash_open_portfolio")}</p>
          )}
        </div>
      ) : (
        <p>{t("loading")}</p> // Shown until the session is restored
      )}
      {showRefreshAlert && (
        <TokenRefreshAlert onUserResponse={handleUserResponse} />
      )}
    </div>
  );
};

export default UserPage; // Export component as default
