// frontend/src/components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../style.css";

const Navbar = () => {
  const navigate = useNavigate();

  // State to track if the Search Stocks link is disabled
  const [searchDisabled, setSearchDisabled] = useState(false);
  // State to store the countdown (in seconds)
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    // If the search link is disabled, start a countdown timer
    if (searchDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          // When countdown reaches 1, clear the interval and re-enable the link
          if (prev <= 1) {
            clearInterval(timer);
            setSearchDisabled(false);
            return 30; // Reset countdown for next time
          }
          return prev - 1;
        });
      }, 1000);
    }
    // Clean up the timer when component unmounts or searchDisabled changes
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [searchDisabled]);

  // Handler for when the user clicks the "Search Stocks" link
  const handleSearchClick = () => {
    // Only process if the link is not disabled
    if (!searchDisabled) {
      // Navigate to the search page
      navigate("/search");
      // Disable the search link and start the countdown
      setSearchDisabled(true);
      setCountdown(30);
    }
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
            // When disabled, display a span with a countdown and disabled styling
            <span style={{ cursor: "not-allowed", color: "gray" }}>
              Search Stocks ({countdown})
            </span>
          ) : (
            // When enabled, display a clickable span that triggers the search click handler
            <span onClick={handleSearchClick} style={{ cursor: "pointer" }}>
              Search Stocks
            </span>
          )}
        </li>
        <li>
          <Link to="/performance">Performance</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
