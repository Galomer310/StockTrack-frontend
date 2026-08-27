import React, { useMemo } from "react";
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
import { PortfolioResponse, isOwnHolding } from "../../api/social";
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

   The value/dollar mode has been removed along with it. Another investor's
   holdings arrive as percentages - the server does not send their prices - so
   there is no second axis to plot them on, and inventing one from your side
   alone would be a chart of two different things.
   =========================================================================== */

interface Props {
  mine: PortfolioResponse;
  theirs: PortfolioResponse;
}

const PortfolioComparisonChart: React.FC<Props> = ({ mine, theirs }) => {
  const { labels, mineSeries, theirsSeries } = useMemo(() => {
    // Shared, ordered timeline of every purchase date across both portfolios.
    const dates = Array.from(
      new Set(
        [...mine.holdings, ...theirs.holdings].map((h) =>
          new Date(h.added_at).toISOString().slice(0, 10)
        )
      )
    ).sort();

    // Return of the positions owned by each date.
    //
    // Your own side is cost-weighted, which is the true return on what was
    // deployed. The other investor's holdings carry no prices, so their side
    // weights each position's gain by its share of their book - the same
    // measure, computed from the only inputs that leave the server.
    const seriesFor = (portfolio: PortfolioResponse) =>
      dates.map((date) => {
        const cutoff = new Date(`${date}T23:59:59Z`).getTime();
        const owned = portfolio.holdings.filter(
          (h) => new Date(h.added_at).getTime() <= cutoff
        );
        if (owned.length === 0) return 0;

        if (isOwnHolding(owned[0])) {
          let invested = 0;
          let value = 0;
          for (const h of owned) {
            if (!isOwnHolding(h)) continue;
            invested += h.price_at_time * h.quantity;
            value += h.latest_price * h.quantity;
          }
          return invested > 0 ? ((value - invested) / invested) * 100 : 0;
        }

        let weighted = 0;
        let totalWeight = 0;
        for (const h of owned) {
          if (isOwnHolding(h)) continue;
          weighted += h.gain_pct * h.weight_pct;
          totalWeight += h.weight_pct;
        }
        return totalWeight > 0 ? weighted / totalWeight : 0;
      });

    return {
      labels: dates.map((d) => new Date(d).toLocaleDateString()),
      mineSeries: seriesFor(mine),
      theirsSeries: seriesFor(theirs),
    };
  }, [mine, theirs]);

  if (labels.length === 0) return null;

  const data = {
    labels,
    datasets: [
      {
        label: mine.portfolio.name,
        data: mineSeries,
        borderColor: SERIES.gold,
        backgroundColor: SERIES.goldFill,
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: theirs.portfolio.name,
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
            `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(2)}%`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v: any) => `${v}%`,
        },
      },
    },
  };

  return (
    <div className="comparison-chart">
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
