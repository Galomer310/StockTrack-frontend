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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        padding: "10px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "20px",
          backgroundColor: "#ffeb3b",
          textAlign: "center",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
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
