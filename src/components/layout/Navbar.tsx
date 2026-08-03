// frontend/src/components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { clearUser } from "../../features/authSlice";
import "../../style.css";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Current user from Redux; drives whether the Logout button is shown
  const user = useSelector((state: RootState) => state.auth.user);

  // State to track if the Search Stocks link is disabled
  const [searchDisabled, setSearchDisabled] = useState(false);
  // State to store the countdown (in seconds) for the Search Stocks button
  const [countdown, setCountdown] = useState(60);

  // State to track Dark Mode; false means light mode, true means dark mode
  const [darkMode, setDarkMode] = useState(false);

  // Update the document's body class based on darkMode state
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

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

  // Handler for toggling dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Handler for logging out: clear the session (which also removes the
  // persisted copy in localStorage) and return to the landing page.
  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Investment Hub</div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/user">Dashboard</Link>
        </li>
        <li>
          {searchDisabled ? (
            <span style={{ cursor: "not-allowed", color: "gray" }}>
              Search Stocks ({countdown})
            </span>
          ) : (
            <span onClick={handleSearchClick} style={{ cursor: "pointer" }}>
              Search Stocks
            </span>
          )}
        </li>
        <li>
          <Link to="/performance">Performance</Link>
        </li>
        <li>
          {/* Dark Mode toggle button */}
          <button onClick={toggleDarkMode} className="toggle-dark-mode">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </li>
        {user && (
          <li>
            {/* Logout button, only rendered while a session is active */}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
