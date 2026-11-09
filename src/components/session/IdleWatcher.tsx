import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../../features/authSlice";
import { useLanguage } from "../../i18n/LanguageContext";
import { fill } from "../../i18n/fill";
import { idleRemaining, IDLE_WARNING_MS, markActivity, noteIdleSignOut } from "../../session/idle";

/* ===========================================================================
   Signs the player out after 15 minutes without activity (src/session/idle).
   ---------------------------------------------------------------------------
   Mounted for whoever is signed in. Any input counts as activity and is
   written to the shared clock at most every few seconds. Once a second the
   watcher reads that clock: in the last minute it shows a warning with a
   countdown, and at zero it signs out and goes to the login page. Signing
   out in another tab signs this one out too.
   =========================================================================== */

const EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "scroll", "touchstart"] as const;
const WRITE_EVERY_MS = 5000;

export const IdleWatcher = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, dir, lang } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastWrite = useRef(0);

  useEffect(() => {
    // Signing in (or arriving with a live session) is itself activity.
    markActivity();
    lastWrite.current = Date.now();

    const onActivity = () => {
      const now = Date.now();
      if (now - lastWrite.current < WRITE_EVERY_MS) return;
      lastWrite.current = now;
      markActivity(now);
    };

    const signOut = (idle: boolean) => {
      if (idle) noteIdleSignOut();
      setSecondsLeft(null);
      dispatch(clearUser());
      navigate("/login");
    };

    const check = () => {
      const left = idleRemaining();
      if (left <= 0) {
        signOut(true);
        return;
      }
      setSecondsLeft(left <= IDLE_WARNING_MS ? Math.ceil(left / 1000) : null);
    };

    // Another tab signed out: the stored session is gone.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "stocktrack_auth" && e.newValue === null) signOut(false);
    };

    EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true, capture: true }));
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", check);
    const timer = window.setInterval(check, 1000);
    return () => {
      EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity, { capture: true }));
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", check);
      window.clearInterval(timer);
    };
  }, [dispatch, navigate]);

  if (secondsLeft === null) return null;

  const stay = () => {
    markActivity();
    lastWrite.current = Date.now();
    setSecondsLeft(null);
  };

  return (
    <div className="session-alert-backdrop idle-alert" dir={dir} lang={lang} role="alertdialog" aria-live="assertive" aria-labelledby="idle-label">
      <div className="session-alert">
        <span className="session-alert-label" id="idle-label">{t("idle_label")}</span>
        <p>{secondsLeft === 1 ? t("idle_body_one") : fill(t("idle_body_other"), { n: secondsLeft })}</p>
        <button type="button" onClick={stay}>{t("idle_stay")}</button>
      </div>
    </div>
  );
};
