import React, { useState } from "react"; // Import React and useState hook
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// Define the Register functional component
const Register = () => {
  const [email, setEmail] = useState(""); // State for storing the email input
  const [password, setPassword] = useState(""); // State for storing the password input
  const navigate = useNavigate(); // Initialize navigate for redirection

  // Handler function for registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    const userData = { email, password }; // Prepare the user data object
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
        alert(errorData.error || "Registration failed"); // Alert the error message
        return; // Exit the function
      }
      const data = await response.json(); // Parse the successful response data
      console.log("Registration successful:", data); // Log success to the console
      navigate("/login"); // Redirect to the Login page after successful registration
    } catch (error) {
      alert("Error during registration: " + (error as Error).message); // Alert if an error occurs
    }
  };

  // Return the registration form UI
  return (
    <div className="register-container">
      {" "}
      {/* Container with CSS class for registration */}
      <form onSubmit={handleRegister}>
        {" "}
        {/* Form submission triggers handleRegister */}
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
        <button type="submit">Register</button> {/* Submit button */}
      </form>
      <button onClick={() => navigate("/login")}>
        Already have an account? Login
      </button>{" "}
      {/* Button to navigate to Login page */}
    </div>
  );
};

export default Register; // Export Register as default
