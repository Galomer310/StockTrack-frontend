import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import chroma from "chroma-js";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Colors);
interface StockDistributionPieChartProps {
  watchlist: any[];
}

const StockDistributionPieChart: React.FC<StockDistributionPieChartProps> = ({
  watchlist,
}) => {
  // Aggregate invested values by stock symbol.
  // For each watchlist item, calculate value = price_at_time * quantity.
  // Then, sum these values for each unique stock_symbol.
  const aggregatedData = useMemo(() => {
    const agg: Record<string, number> = {};
    watchlist.forEach((item) => {
      const value = parseFloat(item.price_at_time) * Number(item.quantity);
      const symbol = item.stock_symbol;
      agg[symbol] = (agg[symbol] || 0) + value;
    });
    return agg;
  }, [watchlist]);

  const labels = Object.keys(aggregatedData);
  const dataValues = labels.map((label) => aggregatedData[label]);

  const generateDynamicColors = (count: number) =>
    chroma.scale("Spectral").colors(count);

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: generateDynamicColors(dataValues.length),
      },
    ],
  };

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto" }}>
      <h4 style={{ textAlign: "center" }}>Stock Distribution in Portfolio</h4>
      <Pie data={data} />
    </div>
  );
};

export default StockDistributionPieChart;
