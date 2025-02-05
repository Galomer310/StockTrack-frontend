import { Link } from "react-router-dom";
import "../../style.css";

const Navbar = () => {
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
          <Link to="/search">Search Stocks</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
