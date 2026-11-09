import { useEffect, useRef, useState } from "react";
import { addFollowup, Composition, CompositionEvent } from "../../api/portfolioDashboard";
import { money } from "../../api/social";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";
import { CompositionMatrix } from "./CompositionMatrix";
import { exposure, KIND_LABEL, whenShort } from "./format";

/* ===========================================================================
   Module 2 - Portfolio Activity, expanded (spec Part 1): two views.
   ---------------------------------------------------------------------------
   View A, Detailed Activity: every action with its date and exact time,
   ticker, kind, previous and new exposure, buy/sell price, and the
   rationale written with it. The rationale is never rewritten; to add to it
   the author writes a dated follow-up, shown beneath it (and in the feed).

   View B, the Portfolio Composition Table (CompositionMatrix).
   =========================================================================== */

const MAX_FOLLOWUP = 2000;

const ERROR_TEXT: Record<string, MessageKey> = {
  FOLLOWUP_EMPTY: "act_err_empty",
  FOLLOWUP_TOO_LONG: "act_err_long",
  TRADE_NOT_FOUND: "act_err_not_found",
};

const Action = ({ e, onAdded }: { e: CompositionEvent; onAdded: () => void }) => {
  const { t, locale } = useLanguage();
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);

  const post = async () => {
    setBusy(true);
    setError(null);
    try {
      await addFollowup(e.trade_id, draft);
      setDraft("");
      setWriting(false);
      onAdded();
    } catch (err) {
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code ?? "";
      setError(ERROR_TEXT[code] ?? "act_err_failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={`ph-action is-${e.kind}`}>
      <div className="ph-action-top">
        <time dateTime={e.at}>{whenShort(e.at, locale)}</time>
        <span className="ph-kind">{t(KIND_LABEL[e.kind])}</span>
        <bdi dir="ltr" className="ph-symbol">{e.symbol}</bdi>
        <span className="ph-exposure">
          {t("ph_exposure")}: <bdi dir="ltr">{exposure(e.before[e.symbol])} → {exposure(e.after[e.symbol])}</bdi>
        </span>
        <span className="ph-price">
          {t(e.action === "buy" ? "act_buy_price" : "act_sell_price")}: <bdi dir="ltr">{money(e.price)}</bdi>
        </span>
      </div>
      {e.note && <p className="ph-note" dir="auto">{e.note}</p>}

      {e.followups.length > 0 && (
        <ol className="act-followups" aria-label={t("act_followups")}>
          {e.followups.map((f) => (
            <li key={f.id}>
              <span className="act-followup-label">
                {t("act_followup")} · <time dateTime={f.created_at}>{whenShort(f.created_at, locale)}</time>
              </span>
              <p dir="auto">{f.body}</p>
            </li>
          ))}
        </ol>
      )}

      {writing ? (
        <div className="act-write">
          <textarea
            dir="auto"
            value={draft}
            maxLength={MAX_FOLLOWUP}
            placeholder={t("act_followup_placeholder")}
            aria-label={t("act_add_followup")}
            onChange={(ev) => setDraft(ev.target.value)}
            autoFocus
          />
          <div className="act-write-actions">
            <button type="button" className="al-open" onClick={post} disabled={busy || !draft.trim()}>
              {t("act_post")}
            </button>
            <button type="button" className="link-btn" onClick={() => setWriting(false)} disabled={busy}>
              {t("cancel")}
            </button>
            <span className="act-hint">{t("act_followup_hint")}</span>
          </div>
          {error && <p className="error" role="alert">{t(error)}</p>}
        </div>
      ) : (
        <button type="button" className="link-btn act-add" onClick={() => setWriting(true)}>
          + {t("act_add_followup")}
        </button>
      )}
    </li>
  );
};

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
  const [view, setView] = useState<"detailed" | "table">("detailed");

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
            <p className="al-note"><bdi>{data.portfolio.name}</bdi></p>
          </div>
          <button type="button" className="al-close" onClick={onClose} aria-label={t("close")}>×</button>
        </header>

        <div className="act-tabs" role="tablist" aria-label={t("act_title")}>
          <button type="button" role="tab" aria-selected={view === "detailed"} className={view === "detailed" ? "is-on" : ""} onClick={() => setView("detailed")}>
            {t("act_view_detailed")}
          </button>
          <button type="button" role="tab" aria-selected={view === "table"} className={view === "table" ? "is-on" : ""} onClick={() => setView("table")}>
            {t("act_view_table")}
          </button>
        </div>

        <div role="tabpanel">
          {view === "detailed" ? (
            <ol className="ph-actions">
              {data.events.map((e) => (
                <Action key={e.trade_id} e={e} onAdded={onChanged} />
              ))}
            </ol>
          ) : (
            <CompositionMatrix data={data} />
          )}
        </div>
      </div>
    </dialog>
  );
};
