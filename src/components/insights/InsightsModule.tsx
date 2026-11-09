import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { DAILY_REWARDS_CHANGED } from "../../api/dailyRewards";
import { fetchInsights, Insights, InsightsData, MonthReturn } from "../../api/portfolioDashboard";
import { NEUTRAL, SERIES } from "../../charts/chartTheme";
import { useIsLightMode } from "../../charts/useIsLightMode";
import { useLanguage } from "../../i18n/LanguageContext";
import { fill, ltr } from "../../i18n/fill";
import "../allocation/allocation.css";
import "./insights.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

/* ===========================================================================
   Module 5 - Performance Insights (spec Part 1).
   ---------------------------------------------------------------------------
   The portfolio's record on the genuine performance index (capital rewards
   are not return): total return, months, drawdown, best and worst days, age,
   and the comparison with the S&P 500 and NASDAQ-100 over exactly the same
   dates, with a chart that starts every series at 100. Every figure comes
   from the server; this file only lays it out.
   =========================================================================== */

// Left-to-right mark: keeps a minus sign in front in a right-to-left canvas.
const LRM = String.fromCharCode(0x200e);

const signedPct = (x: number) => `${x > 0 ? "+" : ""}${(x * 100).toFixed(2)}%`;
const tone = (x: number | null | undefined) => (x === null || x === undefined || x === 0 ? "" : x > 0 ? "is-up" : "is-down");

// "YYYY-MM-DD" is a calendar date: read it at local midnight, not UTC.
const asDate = (d: string) => new Date(`${d}T00:00:00`);

// Numbers stay left to right; a value that is a phrase ("1 of 2", "69 days")
// follows the page, or Hebrew would read it backwards.
const Stat = ({
  label,
  value,
  sub,
  valueTone = "",
  phrase = false,
}: {
  label: string;
  value: string;
  sub?: string;
  valueTone?: string;
  phrase?: boolean;
}) => (
  <div className="ins-stat">
    <dt>{label}</dt>
    <dd>
      <bdi dir={phrase ? undefined : "ltr"} className={`ins-value ${valueTone}`}>{value}</bdi>
      {sub && <span className="ins-sub">{sub}</span>}
    </dd>
  </div>
);

const Body = ({ data, meta }: { data: InsightsData; meta: Insights }) => {
  const { t, dir, locale } = useLanguage();
  const isLight = useIsLightMode();
  const day = (d: string) => asDate(d).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const monthName = (m: MonthReturn) =>
    asDate(`${m.month}-01`).toLocaleDateString(locale, { month: "long", year: "numeric" }) + (m.partial ? ` (${t("pi_partial")})` : "");

  const counted = data.positive_months.counted;
  const dd = data.max_drawdown;
  const charted = data.benchmarks.filter((b) => b.return !== null);

  const chart = useMemo(() => {
    const colours = [SERIES.steel, isLight ? NEUTRAL.light : NEUTRAL.dark];
    return {
      labels: data.chart.map((r) => asDate(r.date).toLocaleDateString(locale, { day: "numeric", month: "short" })),
      datasets: [
        {
          label: t("pi_portfolio"),
          data: data.chart.map((r) => r.portfolio),
          borderColor: SERIES.gold,
          backgroundColor: SERIES.gold,
          borderWidth: 2.5,
          pointRadius: 0,
          tension: 0.2,
        },
        ...charted.map((b, i) => ({
          label: b.name,
          data: data.chart.map((r) => (typeof r[b.key] === "number" ? (r[b.key] as number) : null)),
          borderColor: colours[i % colours.length],
          backgroundColor: colours[i % colours.length],
          borderWidth: 1.5,
          borderDash: i === 0 ? [] : [5, 4],
          pointRadius: 0,
          tension: 0.2,
        })),
      ],
    };
  }, [data, charted, isLight, locale, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { position: "top" as const, rtl: dir === "rtl" },
      tooltip: {
        rtl: dir === "rtl",
        callbacks: { label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}` },
      },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 6, maxRotation: 0 } },
      y: { ticks: { callback: (v: string | number) => `${dir === "rtl" ? LRM : ""}${v}` } },
    },
  };

  return (
    <>
      <dl className="ins-grid">
        <Stat label={t("pi_total")} value={signedPct(data.total_return)} valueTone={tone(data.total_return)} />
        <Stat
          label={t("pi_avg_month")}
          value={data.average_monthly_return === null ? "—" : signedPct(data.average_monthly_return)}
          valueTone={tone(data.average_monthly_return)}
          sub={counted ? fill(t("pi_months_counted"), { n: counted }) : t("pi_no_months")}
        />
        <Stat
          label={t("pi_best_month")}
          value={data.best_month ? signedPct(data.best_month.value) : "—"}
          valueTone={tone(data.best_month?.value)}
          sub={data.best_month ? monthName(data.best_month) : t("pi_no_months")}
        />
        <Stat
          label={t("pi_worst_month")}
          value={data.worst_month ? signedPct(data.worst_month.value) : "—"}
          valueTone={tone(data.worst_month?.value)}
          sub={data.worst_month ? monthName(data.worst_month) : t("pi_no_months")}
        />
        <Stat
          label={t("pi_positive_months")}
          value={counted ? fill(t("pi_positive_of"), { n: data.positive_months.positive, total: counted }) : "—"}
          phrase
          sub={counted ? undefined : t("pi_no_months")}
        />
        <Stat
          label={t("pi_drawdown")}
          value={signedPct(dd.value)}
          valueTone={tone(dd.value)}
          sub={dd.peak_date && dd.trough_date ? `${day(dd.peak_date)} – ${day(dd.trough_date)}` : t("pi_no_drawdown")}
        />
        <Stat
          label={t("pi_daily_gain")}
          value={data.max_daily_gain ? signedPct(data.max_daily_gain.value) : "—"}
          valueTone={tone(data.max_daily_gain?.value)}
          sub={data.max_daily_gain ? day(data.max_daily_gain.date) : undefined}
        />
        <Stat
          label={t("pi_daily_loss")}
          value={data.max_daily_loss ? signedPct(data.max_daily_loss.value) : "—"}
          valueTone={tone(data.max_daily_loss?.value)}
          sub={data.max_daily_loss ? day(data.max_daily_loss.date) : undefined}
        />
        <Stat label={t("pi_age")} value={fill(t("pi_age_days"), { n: data.age_days })} phrase />
      </dl>

      <h4 className="ins-subtitle">{t("pi_vs_title")}</h4>
      <p className="al-note">{fill(t("pi_same_dates"), { start: day(data.start), end: day(data.end) })}</p>
      <div className="al-scroll">
        <table className="ins-table">
          <thead>
            <tr>
              <th scope="col">{t("pi_series")}</th>
              <th scope="col">{t("pi_return")}</th>
              <th scope="col">{t("pi_excess")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="is-portfolio">
              <th scope="row">{t("pi_portfolio")}</th>
              <td className={tone(data.total_return)}><bdi dir="ltr">{signedPct(data.total_return)}</bdi></td>
              <td>—</td>
            </tr>
            {data.benchmarks.map((b) => (
              <tr key={b.key}>
                <th scope="row">
                  {b.name} <span className="ins-symbol"><bdi dir="ltr">({b.symbol})</bdi></span>
                </th>
                {b.return === null ? (
                  <td colSpan={2} className="ins-missing">{t("pi_no_data")}</td>
                ) : (
                  <>
                    <td className={tone(b.return)}><bdi dir="ltr">{signedPct(b.return)}</bdi></td>
                    <td className={tone(b.excess_return)}><bdi dir="ltr">{signedPct(b.excess_return ?? 0)}</bdi></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ins-chart" role="img" aria-label={t("pi_chart_label")}>
        <Line data={chart} options={options} />
      </div>

      <p className="ins-foot">
        {fill(t("pi_proxy_note"), { symbols: ltr(meta.benchmarks.map((b) => b.symbol).join(" / ")) })}
      </p>
      {data.estimated && <p className="ins-foot">{t("pi_estimated")}</p>}
      <Link className="ix-link" to="/compare/market">{t("ix_open")}</Link>
    </>
  );
};

export const InsightsModule = ({ portfolioId, reloadKey = 0 }: { portfolioId: number; reloadKey?: number }) => {
  const { t, locale } = useLanguage();
  const [data, setData] = useState<Insights | null>(null);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);

  // A capital reward is a flow, not return, but it rebuilds nothing until the
  // next valuation run; reloading keeps the module in step with the others.
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(DAILY_REWARDS_CHANGED, bump);
    return () => window.removeEventListener(DAILY_REWARDS_CHANGED, bump);
  }, []);

  const load = useCallback(() => {
    fetchInsights(portfolioId)
      .then((d) => {
        setData(d);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [portfolioId]);
  useEffect(load, [load, reloadKey, tick]);

  const asOf = data?.available
    ? asDate(data.insights.end).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <section className="al-module ins-module" aria-labelledby="ins-title">
      <header className="al-head">
        <div>
          <h3 id="ins-title">{t("pi_title")}</h3>
          <p className="al-note">
            {t("pi_note")}
            {asOf && <> · {fill(t("pi_as_of"), { date: asOf })}</>}
          </p>
        </div>
      </header>

      {failed && <p className="error">{t("pi_load_failed")}</p>}
      {!data && !failed && <p className="stock-panel-loading">{t("loading")}</p>}
      {data && data.status && !data.status.consistent && <p className="ins-warn">{t("pi_inconsistent")}</p>}
      {data && !data.available && (
        <p className="stock-empty">{data.reason === "no_history" ? t("pi_no_history") : t("pi_too_new")}</p>
      )}
      {data && data.available && <Body data={data.insights} meta={data} />}
    </section>
  );
};
