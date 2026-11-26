import { RefObject, useEffect, useRef } from "react";

/* ===========================================================================
   Keyboard behaviour for the hand-built dialogs (WCAG 2.1.2, 2.4.3).
   ---------------------------------------------------------------------------
   Most dialogs here are a native <dialog> opened with showModal(), which the
   browser already makes modal. The few that are a plain <div role="dialog">
   get the same three things from this hook while `active`:
     - Tab and Shift+Tab cycle inside the dialog instead of escaping to the
       page behind it;
     - Escape calls onClose (unless onClose is omitted, for a dialog that
       must not be dismissed mid-action);
     - when it closes, focus goes back to whatever had it before it opened,
       so a keyboard user is not dropped at the top of the page.
   =========================================================================== */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const useDialogFocus = (
  ref: RefObject<HTMLElement>,
  active: boolean,
  onClose?: () => void
) => {
  // Kept in a ref so a new onClose every render does not re-run the effect
  // (which would "restore" focus mid-dialog).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      const box = ref.current;
      if (!box) return;
      if (e.key === "Escape" && closeRef.current) {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        box.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const inside = box.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // The opener may have gone (e.g. a row that was deleted); then the
      // browser's default (body) is the best there is.
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [active, ref]);
};
