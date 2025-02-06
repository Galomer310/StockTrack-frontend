import React, { useMemo } from "react"; // Import React and the useMemo hook
import { Pie } from "react-chartjs-2"; // Import the Pie chart component from react-chartjs-2
import chroma from "chroma-js"; // Import chroma-js for color generation
import {
  Chart as ChartJS, // Import Chart.js core object
  ArcElement, // Import the ArcElement needed for pie charts
  Tooltip, // Import Tooltip for displaying hover tooltips
  Legend, // Import Legend for chart legends
  Colors, // Import Colors plugin for automatic color generation
} from "chart.js";

// Register Chart.js components for the pie chart
ChartJS.register(ArcElement, Tooltip, Legend, Colors); // Register the imported components

// Define the props interface for StockDistributionPieChart
interface StockDistributionPieChartProps {
  watchlist: any[]; // Array of watchlist items
}

// Define the functional component using the props interface
const StockDistributionPieChart: React.FC<StockDistributionPieChartProps> = ({
  watchlist, // Destructure watchlist from props
}) => {
  // useMemo hook to compute aggregated data only when watchlist changes
  const aggregatedData = useMemo(() => {
    const agg: Record<string, number> = {}; // Initialize an object to hold sums per stock symbol
    watchlist.forEach((item) => {
      // Loop over each item in the watchlist
      const value = parseFloat(item.price_at_time) * Number(item.quantity); // Calculate the total value for this item
      const symbol = item.stock_symbol; // Get the stock symbol
      agg[symbol] = (agg[symbol] || 0) + value; // Sum the values per symbol
    });
    return agg; // Return the aggregated data
  }, [watchlist]); // Dependency array: recalc if watchlist changes

  const labels = Object.keys(aggregatedData); // Get an array of stock symbols as labels
  const dataValues = labels.map((label) => aggregatedData[label]); // Map each label to its corresponding aggregated value

  // Function to generate a dynamic array of colors based on the number of segments
  const generateDynamicColors = (count: number) =>
    chroma.scale("Spectral").colors(count); // Use the "Spectral" scale from chroma-js

  // Prepare the data object for the Pie chart component
  const data = {
    labels, // Labels for each pie slice
    datasets: [
      {
        data: dataValues, // The data values for each slice
        backgroundColor: generateDynamicColors(dataValues.length), // Dynamic colors for each slice
      },
    ],
  };

  // Return the Pie chart inside a styled div container
  return (
    <div style={{ maxWidth: "500px", margin: "20px auto" }}>
      {" "}
      {/* Container with max-width and centered margin */}
      <h4 style={{ textAlign: "center" }}>
        Stock Distribution in Portfolio
      </h4>{" "}
      {/* Chart title */}
      <Pie data={data} /> {/* Render the Pie chart with the prepared data */}
    </div>
  );
};

export default StockDistributionPieChart; // Export the component as default
