import React, { useState } from "react"; // Import React and useState hook
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useDispatch } from "react-redux"; // Import useDispatch for Redux actions
import { setUser } from "../features/authSlice"; // Import setUser action from authSlice
import { useToast } from "../components/ui/ToastProvider";
import { useLanguage } from "../i18n/LanguageContext";
import { errorBodyMessage } from "../i18n/fill";

// Define the Login functional component
const Login = () => {
  const [email, setEmail] = useState(""); // State for storing the email input
  const [password, setPassword] = useState(""); // State for storing the password input
  const dispatch = useDispatch(); // Initialize dispatch for Redux actions
  const navigate = useNavigate(); // Initialize navigate for redirection
  const toast = useToast();
  const { t, dir, lang } = useLanguage();

  // The server's refusals, by error code, for the Hebrew screen
  const errorsByCode = {
    INVALID_CREDENTIALS: t("auth_invalid_credentials"),
    CREDENTIALS_REQUIRED: t("auth_credentials_required"),
    TOO_MANY_LOGIN_ATTEMPTS: t("auth_too_many_logins"),
  };

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
        toast.error(errorBodyMessage(errorData, lang, errorsByCode, t("auth_login_failed")));
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
            refreshToken: data.refreshToken,
          })
        );
        navigate("/user"); // Redirect to the user dashboard
      } else {
        toast.error(t("auth_login_unexpected"));
      }
    } catch (error) {
      // The browser's own wording ("Failed to fetch") is English, so the
      // Hebrew screen says what it means instead.
      toast.error(
        lang === "en" ? (error as Error).message : t("auth_network_error"),
        t("auth_login_error_title")
      );
    }
  };

  // Return the login form UI
  return (
    <>
      <div className="login-page" dir={dir} lang={lang}>
        <div className="login-container" data-eyebrow={t("auth_eyebrow_login")}>
          {" "}
          {/* Container with CSS class for login */}
          <form onSubmit={handleLogin}>
            {" "}
            {/* Form submission triggers handleLogin */}
            {/* An address and a password read left to right in either language */}
            <input
              type="email" // Input field for email
              dir="ltr"
              placeholder={t("auth_email")} // Placeholder text
              value={email} // Bind value to email state
              onChange={(e) => setEmail(e.target.value)} // Update email state on change
              required // Mark input as required
            />
            <input
              type="password" // Input field for password
              dir="ltr"
              placeholder={t("auth_password")} // Placeholder text
              value={password} // Bind value to password state
              onChange={(e) => setPassword(e.target.value)} // Update password state on change
              required // Mark input as required
            />
            <button type="submit">{t("auth_login")}</button> {/* Submit button */}
          </form>
          <button onClick={() => navigate("/")}>{t("auth_back_home")}</button>{" "}
          {/* Button to navigate back to Home */}
        </div>
        <div></div> {/* An empty div (can be removed if not used) */}
      </div>
    </>
  );
};

export default Login; // Export Login as default
