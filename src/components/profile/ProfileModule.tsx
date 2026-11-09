import { ReactNode, useCallback, useEffect, useId, useState } from "react";
import { DAILY_REWARDS_CHANGED } from "../../api/dailyRewards";
import { Band, fetchProfile, HorizonCategory, InvestmentProfile } from "../../api/portfolioDashboard";
import { useLanguage } from "../../i18n/LanguageContext";
import { fill } from "../../i18n/fill";
import { MessageKey } from "../../i18n/messages";
import "../allocation/allocation.css";
import "./profile.css";

/* ===========================================================================
   Module 3 - Investment Profile (spec Part 1).
   ---------------------------------------------------------------------------
   Exactly the spec's five dimensions - Risk, Portfolio Volatility,
   Diversification, Investment Horizon, Portfolio Turnover - each as a
   horizontal meter with its result. Every one has an info button that opens
   "About this metric" (what it shows, how it is measured, how to read it)
   and the parts behind the number. Every figure comes from the server.
   =========================================================================== */

const BAND_KEY: Record<Band, MessageKey> = {
  "Very Low": "prof_band_very_low",
  Low: "prof_band_low",
  Medium: "prof_band_medium",
  High: "prof_band_high",
  "Very High": "prof_band_very_high",
};

const HORIZON_KEY: Record<HorizonCategory, MessageKey> = {
  "Very Short": "prof_hz_very_short",
  Short: "prof_hz_short",
  Medium: "prof_hz_medium",
  Long: "prof_hz_long",
  "Very Long": "prof_hz_very_long",
};

const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`;
const signed = (x: number) => `${x > 0 ? "+" : ""}${(x * 100).toFixed(2)}%`;
const asDate = (d: string) => new Date(`${d}T00:00:00`);

type Metric = "risk" | "volatility" | "diversification" | "horizon" | "turnover";

const Row = ({
  metric,
  meter,
  value,
  sub,
  missing,
  children,
}: {
  metric: Metric;
  /** 0-100, or null when there is nothing to show. */
  meter: number | null;
  value?: ReactNode;
  sub?: ReactNode;
  missing?: string;
  children?: ReactNode;
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const panel = useId();
  return (
    <li className={`prof-row${open ? " is-open" : ""}`}>
      <div className="prof-line">
        <span className="prof-label">{t(`prof_${metric}` as MessageKey)}</span>
        <button
          type="button"
          className="prof-info"
          aria-expanded={open}
          aria-controls={panel}
          aria-label={`${t("prof_about")}: ${t(`prof_${metric}` as MessageKey)}`}
          title={t(`prof_${metric}_what` as MessageKey)}
          onClick={() => setOpen((o) => !o)}
        >
          ⓘ
        </button>
        <span className="prof-result">{missing ? <span className="prof-missing">{missing}</span> : value}</span>
      </div>
      <div
        className="prof-meter"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={meter === null ? undefined : Math.round(meter)}
        aria-label={t(`prof_${metric}` as MessageKey)}
      >
        {meter !== null && <span className="prof-fill" style={{ inlineSize: `${Math.max(2, meter)}%` }} />}
        {meter !== null && <span className="prof-mark" style={{ insetInlineStart: `${meter}%` }} />}
      </div>
      {sub && !missing && <p className="prof-sub">{sub}</p>}
      {open && (
        <div className="prof-about" id={panel}>
          <h4>{t("prof_about")}</h4>
          <dl>
            <dt>{t("prof_what")}</dt>
            <dd>{t(`prof_${metric}_what` as MessageKey)}</dd>
            <dt>{t("prof_how")}</dt>
            <dd>{t(`prof_${metric}_how` as MessageKey)}</dd>
            <dt>{t("prof_read")}</dt>
            <dd>{t(`prof_${metric}_read` as MessageKey)}</dd>
          </dl>
          {children && (
            <>
              <h4>{t("prof_breakdown")}</h4>
              {children}
            </>
          )}
        </div>
      )}
    </li>
  );
};

const Parts = ({ rows }: { rows: [string, ReactNode][] }) => (
  <table className="prof-parts">
    <tbody>
      {rows.map(([k, v]) => (
        <tr key={k}>
          <th scope="row">{k}</th>
          {/* Direction from the content: "AAA · 41.7%" reads left to right,
              "3.3 מתוך 4 אחזקות" right to left. */}
          <td><bdi>{v}</bdi></td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Body = ({ p }: { p: InvestmentProfile }) => {
  const { t, locale } = useLanguage();
  const band = (b: Band) => t(BAND_KEY[b]);
  const day = (d: string) => asDate(d).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const score = (n: number) => fill(t("prof_score"), { n: Math.round(n) });
  const usd = (n: number) => `$${(n / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })}M`;
  const { risk, volatility: vol, diversification: div, horizon: hz, turnover: to, liquidity: liq, max_drawdown: dd } = p;

  return (
    <ul className="prof-list">
      <Row
        metric="risk"
        meter={risk.available ? risk.score : null}
        value={risk.available && <><bdi dir="ltr">{score(risk.score)}</bdi> · {band(risk.band)}</>}
        missing={risk.available ? undefined : risk.reason === "missing_data" ? t("prof_missing_data") : t("prof_risk_too_short")}
      >
        {risk.available && (
          <Parts
            rows={[
              [t("prof_part_volatility"), score(risk.components.volatility)],
              [t("prof_part_drawdown"), `${score(risk.components.max_drawdown)}${dd ? ` (${pct(dd.value)})` : ""}`],
              [t("prof_part_concentration"), score(risk.components.concentration)],
              [t("prof_part_liquidity"), `${score(risk.components.liquidity)}${liq ? ` (${pct(liq.low_liquidity_weight)})` : ""}`],
              [t("prof_part_turnover"), score(risk.components.turnover)],
            ]}
          />
        )}
        {liq && (
          <p className="prof-sub">
            {fill(t("prof_low_liquidity"), { usd: usd(liq.threshold_usd) })}: <bdi dir="ltr">{pct(liq.low_liquidity_weight)}</bdi>
          </p>
        )}
      </Row>

      <Row
        metric="volatility"
        meter={vol.available ? vol.score : null}
        value={vol.available && <><bdi>{fill(t("prof_per_year"), { v: pct(vol.annualized) })}</bdi> · {band(vol.band)}</>}
        sub={vol.available && fill(t("prof_over_sessions"), { n: vol.sessions })}
        missing={vol.available ? undefined : fill(t("prof_too_short"), { needed: vol.needed, n: vol.sessions })}
      >
        {vol.available && (
          <Parts
            rows={[
              [t("prof_avg_up"), vol.average_positive_day === null ? "—" : signed(vol.average_positive_day)],
              [t("prof_avg_down"), vol.average_negative_day === null ? "—" : signed(vol.average_negative_day)],
              [t("prof_max_gain"), vol.max_daily_gain ? `${signed(vol.max_daily_gain.value)} · ${day(vol.max_daily_gain.date)}` : "—"],
              [t("prof_max_loss"), vol.max_daily_loss ? `${signed(vol.max_daily_loss.value)} · ${day(vol.max_daily_loss.date)}` : "—"],
            ]}
          />
        )}
      </Row>

      <Row
        metric="diversification"
        meter={div.available ? div.score : null}
        value={div.available && <><bdi dir="ltr">{score(div.score)}</bdi> · {band(div.band)}</>}
        missing={div.available ? undefined : t("prof_no_holdings")}
      >
        {div.available && (
          <>
            <Parts
              rows={[
                [t("prof_effective"), fill(t("prof_effective_of"), { v: div.parts.effective_holdings.value.toFixed(1), n: div.parts.effective_holdings.holdings })],
                [t("prof_largest"), `${div.parts.largest_position.symbol} · ${pct(div.parts.largest_position.weight)}`],
                [t("prof_top3"), pct(div.parts.top_3.weight)],
                [t("prof_sector"), `${div.parts.sector.largest ?? t("prof_sector_unknown")} · ${pct(div.parts.sector.largest_weight)}`],
                [t("prof_hhi"), div.parts.sector.hhi.toFixed(2)],
              ]}
            />
            {div.parts.sector.unclassified.length > 0 && (
              <p className="prof-sub">{fill(t("prof_unclassified"), { list: div.parts.sector.unclassified.join(", ") })}</p>
            )}
          </>
        )}
      </Row>

      <Row
        metric="horizon"
        meter={hz.available ? hz.meter : null}
        value={hz.available && <>{t(HORIZON_KEY[hz.category])} · {fill(t("prof_median_days"), { n: hz.median_days })}</>}
        missing={hz.available ? undefined : t("prof_no_holdings")}
      >
        {hz.available && (
          <Parts
            rows={[
              [t("prof_lots"), String(hz.lots)],
              [t("prof_open_lots"), String(hz.open_lots)],
            ]}
          />
        )}
      </Row>

      <Row
        metric="turnover"
        meter={to.score}
        value={<><bdi>{fill(t("prof_in_window"), { v: pct(to.value, 0), n: to.window_days })}</bdi> · {band(to.band)}</>}
      >
        <Parts rows={[[fill(t("prof_changes"), { n: to.window_days }), String(to.events)]]} />
      </Row>
    </ul>
  );
};

export const ProfileModule = ({ portfolioId, reloadKey = 0 }: { portfolioId: number; reloadKey?: number }) => {
  const { t } = useLanguage();
  const [data, setData] = useState<InvestmentProfile | null>(null);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);

  // A capital reward changes the cash, and so the weights.
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(DAILY_REWARDS_CHANGED, bump);
    return () => window.removeEventListener(DAILY_REWARDS_CHANGED, bump);
  }, []);

  const load = useCallback(() => {
    fetchProfile(portfolioId)
      .then((d) => {
        setData(d);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [portfolioId]);
  useEffect(load, [load, reloadKey, tick]);

  return (
    <section className="al-module prof-module" aria-labelledby="prof-title">
      <header className="al-head">
        <div>
          <h3 id="prof-title">{t("prof_title")}</h3>
          <p className="al-note">{t("prof_note")}</p>
        </div>
      </header>
      {failed && <p className="error">{t("prof_load_failed")}</p>}
      {!data && !failed && <p className="stock-panel-loading">{t("loading")}</p>}
      {data && <Body p={data} />}
    </section>
  );
};
