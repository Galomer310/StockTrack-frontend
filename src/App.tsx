// Import routing components from react-router-dom
import {
  BrowserRouter as Router, // Router component for handling routing
  Routes, // Component to wrap route definitions
  Route, // Individual route definition component
  Navigate, // Component for redirection
} from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import { RootState } from "./store"; // Import RootState for type definitions
import Home from "./pages/Home"; // Import Home page component
import Login from "./pages/Login"; // Import Login page component
import Register from "./pages/Register"; // Import Register page component
import UserPage from "./pages/UserPage"; // Import UserPage component
import StockSearch from "./pages/StockSearch"; // Import StockSearch page component
import ManualAddStock from "./pages/ManualAddStock"; // Import ManualAddStock page component
import Navbar from "./components/layout/Navbar"; // Import Navbar component
import PortfolioPerformancePage from "./pages/PortfolioPerformancePage"; // Import PortfolioPerformancePage component

// Define the main App functional component
const App = () => {
  const user = useSelector((state: RootState) => state.auth.user); // Get the current user from Redux state

  return (
    <Router>
      {" "}
      {/* Wrap the app with Router */}
      <Navbar /> {/* Render the Navbar at the top */}
      <Routes>
        {" "}
        {/* Define all application routes */}
        <Route path="/" element={<Home />} /> {/* Home page route */}
        <Route path="/login" element={<Login />} /> {/* Login page route */}
        <Route path="/register" element={<Register />} />{" "}
        {/* Register page route */}
        <Route
          path="/user"
          element={user ? <UserPage /> : <Navigate to="/login" />} // Render UserPage if logged in, otherwise redirect to login
        />
        <Route
          path="/search"
          element={user ? <StockSearch /> : <Navigate to="/login" />} // Render StockSearch if logged in, otherwise redirect to login
        />
        <Route
          path="/manual-add"
          element={user ? <ManualAddStock /> : <Navigate to="/login" />} // Render ManualAddStock if logged in, otherwise redirect to login
        />
        <Route
          path="/performance"
          element={
            user ? <PortfolioPerformancePage /> : <Navigate to="/login" /> // Render PortfolioPerformancePage if logged in, otherwise redirect to login
          }
        />
      </Routes>
    </Router>
  );
};

export default App; // Export the App component as default
