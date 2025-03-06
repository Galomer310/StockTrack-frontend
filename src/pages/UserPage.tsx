import React, { useState, useEffect } from "react"; // Import React and the useState and useEffect hooks
import { clearUser } from "../features/authSlice"; // Import the clearUser action creator
import { useSelector, useDispatch } from "react-redux"; // Import useSelector to access Redux state
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { RootState } from "../store"; // Import RootState for type definitions
import Watchlist from "./Watchlist"; // Import the Watchlist component
import TokenRefreshAlert from "../components/alerts/TokenRefreshAlert";

// Define the UserPage functional component

const UserPage = () => {
  const { accessToken, user, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        if (response.ok) {
          const data = await response.json();
          console.log("New refresh token:", data.refreshToken);
          // Optionally, update your state with the new refresh token
          // Reset the timer for the next session as needed.
          setShowRefreshAlert(false);
        } else {
          throw new Error("Refresh failed");
        }
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
    <div className="user-page-container">
      {/* Container with CSS class for the user page */}
      {user ? ( // If user exists, render the dashboard
        <div>
          <section className="dashboard-info">
            {/* Section for dashboard descriptive text */}
            <h1>My Investment Dashboard</h1> {/* Dashboard heading */}
          </section>
          <Watchlist /> {/* Render the Watchlist component */}
        </div>
      ) : (
        <p>Loading...</p> // Show loading text if user data is not yet available
      )}
      {showRefreshAlert && (
        <TokenRefreshAlert onUserResponse={handleUserResponse} />
      )}
    </div>
  );
};

export default UserPage; // Export component as default
