import { useEffect, useRef, useState } from "react";
import { Composition } from "../../api/portfolioDashboard";
import { useLanguage } from "../../i18n/LanguageContext";
import { Journal, JournalFlow, JournalSummary } from "./ActivityJournal";

/* ===========================================================================
   Module 2 - Portfolio Activity, expanded: design B (approved 2026-11).
   ---------------------------------------------------------------------------
   Two views of the same actions: the decision journal (each action with its
   price, weight change and reasoning, follow-ups beneath), and the
   composition after every action as 100% bars. See ActivityJournal.tsx.
   =========================================================================== */

export const ActivityDialog = ({
  open,
  data,
  onClose,
  onChanged,
}: {
  open: boolean;
  data: Composition;
  onClose: () => void;
  onChanged: () => void;
}) => {
  const { t, dir, lang } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<"journal" | "flow">("journal");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="al-dialog act-dialog"
      dir={dir}
      lang={lang}
      aria-labelledby="act-dialog-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="al-dialog-frame">
        <header className="al-dialog-head">
          <div>
            <h2 id="act-dialog-title">{t("act_title")}</h2>
            <p className="al-note">
              <bdi>{data.portfolio.name}</bdi> · {t("act_journal_sub")}
            </p>
          </div>
          <button type="button" className="al-close" onClick={onClose} aria-label={t("close")}>×</button>
        </header>

        <div className="act-tabs" role="tablist" aria-label={t("act_title")}>
          <button type="button" role="tab" aria-selected={view === "journal"} className={view === "journal" ? "is-on" : ""} onClick={() => setView("journal")}>
            {t("act_view_journal")}
          </button>
          <button type="button" role="tab" aria-selected={view === "flow"} className={view === "flow" ? "is-on" : ""} onClick={() => setView("flow")}>
            {t("act_view_flow")}
          </button>
        </div>

        <div role="tabpanel">
          {view === "journal" ? (
            <>
              <JournalSummary data={data} />
              <Journal data={data} onChanged={onChanged} />
            </>
          ) : (
            <JournalFlow data={data} />
          )}
        </div>
      </div>
    </dialog>
  );
};
