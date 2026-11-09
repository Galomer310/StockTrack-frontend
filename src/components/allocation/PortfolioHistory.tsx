import { useEffect, useRef, useState } from "react";
import { CASH_KEY, Composition, CompositionEvent, fetchComposition } from "../../api/portfolioDashboard";
import { money } from "../../api/social";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";

/* ===========================================================================
   Portfolio History (spec Part 1, Module 1; the matrix is also Module 2's
   View B).
   ---------------------------------------------------------------------------
   The composition after every action, as a matrix: one row per symbol (and
   cash), one column per action, NEWEST ON THE LEFT as the spec lays it out
   - so the matrix keeps that order in Hebrew too. Each cell is only the
   holding's weight at that moment. Two actions on one day are two columns,
   told apart by their time. Below it, every action with its previous and
   new exposure, price and rationale.
   =========================================================================== */

const KIND: Record<CompositionEvent["kind"], MessageKey> = {
  added: "ph_added",
  increased: "ph_increased",
  reduced: "ph_reduced",
  removed: "ph_removed",
};

const pct = (w: number | undefined) => (w && w > 0.00005 ? `${(w * 100).toFixed(1)}%` : "—");

export const PortfolioHistory = ({
  open,
  portfolioId,
  name,
  onClose,
}: {
  open: boolean;
  portfolioId: number;
  name: string;
  onClose: () => void;
}) => {
  const { t, dir, lang, locale } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<Composition | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setFailed(false);
      fetchComposition(portfolioId).then(setData).catch(() => setFailed(true));
    }
    if (!open && d.open) d.close();
  }, [open, portfolioId]);

  const when = (at: string) =>
    new Date(at).toLocaleString(locale, { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  // Symbols that ever had a weight, then cash last.
  const rows = data ? [...data.symbols, CASH_KEY] : [];

  return (
    <dialog
      ref={ref}
      className="al-dialog ph-dialog"
      dir={dir}
      lang={lang}
      aria-labelledby="ph-title"
      onClose={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="al-dialog-frame">
        <header className="al-dialog-head">
          <div>
            <h2 id="ph-title">{t("ph_title")}</h2>
            <p className="al-note"><bdi>{name}</bdi> · {t("ph_intro")}</p>
          </div>
          <button type="button" className="al-close" onClick={onClose} aria-label={t("close")}>×</button>
        </header>

        {failed && <p className="error">{t("ph_load_failed")}</p>}
        {!data && !failed && <p className="stock-panel-loading">{t("loading")}</p>}
        {data && data.events.length === 0 && <p className="stock-empty">{t("ph_empty")}</p>}

        {data && data.events.length > 0 && (
          <>
            <h3 className="al-subhead">{t("ph_composition")}</h3>
            {/* dir="ltr": the newest action stays on the left in both languages. */}
            <div className="ph-matrix-wrap" dir="ltr">
              <table className="ph-matrix">
                <thead>
                  <tr>
                    <th scope="col" className="ph-sticky"> </th>
                    {data.events.map((e) => (
                      <th scope="col" key={e.trade_id}>{when(e.at)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s}>
                      <th scope="row" className="ph-sticky">{s === CASH_KEY ? <span lang={lang}>{t("al_cash")}</span> : s}</th>
                      {data.events.map((e) => (
                        <td key={e.trade_id} className={e.symbol === s ? "is-changed" : ""}>{pct(e.after[s])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="al-subhead">{t("ph_actions")}</h3>
            <ol className="ph-actions">
              {data.events.map((e) => (
                <li key={e.trade_id} className={`ph-action is-${e.kind}`}>
                  <div className="ph-action-top">
                    <time dateTime={e.at}>{when(e.at)}</time>
                    <span className="ph-kind">{t(KIND[e.kind])}</span>
                    <bdi dir="ltr" className="ph-symbol">{e.symbol}</bdi>
                    <span className="ph-exposure">
                      {t("ph_exposure")}: <bdi dir="ltr">{pct(e.before[e.symbol])} → {pct(e.after[e.symbol])}</bdi>
                    </span>
                    <span className="ph-price">
                      {t("ph_price")}: <bdi dir="ltr">{money(e.price)}</bdi>
                    </span>
                  </div>
                  {e.note && <p className="ph-note" dir="auto">{e.note}</p>}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </dialog>
  );
};
