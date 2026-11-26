import React, { useState } from "react"; // Import React and useState hook
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useToast } from "../components/ui/ToastProvider";
import { useLanguage } from "../i18n/LanguageContext";
import { errorBodyMessage } from "../i18n/fill";
import { PRIVACY_VERSION } from "../legal/site";

// Define the Register functional component
const Register = () => {
  const [email, setEmail] = useState(""); // State for storing the email input
  const [password, setPassword] = useState(""); // State for storing the password input
  const [displayName, setDisplayName] = useState(""); // Public name shown on the leaderboard
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const navigate = useNavigate(); // Initialize navigate for redirection
  const toast = useToast();
  const { t, dir, lang } = useLanguage();

  // The server's refusals, by error code, for the Hebrew screen
  const errorsByCode = {
    EMAIL_TAKEN: t("auth_email_taken"),
    EMAIL_NOT_TEXT: t("auth_email_invalid"),
    EMAIL_INVALID: t("auth_email_invalid"),
    EMAIL_TOO_LONG: t("auth_email_too_long"),
    PASSWORD_TOO_SHORT: t("auth_password_too_short"),
    PASSWORD_TOO_LONG: t("auth_password_too_long"),
    PASSWORD_TOO_COMMON: t("auth_password_too_common"),
    PASSWORD_TOO_SIMPLE: t("auth_password_too_simple"),
    DISPLAY_NAME_REQUIRED: t("auth_display_name_required"),
    DISPLAY_NAME_TOO_LONG: t("auth_display_name_too_long"),
    TOO_MANY_REGISTRATIONS: t("auth_too_many_registrations"),
    PRIVACY_NOT_ACCEPTED: t("auth_privacy_consent_required"),
  };

  // Handler function for registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    const userData = {
      email,
      password,
      display_name: displayName,
      // Which statement was accepted: the server stores it with the time.
      privacy_version: privacyAccepted ? PRIVACY_VERSION : undefined,
    };
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
        toast.error(errorBodyMessage(errorData, lang, errorsByCode, t("auth_register_failed")));
        return; // Exit the function
      }
      const data = await response.json(); // Parse the successful response data
      console.log("Registration successful:", data); // Log success to the console
      navigate("/login"); // Redirect to the Login page after successful registration
    } catch (error) {
      // The browser's own wording is English; see Login
      toast.error(
        lang === "en" ? (error as Error).message : t("auth_network_error"),
        t("auth_register_error_title")
      );
    }
  };

  // Return the registration form UI
  return (
    <>
      <div className="register-page" dir={dir} lang={lang}>
        <div className="register-container">
          <h1 className="auth-eyebrow">{t("auth_eyebrow_register")}</h1>
          <form onSubmit={handleRegister}>
            {/* The name may be Hebrew or English, so it takes the direction
                of whatever is typed; the address and password read left to
                right in either language. Visible labels and autocomplete
                (WCAG 1.3.5, 3.3.2). */}
            <label className="auth-field">
              {t("auth_display_name")}
              <input
                type="text"
                dir="auto"
                autoComplete="nickname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                required
              />
            </label>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
                autoComplete="new-password"
                aria-describedby="register-password-hint"
              />
            </label>
            {/* The server rejects short and common passwords. Stating the rule
                here means finding out before submitting rather than after: the
                same requirement, but as guidance instead of a refusal. */}
            <p className="field-hint" id="register-password-hint">{t("auth_password_hint")}</p>
            {/* Consent to the privacy statement, recorded by the server with
                the statement's version. The link opens in a new tab so what
                was typed above is not lost. */}
            <label className="auth-consent">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                required
              />
              <span>
                {t("auth_privacy_consent_before")}
                <a href="/privacy" target="_blank" rel="noopener">
                  {t("auth_privacy_consent_link")}
                </a>
                {t("auth_privacy_consent_after")}
              </span>
            </label>
            <button type="submit">{t("auth_register")}</button>
          </form>
          <button onClick={() => navigate("/login")}>
            {t("auth_have_account")}
          </button>{" "}
          {/* Button to navigate to Login page */}
        </div>
      </div>
    </>
  );
};

export default Register; // Export Register as default
