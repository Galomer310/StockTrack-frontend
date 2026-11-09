import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchIndexComparison, IndexComparisonResult } from "../api/portfolioDashboard";
import { fetchMyPortfolios, MyPortfolio } from "../api/portfolios";
import { NEUTRAL, SERIES } from "../charts/chartTheme";
import { useIsLightMode } from "../charts/useIsLightMode";
import "../components/insights/insights.css";
import { fill, ltr } from "../i18n/fill";
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";
import { RootState } from "../store";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

/* ===========================================================================
   Compare a portfolio with a market index (spec 41).
   ---------------------------------------------------------------------------
   Part of the comparison experience, beside comparing with another player:
   choose one of your portfolios, an index (S&P 500, Nasdaq Composite, Dow
   Jones, Russell 2000) and a period or your own dates. Both are measured
   over exactly the same dates on the genuine performance index (capital
   rewards are not return) and drawn from 100. Choosing an index here never
   changes Beat the Market, which is always measured against the S&P 500.
   =========================================================================== */

type Preset = "1m" | "3m" | "6m" | "ytd" | "1y" | "all" | "custom";
const PRESETS: { id: Preset; label: MessageKey }[] = [
  { id: "1m", label: "ix_1m" },
  { id: "3m", label: "ix_3m" },
  { id: "6m", label: "ix_6m" },
  { id: "ytd", label: "ix_ytd" },
  { id: "1y", label: "ix_1y" },
  { id: "all", label: "ix_all" },
  { id: "custom", label: "ix_custom" },
];

const INDEX_NAME: Record<string, MessageKey> = {
  sp500: "ix_sp500",
  nasdaq_composite: "ix_nasdaq_composite",
  dow: "ix_dow",
  russell2000: "ix_russell2000",
};

const LRM = String.fromCharCode(0x200e);
const pad = (n: number) => String(n).padStart(2, "0");
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthsAgo = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return isoDay(d);
};
const fromOf = (p: Preset): string | undefined =>
  p === "1m" ? monthsAgo(1) : p === "3m" ? monthsAgo(3) : p === "6m" ? monthsAgo(6) : p === "1y" ? monthsAgo(12) : p === "ytd" ? `${new Date().getFullYear()}-01-01` : undefined;
const signed = (x: number) => `${x > 0 ? "+" : ""}${(x * 100).toFixed(2)}%`;
const tone = (x: number) => (x > 0 ? "is-up" : x < 0 ? "is-down" : "");

const IndexComparison = () => {
  const { t, dir, lang, locale } = useLanguage();
  const isLight = useIsLightMode();
  const activeId = useSelector((s: RootState) => s.portfolio.activeId);
  const [portfolios, setPortfolios] = useState<MyPortfolio[] | null>(null);
  const [portfolioId, setPortfolioId] = useState<number | null>(null);
  const [indexKey, setIndexKey] = useState("sp500");
  const [preset, setPreset] = useState<Preset>("all");
  const [custom, setCustom] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [data, setData] = useState<IndexComparisonResult | null>(null);
  const [failed, setFailed] = useState<MessageKey | null>(null);

  useEffect(() => {
    fetchMyPortfolios()
      .then((l) => {
        setPortfolios(l.portfolios);
        setPortfolioId((cur) => cur ?? (l.portfolios.some((p) => p.id === activeId) ? activeId : l.portfolios[0]?.id ?? null));
      })
      .catch(() => setFailed("ix_load_failed"));
  }, [activeId]);

  const from = preset === "custom" ? custom.from || undefined : fromOf(preset);
  const to = preset === "custom" ? custom.to || undefined : undefined;
  const customInvalid = preset === "custom" && !!custom.from && !!custom.to && custom.from >= custom.to;

  useEffect(() => {
    if (portfolioId === null || customInvalid) return;
    let live = true;
    fetchIndexComparison(portfolioId, { index: indexKey, from, to })
      .then((d) => {
        if (!live) return;
        setData(d);
        setFailed(null);
      })
      .catch(() => live && setFailed("ix_load_failed"));
    return () => {
      live = false;
    };
  }, [portfolioId, indexKey, from, to, customInvalid]);

  const indexName = (key: string, fallback: string) => (INDEX_NAME[key] ? t(INDEX_NAME[key]) : fallback);
  const day = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const portfolioName = portfolios?.find((p) => p.id === portfolioId)?.name ?? "";

  const chart = useMemo(() => {
    if (!data || !data.ok) return null;
    const name = indexName(data.index.key, data.index.name);
    return {
      labels: data.chart.map((r) => new Date(`${r.date}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" })),
      datasets: [
        { label: portfolioName, data: data.chart.map((r) => r.portfolio), borderColor: SERIES.gold, backgroundColor: SERIES.gold, borderWidth: 2.5, pointRadius: 0, tension: 0.2 },
        { label: name, data: data.chart.map((r) => r.index), borderColor: isLight ? NEUTRAL.light : SERIES.steel, backgroundColor: isLight ? NEUTRAL.light : SERIES.steel, borderWidth: 1.8, pointRadius: 0, tension: 0.2 },
      ],
    };
    // indexName depends on the language only through t.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLight, locale, portfolioName, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: { legend: { position: "top" as const, rtl: dir === "rtl" }, tooltip: { rtl: dir === "rtl" } },
    scales: {
      x: { ticks: { maxTicksLimit: 6, maxRotation: 0 } },
      y: { ticks: { callback: (v: string | number) => `${dir === "rtl" ? LRM : ""}${v}` } },
    },
  };

  return (
    <div className="compare-page ix-page" dir={dir} lang={lang}>
      <Link className="back-btn" to="/leaderboard">{t("back_to_leaderboard")}</Link>
      <h2>{t("ix_title")}</h2>
      <p className="compare-note">{t("ix_intro")}</p>

      {portfolios && portfolios.length === 0 && <p className="stock-empty">{t("dash_open_portfolio")}</p>}
      {portfolios && portfolios.length > 0 && (
        <div className="ix-controls">
          <label>
            <span>{t("ix_portfolio")}</span>
            <select value={portfolioId ?? ""} onChange={(e) => setPortfolioId(Number(e.target.value))}>
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{t("ix_index")}</span>
            <select value={indexKey} onChange={(e) => setIndexKey(e.target.value)}>
              {(data?.indices ?? [{ key: "sp500", symbol: "SPY", name: "S&P 500" }]).map((i) => (
                <option key={i.key} value={i.key}>{indexName(i.key, i.name)}</option>
              ))}
            </select>
          </label>
          <div className="ix-periods" role="group" aria-label={t("ix_period")}>
            {PRESETS.map((p) => (
              <button key={p.id} type="button" className={preset === p.id ? "is-on" : ""} aria-pressed={preset === p.id} onClick={() => setPreset(p.id)}>
                {t(p.label)}
              </button>
            ))}
          </div>
          {preset === "custom" && (
            <div className="ix-dates">
              <label>
                <span>{t("ix_from")}</span>
                <input type="date" dir="ltr" value={custom.from} min={data?.range.earliest} max={data?.range.latest ?? undefined} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} />
              </label>
              <label>
                <span>{t("ix_to")}</span>
                <input type="date" dir="ltr" value={custom.to} min={data?.range.earliest} max={data?.range.latest ?? undefined} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} />
              </label>
              {customInvalid && <p className="error" role="alert">{t("ix_bad_range")}</p>}
            </div>
          )}
        </div>
      )}

      {failed && <p className="error">{t(failed)}</p>}
      {data && !data.ok && (
        <p className="stock-empty">{t(data.reason === "no_index_data" ? "ix_no_index_data" : data.reason === "no_history" ? "pi_no_history" : "ix_too_short")}</p>
      )}
      {data && data.ok && chart && (
        <>
          <p className="al-note">{fill(t("pi_same_dates"), { start: day(data.start), end: day(data.end) })}</p>
          <div className="ix-summary">
            <div className="ins-stat">
              <dt><bdi>{portfolioName}</bdi></dt>
              <dd><bdi dir="ltr" className={`ins-value ${tone(data.portfolio_return)}`}>{signed(data.portfolio_return)}</bdi></dd>
            </div>
            <div className="ins-stat">
              <dt>{indexName(data.index.key, data.index.name)} <span className="ins-symbol"><bdi dir="ltr">({data.index.symbol})</bdi></span></dt>
              <dd><bdi dir="ltr" className={`ins-value ${tone(data.index_return)}`}>{signed(data.index_return)}</bdi></dd>
            </div>
            <div className="ins-stat">
              <dt>{t("pi_excess")}</dt>
              <dd><bdi dir="ltr" className={`ins-value ${tone(data.excess_return)}`}>{signed(data.excess_return)}</bdi></dd>
            </div>
          </div>
          <div className="ins-chart" role="img" aria-label={t("ix_chart_label")}>
            <Line data={chart} options={options} />
          </div>
          <p className="ins-foot">{fill(t("ix_proxy_note"), { symbol: ltr(data.index.symbol) })}</p>
          {data.estimated && <p className="ins-foot">{t("pi_estimated")}</p>}
        </>
      )}
    </div>
  );
};

export default IndexComparison;
