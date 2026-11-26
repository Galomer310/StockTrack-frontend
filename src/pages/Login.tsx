import React, { useEffect, useState } from "react"; // Import React and useState hook
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useDispatch } from "react-redux"; // Import useDispatch for Redux actions
import { setUser } from "../features/authSlice"; // Import setUser action from authSlice
import { useToast } from "../components/ui/ToastProvider";
import { useLanguage } from "../i18n/LanguageContext";
import { errorBodyMessage } from "../i18n/fill";
import { takeIdleSignOutNote } from "../session/idle";

// Define the Login functional component
const Login = () => {
  const [email, setEmail] = useState(""); // State for storing the email input
  const [password, setPassword] = useState(""); // State for storing the password input
  const dispatch = useDispatch(); // Initialize dispatch for Redux actions
  const navigate = useNavigate(); // Initialize navigate for redirection
  const toast = useToast();
  const { t, dir, lang } = useLanguage();

  // Sent here by the inactivity sign-out: say why, once.
  const [idleNote] = useState(takeIdleSignOutNote);
  useEffect(() => {
    if (idleNote) toast.info(t("idle_signed_out"), t("idle_signed_out_title"));
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div className="login-container">
          <h1 className="auth-eyebrow">{t("auth_eyebrow_login")}</h1>
          <form onSubmit={handleLogin}>
            {/* An address and a password read left to right in either language.
                Visible labels, and autocomplete so password managers and
                assistive tech fill them (WCAG 1.3.5, 3.3.2). */}
            <label className="auth-field">
              {t("auth_email")}
              <input
                type="email"
                dir="ltr"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="auth-field">
              {t("auth_password")}
              <input
                type="password"
                dir="ltr"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
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
