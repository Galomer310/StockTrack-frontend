import { ArcElement, Chart as ChartJS, ChartOptions, Legend, Tooltip, TooltipItem } from "chart.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { DAILY_REWARDS_CHANGED } from "../../api/dailyRewards";
import { Allocation, AllocationHolding, fetchAllocation } from "../../api/portfolioDashboard";
import { money, percent } from "../../api/social";
import { CATEGORICAL, CHART_SURFACE, NEUTRAL } from "../../charts/chartTheme";
import { useIsLightMode } from "../../charts/useIsLightMode";
import { useLanguage } from "../../i18n/LanguageContext";
import { AllocationDashboard } from "./AllocationDashboard";
import "./allocation.css";

ChartJS.register(ArcElement, Tooltip, Legend);

/* ===========================================================================
   Module 1 - Portfolio Allocation (spec Part 1).
   ---------------------------------------------------------------------------
   A donut of the five largest holdings, Other, and Cash Available: current
   exposure at today's prices, always 100%. The same numbers sit in a table
   beside it, so the chart is never the only way to read a value.

   Selecting a holding opens its panel, with exactly the spec's six fields
   in order. "Open allocation dashboard" opens the expanded view, and from
   there Portfolio History. Every figure comes from the server.

   Colour identifies a ticker and nothing else: holdings take the palette in
   alphabetical order, Other the next slot, and cash a neutral grey that is
   not one of them, because it is not a position.
   =========================================================================== */

const pct = (n: number) => `${n.toFixed(1)}%`;

export const AllocationModule = ({ portfolioId, reloadKey = 0 }: { portfolioId: number; reloadKey?: number }) => {
  const { t, dir, locale } = useLanguage();
  const isLight = useIsLightMode();
  const [data, setData] = useState<Allocation | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [tick, setTick] = useState(0);

  // A capital reward changes the cash, and so every weight.
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(DAILY_REWARDS_CHANGED, bump);
    return () => window.removeEventListener(DAILY_REWARDS_CHANGED, bump);
  }, []);

  const load = useCallback(() => {
    fetchAllocation(portfolioId)
      .then((d) => {
        setData(d);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [portfolioId]);

  useEffect(() => {
    load();
  }, [load, reloadKey, tick]);

  const palette = isLight ? CATEGORICAL.light : CATEGORICAL.dark;
  const neutral = isLight ? NEUTRAL.light : NEUTRAL.dark;
  const surface = isLight ? CHART_SURFACE.light : CHART_SURFACE.dark;

  const slices = useMemo(() => {
    if (!data) return [];
    const order = data.slices
      .filter((s) => s.kind === "holding")
      .map((s) => s.label)
      .sort((a, b) => a.localeCompare(b));
    return data.slices.map((s) => ({
      ...s,
      name: s.kind === "cash" ? t("al_cash") : s.kind === "other" ? t("al_other") : s.label,
      color:
        s.kind === "cash"
          ? neutral
          : s.kind === "other"
            ? palette[Math.min(order.length, palette.length - 1)]
            : palette[order.indexOf(s.label) % palette.length],
    }));
  }, [data, palette, neutral, t]);

  const holding: AllocationHolding | undefined = data?.holdings.find((h) => h.symbol === selected);

  if (failed) return <section className="al-module"><p className="error">{t("al_load_failed")}</p></section>;
  if (!data) return <section className="al-module" aria-busy="true"><p className="stock-panel-loading">{t("loading")}</p></section>;

  const rtl = dir === "rtl";
  const chartData = {
    labels: slices.map((s) => s.name),
    datasets: [{ data: slices.map((s) => s.weight_pct), backgroundColor: slices.map((s) => s.color), borderColor: surface, borderWidth: 2 }],
  };
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: { display: false },
      tooltip: { rtl, callbacks: { label: (ctx: TooltipItem<"doughnut">) => ` ${pct(slices[ctx.dataIndex].weight_pct)}` } },
    },
    onClick: (_: unknown, elements: { index: number }[]) => {
      const s = elements[0] ? slices[elements[0].index] : null;
      if (s && s.kind === "holding") setSelected(s.label);
    },
  };

  return (
    <section className="al-module" aria-labelledby="al-title">
      <header className="al-head">
        <div>
          <h3 id="al-title">{t("al_title")}</h3>
          <p className="al-note">{t("al_note")}</p>
        </div>
        <button type="button" className="al-open" onClick={() => setExpanded(true)}>
          {t("al_open")}
        </button>
      </header>

      {data.holdings.length === 0 && <p className="stock-empty">{t("al_empty")}</p>}

      <div className="al-body">
        <div className="al-chart">
          <Doughnut data={chartData} options={options} />
        </div>

        <table className="al-table">
          <tbody>
            {slices.map((s) => (
              <tr key={s.kind + s.label} className={s.kind === "holding" && s.label === selected ? "is-selected" : ""}>
                <td>
                  <span className="al-swatch" style={{ background: s.color }} aria-hidden="true" />
                  {s.kind === "holding" ? (
                    <button type="button" className="al-symbol" onClick={() => setSelected(s.label)} aria-pressed={s.label === selected}>
                      <bdi dir="ltr">{s.name}</bdi>
                    </button>
                  ) : (
                    s.name
                  )}
                </td>
                <td className="al-num"><bdi dir="ltr">{pct(s.weight_pct)}</bdi></td>
              </tr>
            ))}
          </tbody>
        </table>

        {holding && (
          <aside className="al-panel" aria-label={holding.symbol}>
            <header>
              <h4><bdi dir="ltr">{holding.symbol}</bdi></h4>
              <button type="button" className="al-close" onClick={() => setSelected(null)} aria-label={t("close")}>×</button>
            </header>
            {/* Exactly the spec's six fields, in its order. */}
            <dl>
              <div><dt>{t("al_exposure")}</dt><dd><bdi dir="ltr">{pct(holding.exposure_pct)}</bdi></dd></div>
              <div><dt>{t("al_added")}</dt><dd>{new Date(holding.added_at).toLocaleDateString(locale)}</dd></div>
              <div><dt>{t("al_avg")}</dt><dd><bdi dir="ltr">{holding.avg_buy_price !== null ? money(holding.avg_buy_price) : "—"}</bdi></dd></div>
              <div>
                <dt>{t("al_price_now")}</dt>
                <dd>
                  <bdi dir="ltr">{money(holding.price_now)}</bdi>
                  {holding.price_is_estimate && <span className="al-hint">{t("al_price_estimate")}</span>}
                </dd>
              </div>
              <div>
                <dt>{t("al_gain")}</dt>
                <dd className={holding.gain_pct !== null && holding.gain_pct < 0 ? "loss" : "gain"}>
                  <bdi dir="ltr">{holding.gain_pct !== null ? percent(holding.gain_pct) : "—"}</bdi>
                </dd>
              </div>
              <div><dt>{t("al_sector")}</dt><dd><bdi>{holding.sector ?? t("al_sector_unknown")}</bdi></dd></div>
            </dl>
          </aside>
        )}
      </div>

      <AllocationDashboard open={expanded} data={data} onClose={() => setExpanded(false)} />
    </section>
  );
};
