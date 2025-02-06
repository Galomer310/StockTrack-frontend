import React, { FC, useMemo } from "react";
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
} from "chart.js";

// Register the necessary Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PortfolioPerformanceChartProps {
  watchlist: any[];
  latestPrices: { [symbol: string]: number };
}

const PortfolioPerformanceChart: FC<PortfolioPerformanceChartProps> = ({
  watchlist,
  latestPrices,
}) => {
  const chartData = useMemo(() => {
    if (watchlist.length === 0) return null;

    const sortedByDate = [...watchlist].sort(
      (a, b) => new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
    );

    let cumulativeInvested = 0;
    let cumulativeCurrent = 0;
    const labels: string[] = [];
    const investedData: number[] = [];
    const currentData: number[] = [];

    sortedByDate.forEach((item) => {
      const investedAmount =
        parseFloat(item.price_at_time) * Number(item.quantity);
      cumulativeInvested += investedAmount;

      const effectivePrice =
        latestPrices[item.stock_symbol] !== undefined
          ? latestPrices[item.stock_symbol]
          : parseFloat(item.price_at_time);
      cumulativeCurrent += effectivePrice * Number(item.quantity);

      labels.push(new Date(item.added_at).toLocaleDateString());
      investedData.push(cumulativeInvested);
      currentData.push(cumulativeCurrent);
    });

    return {
      labels,
      datasets: [
        {
          label: "Invested Value",
          data: investedData,
          borderColor: "blue",
          backgroundColor: "rgba(0, 0, 255, 0.1)",
          fill: false,
        },
        {
          label: "Current Value",
          data: currentData,
          borderColor: "green",
          backgroundColor: "rgba(0, 128, 0, 0.1)",
          fill: false,
        },
      ],
    };
  }, [watchlist, latestPrices]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Portfolio Performance Over Time",
      },
    },
  };

  if (!chartData) return null;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default PortfolioPerformanceChart;
