import { useEffect, useState } from "react"; // Import useEffect and useState hooks
import axiosInstance from "../api/axiosInstance";
import { useParams } from "react-router-dom"; // Import useParams to access route parameters
import { Line } from "react-chartjs-2"; // Import Line chart component from react-chartjs-2
import "chart.js/auto"; // Import auto-registration for Chart.js components
import { SERIES } from "../charts/chartTheme";

// Market data is proxied through our backend, which holds the Alpha Vantage key.
const API = import.meta.env.VITE_BACKEND_API_URL;

const StockDetails = () => {
  const { ticker } = useParams(); // Destructure the ticker parameter from the URL
  const [companyInfo, setCompanyInfo] = useState<any>(null); // Company profile
  const [chartData, setChartData] = useState<any>(null); // Prepared chart data
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStockDetails = async () => {
      setError("");
      try {
        // Company fundamentals
        const companyRes = await axiosInstance.get(`${API}/stocks/${ticker}/details`);
        setCompanyInfo(companyRes.data);

        // Last 30 days of daily bars, already in { t, o, h, l, c, v } form
        const chartRes = await axiosInstance.get(
          `${API}/stocks/${ticker}/aggregates`,
          { params: { days: 30 } }
        );
        const bars = chartRes.data.bars || [];
        setChartData({
          labels: bars.map((bar: any) => new Date(bar.t).toLocaleDateString()),
          datasets: [
            {
              label: `${ticker} Stock Price`,
              data: bars.map((bar: any) => bar.c),
              borderColor: SERIES.gold,
              backgroundColor: SERIES.goldFill,
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              pointRadius: 0,
            },
          ],
        });
      } catch (err: any) {
        // 429 means today's Alpha Vantage budget is spent
        setError(
          err.response?.status === 429
            ? err.response.data?.error || "Daily market data limit reached."
            : "Could not load stock details."
        );
      }
    };
    fetchStockDetails();
  }, [ticker]);

  return (
    <div className="investor-page">
      {error && <p className="error">{error}</p>}
      {companyInfo && (
        <div>
          <h1>
            {companyInfo.name} ({companyInfo.symbol})
          </h1>
          {companyInfo.sector && <p className="investor-since">{companyInfo.sector}</p>}
          {companyInfo.description && <p>{companyInfo.description}</p>}
        </div>
      )}
      {chartData && (
        <div className="chart-container">
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
};

export default StockDetails; // Export component as default
