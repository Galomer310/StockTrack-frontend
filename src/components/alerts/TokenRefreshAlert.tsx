// TokenRefreshAlert.tsx
import React, { useState, useEffect } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { fill } from "../../i18n/fill";

interface TokenRefreshAlertProps {
  onUserResponse: (isActive: boolean) => void;
}

const TokenRefreshAlert: React.FC<TokenRefreshAlertProps> = ({
  onUserResponse,
}) => {
  const [countdown, setCountdown] = useState(60);
  const { t, dir, lang } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onUserResponse(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onUserResponse]);

  return (
    <div className="session-alert-backdrop" dir={dir} lang={lang}>
      <div className="session-alert">
        <span className="session-alert-label">{t("session_label")}</span>
        <p>
          {countdown === 1
            ? t("session_body_one")
            : fill(t("session_body_other"), { n: countdown })}
        </p>
        <button onClick={() => onUserResponse(true)}>{t("session_still_here")}</button>
      </div>
    </div>
  );
};

export default TokenRefreshAlert;
