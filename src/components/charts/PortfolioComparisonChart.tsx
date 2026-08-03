import React, { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { PortfolioResponse } from "../../api/social";
import { SERIES } from "../../charts/chartTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ===========================================================================
   Two portfolios on one axis.
   ---------------------------------------------------------------------------
   Important caveat, surfaced in the UI as well: this is NOT a historical
   performance chart. We hold each purchase's cost and the CURRENT price, but
   not what every holding was worth on every past date - fetching that would
   need one API call per symbol per range, which the 25/day budget cannot pay
   for.

   So each point answers: "of the positions owned by this date, what were they
   bought for, and what are they worth now?" That still shows how each book was
   built and which purchases carried it, which is what a comparison needs.
   =========================================================================== */

interface Props {
  mine: PortfolioResponse;
  theirs: PortfolioResponse;
}

type Mode = "return" | "value";

const PortfolioComparisonChart: React.FC<Props> = ({ mine, theirs }) => {
  // Percentage is the default: it compares skill rather than capital, matching
  // how the leaderboard ranks.
  const [mode, setMode] = useState<Mode>("return");

  const { labels, mineSeries, theirsSeries } = useMemo(() => {
    // Shared, ordered timeline of every purchase date across both portfolios.
    const dates = Array.from(
      new Set(
        [...mine.holdings, ...theirs.holdings].map((h) =>
          new Date(h.added_at).toISOString().slice(0, 10)
        )
      )
    ).sort();

    const seriesFor = (portfolio: PortfolioResponse) =>
      dates.map((date) => {
        const cutoff = new Date(`${date}T23:59:59Z`).getTime();
        let invested = 0;
        let value = 0;
        for (const h of portfolio.holdings) {
          if (new Date(h.added_at).getTime() > cutoff) continue;
          invested += h.price_at_time * h.quantity;
          value += h.latest_price * h.quantity;
        }
        if (mode === "value") return value;
        return invested > 0 ? ((value - invested) / invested) * 100 : 0;
      });

    return {
      labels: dates.map((d) => new Date(d).toLocaleDateString()),
      mineSeries: seriesFor(mine),
      theirsSeries: seriesFor(theirs),
    };
  }, [mine, theirs, mode]);

  if (labels.length === 0) return null;

  const data = {
    labels,
    datasets: [
      {
        label: mine.user.display_name,
        data: mineSeries,
        borderColor: SERIES.gold,
        backgroundColor: SERIES.goldFill,
        fill: mode === "value",
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: theirs.user.display_name,
        data: theirsSeries,
        borderColor: SERIES.steel,
        backgroundColor: SERIES.steelFill,
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
        borderDash: [5, 4],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            mode === "value"
              ? `${ctx.dataset.label}: $${Number(ctx.parsed.y).toFixed(2)}`
              : `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(2)}%`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v: any) => (mode === "value" ? `$${v}` : `${v}%`),
        },
      },
    },
  };

  return (
    <div className="comparison-chart">
      <div className="range-picker">
        <button
          className={`range-chip${mode === "return" ? " is-active" : ""}`}
          onClick={() => setMode("return")}
        >
          Return %
        </button>
        <button
          className={`range-chip${mode === "value" ? " is-active" : ""}`}
          onClick={() => setMode("value")}
        >
          Value
        </button>
      </div>

      <div className="chart-container chart-tall">
        <Line data={data} options={options} />
      </div>

      <p className="compare-note">
        Each point shows the positions owned by that date, valued at today's
        prices — not a historical price series.
      </p>
    </div>
  );
};

export default PortfolioComparisonChart;
