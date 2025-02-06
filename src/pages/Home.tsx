import { Link } from "react-router-dom";
import "../style.css"; // Import the CSS file for styling

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero">
        <div className="hero-overlay">
          <div className="hero-buttons">
            <Link to="/login" className="btn">
              {/* Link styled as a button for login */}
              Login
            </Link>
            <Link to="/register" className="btn">
              {/* Link styled as a button for registration */}
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
