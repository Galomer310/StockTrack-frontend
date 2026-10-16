import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { Icon } from "./icons";

/* A short explanation behind an ⓘ. On a desktop it opens on hover or
   keyboard focus; on a phone, where there is no hover, a tap toggles it and
   a tap anywhere else or Escape closes it. */
export const InfoTip = ({ text, inline = false }: { text: string; inline?: boolean }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
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
    <button
      ref={ref}
      type="button"
      className={`pc-tip${inline ? " pc-tip--inline" : ""}`}
      aria-label={t("info")}
      aria-describedby={id}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
    >
      <Icon name="info" />
      <span role="tooltip" id={id} className="pc-bubble">
        {text}
      </span>
    </button>
  );
};
