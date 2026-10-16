import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { Icon } from "./icons";

/* A short explanation behind an ⓘ. On a desktop it opens on hover or
   keyboard focus; on a phone, where there is no hover, a tap toggles it and
   a tap anywhere else or Escape closes it.

   The bubble is a sibling of the button rather than inside it, so CSS can
   position it against whatever it explains - the stat card, the table row,
   the panel title - and give it that element's width. Anchored to the small
   button instead, a bubble wider than a stat card ran off the edge of the
   page on the outermost card. */
export const InfoTip = ({ text, inline = false }: { text: string; inline?: boolean }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className={`pc-tipwrap${inline ? " pc-tipwrap--inline" : ""}`}>
      <button
        type="button"
        className={`pc-tip${inline ? " pc-tip--inline" : ""}`}
        aria-label={t("info")}
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="info" />
      </button>
      <span role="tooltip" id={id} className="pc-bubble">
        {text}
      </span>
    </span>
  );
};
