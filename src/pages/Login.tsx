import React, { useState } from "react"; // Import React and useState hook
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useDispatch } from "react-redux"; // Import useDispatch for Redux actions
import { setUser } from "../features/authSlice"; // Import setUser action from authSlice

// Define the Login functional component
const Login = () => {
  const [email, setEmail] = useState(""); // State for storing the email input
  const [password, setPassword] = useState(""); // State for storing the password input
  const dispatch = useDispatch(); // Initialize dispatch for Redux actions
  const navigate = useNavigate(); // Initialize navigate for redirection

  // Handler function for the login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    const userData = { email, password }; // Prepare the user data object
    try {
      // Make a POST request to the login API endpoint
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/login`,
        {
          method: "POST", // HTTP method
          headers: { "Content-Type": "application/json" }, // Set the content type header
          body: JSON.stringify(userData), // Send the user data in JSON format
        }
      );
      if (!response.ok) {
        // Check if the response is not OK
        const errorData = await response.json(); // Parse error details
        alert(errorData.error || "Login failed"); // Alert the error message
        return; // Exit the function
      }
      const data = await response.json(); // Parse the successful response data
      console.log("Login successful:", data); // Log success to the console
      // Check that the response contains both accessToken and user data
      if (data.accessToken && data.user) {
        // Dispatch the setUser action with the user data and access token
        dispatch(
          setUser({
            user: { id: data.user.id, email: data.user.email },
            accessToken: data.accessToken,
          })
        );
        navigate("/user"); // Redirect to the user dashboard
      } else {
        alert("Login response did not contain expected data."); // Alert if expected data is missing
      }
    } catch (error) {
      alert("Error during login: " + (error as Error).message); // Alert if an error occurs during the request
    }
  };

  // Return the login form UI
  return (
    <>
      <div className="login-page">
        <div className="login-container">
          {" "}
          {/* Container with CSS class for login */}
          <form onSubmit={handleLogin}>
            {" "}
            {/* Form submission triggers handleLogin */}
            <input
              type="email" // Input field for email
              placeholder="Email" // Placeholder text
              value={email} // Bind value to email state
              onChange={(e) => setEmail(e.target.value)} // Update email state on change
              required // Mark input as required
            />
            <input
              type="password" // Input field for password
              placeholder="Password" // Placeholder text
              value={password} // Bind value to password state
              onChange={(e) => setPassword(e.target.value)} // Update password state on change
              required // Mark input as required
            />
            <button type="submit">Login</button> {/* Submit button */}
          </form>
          <button onClick={() => navigate("/")}>Back to Home</button>{" "}
          {/* Button to navigate back to Home */}
        </div>
        <div></div> {/* An empty div (can be removed if not used) */}
      </div>
    </>
  );
};

export default Login; // Export Login as default
