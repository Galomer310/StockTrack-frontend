import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";

/* ===========================================================================
   Toasts
   ---------------------------------------------------------------------------
   Replaces window.alert(), which blocked the page, ignored the theme entirely
   and looked like a browser error on what is otherwise a designed surface.

   Usage:  const toast = useToast();  toast.success("Added to watchlist");
   =========================================================================== */

export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  title?: string;
}

interface ToastApi {
  show: (message: string, variant?: ToastVariant, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

// Consumed by any component that needs to tell the user something happened.
export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside a ToastProvider");
  return ctx;
};

const DISMISS_AFTER_MS = 4500;

const ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error: "!",
  info: "i",
};

const DEFAULT_TITLES: Record<ToastVariant, MessageKey> = {
  success: "toast_done",
  error: "toast_failed",
  info: "toast_notice",
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Toasts follow the interface language: in Hebrew the stack sits top-left
  // and slides in from the left (logical CSS plus --toast-sweep).
  const { t, dir, lang } = useLanguage();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "info", title?: string) => {
      const id = nextId.current++;
      setToasts((prev) => {
        // Cap the stack so a burst of errors cannot cover the screen
        const next = [...prev, { id, message, variant, title }];
        return next.slice(-4);
      });
      window.setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, title) => show(message, "success", title),
      error: (message, title) => show(message, "error", title),
      info: (message, title) => show(message, "info", title),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite" dir={dir} lang={lang}>
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.variant}`}>
            <span className="toast-icon" aria-hidden="true">
              {ICONS[toast.variant]}
            </span>
            <div className="toast-body">
              <span className="toast-title">
                {toast.title ?? t(DEFAULT_TITLES[toast.variant])}
              </span>
              <span className="toast-message" dir="auto">{toast.message}</span>
            </div>
            <button
              className="toast-close"
              onClick={() => dismiss(toast.id)}
              aria-label={t("toast_dismiss")}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
