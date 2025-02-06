import { Link } from "react-router-dom"; // Import Link component for navigation
import "../../style.css"; // Import the CSS file for styling
// Define the Navbar functional component
const Navbar = () => {
  return (
    <nav className="navbar">
      {" "}
      {/* Navigation container with CSS class */}
      <div className="navbar-brand">Investment Hub</div> {/* Brand/logo text */}
      <ul className="navbar-links">
        {" "}
        {/* Unordered list for navigation links */}
        <li>
          <Link to="/">Home</Link> {/* Link to Home page */}
        </li>
        <li>
          <Link to="/user">Dashboard</Link> {/* Link to User Dashboard */}
        </li>
        <li>
          <Link to="/search">Search Stocks</Link>{" "}
          {/* Link to Stock Search page */}
        </li>
        <li>
          <Link to="/performance">Performance</Link>{" "}
          {/* Link to Portfolio Performance page */}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; // Export the Navbar component as default
