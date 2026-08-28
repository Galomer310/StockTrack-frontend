import React, { useState } from "react"; // Import React and useState hook
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useToast } from "../components/ui/ToastProvider";

// Define the Register functional component
const Register = () => {
  const [email, setEmail] = useState(""); // State for storing the email input
  const [password, setPassword] = useState(""); // State for storing the password input
  const [displayName, setDisplayName] = useState(""); // Public name shown on the leaderboard
  const navigate = useNavigate(); // Initialize navigate for redirection
  const toast = useToast();

  // Handler function for registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    const userData = { email, password, display_name: displayName }; // Prepare the user data object
    try {
      // Make a POST request to the register API endpoint
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/register`,
        {
          method: "POST", // HTTP method
          headers: { "Content-Type": "application/json" }, // Set the content type header
          body: JSON.stringify(userData), // Send the user data in JSON format
        }
      );
      if (!response.ok) {
        // Check if response is not OK
        const errorData = await response.json(); // Parse error details
        toast.error(errorData.error || "Registration failed");
        return; // Exit the function
      }
      const data = await response.json(); // Parse the successful response data
      console.log("Registration successful:", data); // Log success to the console
      navigate("/login"); // Redirect to the Login page after successful registration
    } catch (error) {
      toast.error((error as Error).message, "Could not create account");
    }
  };

  // Return the registration form UI
  return (
    <>
      <div className="register-page">
        <div className="register-container">
          {" "}
          {/* Container with CSS class for registration */}
          <form onSubmit={handleRegister}>
            {" "}
            {/* Form submission triggers handleRegister */}
            <input
              type="text" // Public display name, shown to everyone on the leaderboard
              placeholder="Display name (shown on the leaderboard)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              required
            />
            <input
              type="email" // Input field for email
              placeholder="Email" // Placeholder text
              value={email} // Bind value to email state
              onChange={(e) => setEmail(e.target.value)} // Update email state on change
              required // Mark input as required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              autoComplete="new-password"
            />
            {/* The server rejects short and common passwords. Stating the rule
                here means finding out before submitting rather than after: the
                same requirement, but as guidance instead of a refusal. */}
            <p className="field-hint">
              At least 12 characters. A phrase you can remember is stronger
              than a short jumble.
            </p>
            <button type="submit">Register</button>
          </form>
          <button onClick={() => navigate("/login")}>
            Already have an account? Login
          </button>{" "}
          {/* Button to navigate to Login page */}
        </div>
      </div>
    </>
  );
};

export default Register; // Export Register as default
