import { useCallback, useEffect, useId, useState } from "react";
import { DAILY_REWARDS_CHANGED } from "../../api/dailyRewards";
import { ExposureData, fetchExposures } from "../../api/portfolioDashboard";
import { useLanguage } from "../../i18n/LanguageContext";
import { fill } from "../../i18n/fill";
import { MessageKey } from "../../i18n/messages";
import "../allocation/allocation.css";
import "../profile/profile.css";
import "./exposure.css";

/* ===========================================================================
   Module 4 - Exposure & Characteristics (spec Part 1).
   ---------------------------------------------------------------------------
   Horizontal bars with the percentage beside each: how much of the whole
   portfolio (cash included) sits in micro caps, small caps, thinly traded
   stocks, tech-oriented companies and stocks with positive momentum. What
   could not be classified for lack of data is said, not counted as zero.
   Dividend and Profitability are listed but not computed: the spec has not
   defined them and the data plan does not include them. Every figure is the
   server's.
   =========================================================================== */

type Dim = "micro_cap" | "small_cap" | "low_volume" | "tech" | "momentum";
const DIMS: Dim[] = ["micro_cap", "small_cap", "low_volume", "tech", "momentum"];
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

const Bar = ({ dim, value, unclassified, threshold }: { dim: Dim; value: number; unclassified: number; threshold: number }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const panel = useId();
  const usd = `$${(threshold / 1e6).toFixed(0)}M`;
  return (
    <li className={`exp-row${open ? " is-open" : ""}`}>
      <div className="exp-line">
        <span className="prof-label">{t(`exp_${dim}` as MessageKey)}</span>
        <button
          type="button"
          className="prof-info"
          aria-expanded={open}
          aria-controls={panel}
          aria-label={`${t("prof_about")}: ${t(`exp_${dim}` as MessageKey)}`}
          title={fill(t(`exp_${dim}_what` as MessageKey), { usd })}
          onClick={() => setOpen((o) => !o)}
        >
          ⓘ
        </button>
      </div>
      <div className="exp-bar-line">
        <div className="exp-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 1000) / 10} aria-label={t(`exp_${dim}` as MessageKey)}>
          <span className="exp-fill" style={{ inlineSize: `${Math.min(100, value * 100)}%` }} />
          {unclassified > 0 && <span className="exp-unknown" style={{ inlineSize: `${Math.min(100, unclassified * 100)}%`, insetInlineStart: `${Math.min(100, value * 100)}%` }} />}
        </div>
        <bdi dir="ltr" className="exp-value">{pct(value)}</bdi>
      </div>
      {unclassified > 0.0005 && <p className="prof-sub">{fill(t("exp_unclassified"), { v: pct(unclassified) })}</p>}
      {open && (
        <div className="prof-about" id={panel}>
          <h4>{t("prof_about")}</h4>
          <dl>
            <dt>{t("prof_what")}</dt>
            <dd>{fill(t(`exp_${dim}_what` as MessageKey), { usd })}</dd>
            <dt>{t("prof_how")}</dt>
            <dd>{fill(t(`exp_${dim}_how` as MessageKey), { usd })}</dd>
            <dt>{t("prof_read")}</dt>
            <dd>{fill(t(`exp_${dim}_read` as MessageKey), { usd })}</dd>
          </dl>
        </div>
      )}
    </li>
  );
};

export const ExposureModule = ({ portfolioId, reloadKey = 0 }: { portfolioId: number; reloadKey?: number }) => {
  const { t } = useLanguage();
  const [data, setData] = useState<ExposureData | null>(null);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);

  // A capital reward adds cash, which changes every share.
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(DAILY_REWARDS_CHANGED, bump);
    return () => window.removeEventListener(DAILY_REWARDS_CHANGED, bump);
  }, []);

  const load = useCallback(() => {
    fetchExposures(portfolioId)
      .then((d) => {
        setData(d);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [portfolioId]);
  useEffect(load, [load, reloadKey, tick]);

  return (
    <section className="al-module exp-module" aria-labelledby="exp-title">
      <header className="al-head">
        <div>
          <h3 id="exp-title">{t("exp_title")}</h3>
          <p className="al-note">{t("exp_note")}</p>
        </div>
      </header>
      {failed && <p className="error">{t("exp_load_failed")}</p>}
      {!data && !failed && <p className="stock-panel-loading">{t("loading")}</p>}
      {data && (
        <>
          <ul className="prof-list">
            {DIMS.map((d) => (
              <Bar key={d} dim={d} value={data[d].value} unclassified={data[d].unclassified} threshold={data.threshold_usd} />
            ))}
            {(["dividend", "profitability"] as const).map((d) => (
              <li key={d} className="exp-row is-unavailable">
                <div className="exp-line">
                  <span className="prof-label">{t(`exp_${d}` as MessageKey)}</span>
                  <span className="prof-missing">{t("exp_not_available")}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="ins-foot">{fill(t("exp_cash_note"), { v: pct(data.cash) })}</p>
        </>
      )}
    </section>
  );
};
