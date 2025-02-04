import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

const StockDetails = () => {
  const { ticker } = useParams();
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        const companyRes = await axios.get(
          `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`
        );
        setCompanyInfo(companyRes.data.results);

        const chartRes = await axios.get(
          `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/2024-01-01/2024-02-01?adjusted=true&apiKey=${POLYGON_API_KEY}`
        );

        setChartData({
          labels: chartRes.data.results.map((entry: any) =>
            new Date(entry.t).toLocaleDateString()
          ),
          datasets: [
            {
              label: `${ticker} Stock Price`,
              data: chartRes.data.results.map((entry: any) => entry.c),
              borderColor: "red",
              borderWidth: 2,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching stock details:", error);
      }
    };

    fetchStockDetails();
  }, [ticker]);

  return (
    <div>
      {companyInfo && (
        <div>
          <img
            src={`${companyInfo.branding?.logo_url}?format=png`}
            alt="Company Logo"
            width="100"
          />
          <h1>
            {companyInfo.name} ({ticker})
          </h1>
        </div>
      )}

      {chartData && <Line data={chartData} />}
    </div>
  );
};

export default StockDetails;
