import React, { useState, useEffect } from "react";
import { clearUser } from "../features/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import Watchlist from "./Watchlist";
import TokenRefreshAlert from "../components/alerts/TokenRefreshAlert";

const UserPage = () => {
  const { accessToken, user, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [countdown, setCountdown] = useState(15); // 15-second countdown
  const [isFirstEntry, setIsFirstEntry] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has visited before
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited) {
      setIsFirstEntry(false);
    } else {
      localStorage.setItem("hasVisited", "true");
    }

    // Start countdown only for first-time visitors
    if (isFirstEntry) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isFirstEntry]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRefreshAlert(true);
    }, 60 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [accessToken]);

  const handleUserResponse = async (isActive: boolean) => {
    if (isActive) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("New refresh token:", data.refreshToken);
          setShowRefreshAlert(false);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (error) {
        console.error("Error during refresh:", error);
        dispatch(clearUser());
        navigate("/login");
      }
    } else {
      dispatch(clearUser());
      navigate("/login");
    }
  };

  return (
    <div className="user-page-container">
      {countdown > 0 ? (
        <div className="welcome-overlay">
          <h2>Welcome to Investment Hub!</h2>
          <p>
            This app allows you to track stocks, monitor market performance, and
            manage your watchlist.
          </p>
          <p>The dashboard will be available in {countdown} seconds...</p>
        </div>
      ) : (
        user && (
          <div>
            <section className="dashboard-info">
              <h1>My Investment Dashboard</h1>
            </section>
            <Watchlist />
          </div>
        )
      )}
      {showRefreshAlert && (
        <TokenRefreshAlert onUserResponse={handleUserResponse} />
      )}
    </div>
  );
};

export default UserPage;
