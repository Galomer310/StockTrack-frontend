import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { RootState } from "../store"; // Import RootState for type definitions
import Watchlist from "./Watchlist"; // Import the Watchlist component

// Define the UserPage functional component
const UserPage = () => {
  const user = useSelector((state: RootState) => state.auth.user); // Get the current user from Redux state
  const navigate = useNavigate(); // Initialize navigate for redirection

  // If no user is present, navigate to the login page
  if (!user) {
    navigate("/login"); // Redirect to login if user is not logged in
  }

  // Return the user dashboard UI
  return (
    <div className="user-page-container">
      {" "}
      {/* Container with CSS class for the user page */}
      {user ? ( // If user exists, render the dashboard
        <div>
          <section className="dashboard-info">
            {" "}
            {/* Section for dashboard descriptive text */}
            <h1>My Investment Dashboard</h1> {/* Dashboard heading */}
          </section>
          <Watchlist /> {/* Render the Watchlist component */}
        </div>
      ) : (
        <p>Loading...</p> // Show loading text if user data is not yet available
      )}
    </div>
  );
};

export default UserPage; // Export component as default
