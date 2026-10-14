import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";

/* ===========================================================================
   Routing, and what is in the first download.
   ---------------------------------------------------------------------------
   Every page used to be a static import, so the browser fetched the entire
   application before it could paint anything - including Chart.js, which is
   the single heaviest dependency here and is needed by four screens out of
   thirteen. Someone opening the login page waited for the charting library
   they would not see until after they had signed in.

   Only the three things a first-time visitor actually reaches are eager now:
   the navbar, the landing page and the login form. Everything else is a
   separate chunk fetched on navigation, which is also why the chart-bearing
   pages no longer pull their weight into the initial load.

   Register stays lazy despite sitting next to Login: whoever is registering
   has time to spare, and the two screens do not share enough to be worth
   pinning both.
   =========================================================================== */

const Register = lazy(() => import("./pages/Register"));
const UserPage = lazy(() => import("./pages/UserPage"));
const StockSearch = lazy(() => import("./pages/StockSearch"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Feed = lazy(() => import("./pages/Feed"));
const Market = lazy(() => import("./pages/Market"));
const InvestorPortfolio = lazy(() => import("./pages/InvestorPortfolio"));
const StockPage = lazy(() => import("./pages/StockPage"));
const ComparePortfolios = lazy(() => import("./pages/ComparePortfolios"));

// Shown while a route chunk is in flight. Deliberately quiet: on a fast
// connection the chunk arrives in a few frames, and a spinner that appears
// and vanishes that quickly reads as a flicker rather than as progress.
const RouteFallback = () => (
  <div className="route-loading" role="status" aria-live="polite">
    Loading...
  </div>
);

const App = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Every authenticated route repeats the same "signed in, or go to login"
  // check. Writing it once keeps the table below readable and makes it
  // impossible to add a route that forgets the guard.
  const guarded = (element: React.ReactNode) =>
    user ? element : <Navigate to="/login" />;

  return (
    <Router>
      <Navbar />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/user" element={guarded(<UserPage />)} />
          <Route path="/search" element={guarded(<StockSearch />)} />
          <Route path="/leaderboard" element={guarded(<Leaderboard />)} />
          <Route path="/feed" element={guarded(<Feed />)} />
          <Route path="/market" element={guarded(<Market />)} />
          <Route path="/investor/:id" element={guarded(<InvestorPortfolio />)} />
          <Route path="/stock/:ticker" element={guarded(<StockPage />)} />
          <Route path="/compare/:id" element={guarded(<ComparePortfolios />)} />

          {/* Performance moved onto the dashboard, under the over-time chart.
              The route is kept as a redirect so an old bookmark still lands
              somewhere useful instead of on a blank 404. */}
          <Route path="/performance" element={<Navigate to="/user" replace />} />

          {/* Manual entry is gone: every position opens at the market price.
              Search is where a buy starts now, so an old link lands there. */}
          <Route path="/manual-add" element={<Navigate to="/search" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
