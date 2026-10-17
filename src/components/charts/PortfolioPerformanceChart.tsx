import { FC, useMemo } from "react"; // Import the FC type and useMemo hook
import { Line } from "react-chartjs-2"; // Import the Line chart component from react-chartjs-2
import {
  Chart as ChartJS, // Import Chart.js core object
  CategoryScale, // Import CategoryScale for the X-axis
  LinearScale, // Import LinearScale for the Y-axis
  PointElement, // Import PointElement for data points
  LineElement, // Import LineElement to draw lines
  Title, // Import Title plugin for chart title
  Tooltip, // Import Tooltip plugin for hover information
  Legend, // Import Legend plugin for chart legends
} from "chart.js";
import { SERIES } from "../../charts/chartTheme"; // Shared gold/steel series colours
import { useLanguage } from "../../i18n/LanguageContext";

// Register the necessary Chart.js modules for the line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define the props interface for PortfolioPerformanceChart
interface PortfolioPerformanceChartProps {
  watchlist: any[]; // Array of watchlist items
  latestPrices: { [symbol: string]: number }; // Object mapping stock symbols to their latest prices
}

// Define the functional component using the props interface
const PortfolioPerformanceChart: FC<PortfolioPerformanceChartProps> = ({
  watchlist, // Destructure watchlist from props
  latestPrices, // Destructure latestPrices from props
}) => {
  const { t, dir, locale } = useLanguage();
  // useMemo hook to compute chart data only when watchlist or latestPrices change
  const chartData = useMemo(() => {
    if (watchlist.length === 0) return null; // Return null if watchlist is empty

    // Sort watchlist items by the date they were added
    const sortedByDate = [...watchlist].sort(
      (a, b) => new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
    );

    let cumulativeInvested = 0; // Initialize cumulative invested amount
    let cumulativeCurrent = 0; // Initialize cumulative current value
    const labels: string[] = []; // Array for chart labels (dates)
    const investedData: number[] = []; // Array for invested values over time
    const currentData: number[] = []; // Array for current portfolio values over time

    // Process each sorted watchlist item
    sortedByDate.forEach((item) => {
      const investedAmount =
        parseFloat(item.price_at_time) * Number(item.quantity); // Calculate invested amount for the item
      cumulativeInvested += investedAmount; // Update cumulative invested amount

      // Determine the effective price (latest price if available, otherwise purchase price)
      const effectivePrice =
        latestPrices[item.stock_symbol] !== undefined
          ? latestPrices[item.stock_symbol]
          : parseFloat(item.price_at_time);
      cumulativeCurrent += effectivePrice * Number(item.quantity); // Update cumulative current value

      labels.push(new Date(item.added_at).toLocaleDateString(locale)); // Dates in the reader's language
      investedData.push(cumulativeInvested); // Add current cumulative invested value
      currentData.push(cumulativeCurrent); // Add current cumulative portfolio value
    });

    // Return the data structure expected by the Line chart
    return {
      labels, // X-axis labels (dates)
      datasets: [
        {
          label: t("chart_invested_value"),
          data: investedData, // Data points for invested value
          borderColor: SERIES.steel, // Steel blue, the secondary accent
          backgroundColor: SERIES.steelFill,
          fill: false, // Do not fill the area under the line
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: t("chart_current_value"),
          data: currentData, // Data points for current portfolio value
          borderColor: SERIES.gold, // Gold, the primary accent
          backgroundColor: SERIES.goldFill,
          fill: true, // Fill the area under the line
          tension: 0.3,
          pointRadius: 2,
        },
      ],
    };
  }, [watchlist, latestPrices, t, locale]); // Recompute when the data or the language changes

  // Define chart options for responsiveness and plugins
  const chartOptions = {
    responsive: true, // Make the chart responsive
    plugins: {
      legend: {
        position: "top" as const, // Position the legend at the top
        rtl: dir === "rtl",
      },
      tooltip: { rtl: dir === "rtl" },
      title: {
        display: true, // Display the chart title
        text: t("chart_over_time"),
      },
    },
  };

  if (!chartData) return null; // Return nothing if chartData is null

  // Return the Line chart wrapped in a styled container
  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      {" "}
      {/* Container with max-width and centered margin */}
      <Line data={chartData} options={chartOptions} />{" "}
      {/* Render the Line chart with the prepared data and options */}
    </div>
  );
};

export default PortfolioPerformanceChart; // Export the component as default
