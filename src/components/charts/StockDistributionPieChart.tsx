import React, { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { CATEGORICAL, NEUTRAL, CHART_SURFACE } from "../../charts/chartTheme";
import { money } from "../../api/social";
import { useLanguage } from "../../i18n/LanguageContext";
import { fill } from "../../i18n/fill";

ChartJS.register(ArcElement, Tooltip, Legend);

/* ===========================================================================
   What the whole portfolio is made of.
   ---------------------------------------------------------------------------
   The pie is the WHOLE book, not just the invested part: every position plus
   the cash still waiting to be deployed, summing to 100%. Buy one stock with
   40% of your money and the chart reads 40% that ticker, 60% cash - which is
   the only way a slice percentage means anything, now that a portfolio has a
   fixed amount to spend.

   Two decisions worth stating:

   Positions are valued at the LATEST price, not at what was paid, so the
   percentages match the weights shown on the leaderboard and on the investor
   page (all three divide by equity). Using cost here would have the same
   holding reading as two different weights on two screens.

   Colour identifies a ticker and nothing else - it never encodes size. Slots
   are handed out in a fixed order from a validated six-colour palette; cash
   takes a neutral grey that is deliberately not one of them, because it is not
   a position. Past six holdings the tail folds into "Other" rather than
   inventing a seventh hue that nobody could tell from the first six.
   =========================================================================== */

// Six categorical slots is the ceiling, and cash needs none of them. Beyond
// this many positions the smallest fold into "Other".
const MAX_POSITION_SLICES = 6;

interface Props {
  watchlist: any[];
  /** Uninvested cash in this portfolio */
  cash: number;
  /** Latest price per symbol; falls back to the price paid when unknown */
  latestPrices?: Record<string, number>;
}

// The app is dark by default and toggles `light-mode` on <body>. The palette
// has its own steps per surface, so the chart has to know which is showing and
// re-render when it changes - an automatic flip of the dark colours would not
// clear the contrast floors on white.
const useIsLightMode = (): boolean => {
  const [light, setLight] = useState(() =>
    document.body.classList.contains("light-mode")
  );

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setLight(document.body.classList.contains("light-mode"))
    );
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return light;
};

const StockDistributionPieChart: React.FC<Props> = ({
  watchlist,
  cash,
  latestPrices = {},
}) => {
  const isLight = useIsLightMode();
  const palette = isLight ? CATEGORICAL.light : CATEGORICAL.dark;
  const neutral = isLight ? NEUTRAL.light : NEUTRAL.dark;
  const surface = isLight ? CHART_SURFACE.light : CHART_SURFACE.dark;
  const { t, dir } = useLanguage();
  const rtl = dir === "rtl";

  const slices = useMemo(() => {
    // Market value per ticker.
    const bySymbol: Record<string, number> = {};
    for (const item of watchlist) {
      const symbol = item.stock_symbol;
      const price = latestPrices[symbol] ?? parseFloat(item.price_at_time);
      bySymbol[symbol] = (bySymbol[symbol] || 0) + price * Number(item.quantity);
    }

    const positions = Object.entries(bySymbol)
      .map(([symbol, value]) => ({ symbol, value }))
      .sort((a, b) => b.value - a.value);

    // Fold the tail so the chart never carries more colour classes than can be
    // told apart. Nothing is hidden: the folded holdings are named in the
    // table below, and the slice says how many there are.
    let shown = positions;
    let folded: typeof positions = [];
    if (positions.length > MAX_POSITION_SLICES) {
      shown = positions.slice(0, MAX_POSITION_SLICES - 1);
      folded = positions.slice(MAX_POSITION_SLICES - 1);
    }

    // Colour follows the ticker, assigned alphabetically among the slices that
    // get their own colour. Deliberately NOT by size: a position must not
    // change colour because it grew, and filtering must not repaint the rest.
    const colourOrder = [...shown]
      .map((p) => p.symbol)
      .sort((a, b) => a.localeCompare(b));

    const result: { label: string; value: number; color: string; detail?: string }[] =
      shown.map((p) => ({
        label: p.symbol,
        value: p.value,
        color: palette[colourOrder.indexOf(p.symbol) % palette.length],
      }));

    if (folded.length > 0) {
      result.push({
        label: fill(t("chart_other"), { n: folded.length }),
        value: folded.reduce((sum, p) => sum + p.value, 0),
        color: palette[Math.min(shown.length, palette.length - 1)],
        detail: folded.map((p) => p.symbol).join(", "),
      });
    }

    // Cash last, so the eye lands on the positions first, and only when there
    // is some - a 0% slice is noise.
    if (cash > 0) {
      result.push({ label: t("chart_cash"), value: cash, color: neutral });
    }

    return result;
  }, [watchlist, latestPrices, cash, palette, neutral, t]);

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total <= 0) {
    return (
      <p className="stock-empty">{t("chart_empty")}</p>
    );
  }

  const share = (value: number) => (value / total) * 100;

  const data = {
    labels: slices.map((s) => s.label),
    datasets: [
      {
        data: slices.map((s) => s.value),
        backgroundColor: slices.map((s) => s.color),
        // A ring in the surface colour, so the slices read as separated by a
        // gap rather than outlined by a drawn border.
        borderColor: surface,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // Right-to-left legend and tooltip in Hebrew, so a swatch sits before
      // its label in reading order.
      legend: {
        position: "bottom" as const,
        rtl,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 14,
          // The percentage rides in the legend, so identity and size are both
          // readable as text. This is what discharges the light-mode contrast
          // obligation on three of the six hues.
          generateLabels: () =>
            slices.map((s, index) => ({
              text: `${s.label} · ${share(s.value).toFixed(1)}%`,
              fillStyle: s.color,
              strokeStyle: s.color,
              pointStyle: "circle" as const,
              index,
            })),
        },
      },
      tooltip: {
        rtl,
        callbacks: {
          label: (ctx: any) => {
            const slice = slices[ctx.dataIndex];
            const line = `${share(slice.value).toFixed(1)}% · ${money(slice.value)}`;
            return slice.detail ? `${line} (${slice.detail})` : line;
          },
        },
      },
    },
  };

  return (
    <div className="composition-chart">
      <h4 className="composition-title">{t("chart_composition")}</h4>
      <p className="composition-note">{t("chart_composition_note")}</p>

      <div className="composition-body">
        <div className="composition-plot">
          <Pie data={data} options={options} />
        </div>

        {/* The same numbers as text. A chart is never the only way to read a
            value - and on the light surface some of these hues sit below the
            contrast floor, where this table is what carries the reading. */}
        <table className="composition-table">
          <thead>
            <tr>
              <th>{t("chart_holding")}</th>
              <th>{t("chart_share")}</th>
              <th>{t("chart_value")}</th>
            </tr>
          </thead>
          <tbody>
            {slices.map((s) => (
              <tr key={s.label}>
                <td>
                  <span
                    className="composition-swatch"
                    style={{ background: s.color }}
                    aria-hidden="true"
                  />
                  {s.label}
                  {s.detail && <span className="composition-detail">{s.detail}</span>}
                </td>
                <td className="composition-share">{share(s.value).toFixed(1)}%</td>
                <td className="composition-value">{money(s.value)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>{t("chart_total")}</td>
              <td className="composition-share">100.0%</td>
              <td className="composition-value">{money(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default StockDistributionPieChart;
