import { useEffect, useRef, useState } from "react";
import { Allocation } from "../../api/portfolioDashboard";
import { money, percent } from "../../api/social";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { PortfolioHistory } from "./PortfolioHistory";

/* ===========================================================================
   The expanded Portfolio Allocation Dashboard (spec Part 1, Module 1).
   ---------------------------------------------------------------------------
   Starting capital, the capital gain or loss as a percentage (never the
   profit in dollars), the capital earned through the game, and every
   holding with its exposure, added date, average buy price, current price,
   gain and sector. "View portfolio history" opens the composition over time.
   =========================================================================== */

export const AllocationDashboard = ({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: Allocation;
  onClose: () => void;
}) => {
  const { t, dir, lang, locale } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const [history, setHistory] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const s = data.summary;

  return (
    <dialog
      ref={ref}
      className="al-dialog"
      dir={dir}
      lang={lang}
      aria-labelledby="al-dash-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="al-dialog-frame">
        <header className="al-dialog-head">
          <div>
            <h2 id="al-dash-title">{t("al_title")}</h2>
            <p className="al-note"><bdi>{data.portfolio.name}</bdi></p>
          </div>
          <button type="button" className="al-close" onClick={onClose} aria-label={t("close")}>×</button>
        </header>

        <div className="summary-cards al-summary">
          <div className="summary-card">
            <span className="summary-label">{t("al_starting")}</span>
            <span className="summary-value"><bdi dir="ltr">{money(s.starting_capital)}</bdi></span>
          </div>
          <div className="summary-card">
            <span className="summary-label">{t("al_capital_gain")}</span>
            <span className={`summary-value ${s.return_pct >= 0 ? "gain" : "loss"}`}><bdi dir="ltr">{percent(s.return_pct)}</bdi></span>
          </div>
          <div className="summary-card">
            <span className="summary-label">{t("al_capital_earned")}</span>
            <span className="summary-value"><bdi dir="ltr">{money(s.capital_earned)}</bdi></span>
            <span className="al-hint">{fill(t("al_capital_earned_n"), { n: s.capital_rewards })}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">{t("al_cash")}</span>
            <span className="summary-value"><bdi dir="ltr">{s.cash_pct.toFixed(1)}%</bdi></span>
          </div>
        </div>

        <h3 className="al-subhead">{t("al_holdings")}</h3>
        {data.holdings.length === 0 ? (
          <p className="stock-empty">{t("al_empty")}</p>
        ) : (
          <div className="al-scroll">
            <table className="al-full">
              <thead>
                <tr>
                  <th scope="col">{t("al_symbol")}</th>
                  <th scope="col">{t("al_exposure")}</th>
                  <th scope="col">{t("al_added")}</th>
                  <th scope="col">{t("al_avg")}</th>
                  <th scope="col">{t("al_price_now")}</th>
                  <th scope="col">{t("al_gain")}</th>
                  <th scope="col">{t("al_sector")}</th>
                </tr>
              </thead>
              <tbody>
                {data.holdings.map((h) => (
                  <tr key={h.symbol}>
                    <th scope="row"><bdi dir="ltr">{h.symbol}</bdi></th>
                    <td><bdi dir="ltr">{h.exposure_pct.toFixed(1)}%</bdi></td>
                    <td>{new Date(h.added_at).toLocaleDateString(locale)}</td>
                    <td><bdi dir="ltr">{h.avg_buy_price !== null ? money(h.avg_buy_price) : "—"}</bdi></td>
                    <td><bdi dir="ltr">{money(h.price_now)}</bdi>{h.price_is_estimate && <span className="al-hint">*</span>}</td>
                    <td className={h.gain_pct !== null && h.gain_pct < 0 ? "loss" : "gain"}><bdi dir="ltr">{h.gain_pct !== null ? percent(h.gain_pct) : "—"}</bdi></td>
                    <td><bdi>{h.sector ?? t("al_sector_unknown")}</bdi></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.holdings.some((h) => h.price_is_estimate) && <p className="al-hint">* {t("al_price_estimate")}</p>}
          </div>
        )}

        <div className="al-actions">
          <button type="button" className="al-open" onClick={() => setHistory(true)}>
            {t("al_history")}
          </button>
        </div>
      </div>
      <PortfolioHistory open={history} portfolioId={data.portfolio.id} name={data.portfolio.name} onClose={() => setHistory(false)} />
    </dialog>
  );
};
