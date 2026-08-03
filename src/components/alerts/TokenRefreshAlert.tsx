// TokenRefreshAlert.tsx
import React, { useState, useEffect } from "react";

interface TokenRefreshAlertProps {
  onUserResponse: (isActive: boolean) => void;
}

const TokenRefreshAlert: React.FC<TokenRefreshAlertProps> = ({
  onUserResponse,
}) => {
  const [countdown, setCountdown] = useState(60);

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
    <div className="session-alert-backdrop">
      <div className="session-alert">
        <span className="session-alert-label">Session expiring</span>
        <p>
          Your session will expire in {countdown} second
          {countdown !== 1 && "s"}. Click the button if you are still here.
        </p>
        <button onClick={() => onUserResponse(true)}>I'm still here</button>
      </div>
    </div>
  );
};

export default TokenRefreshAlert;
