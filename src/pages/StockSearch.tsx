// frontend/src/components/StockSearch.tsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";

// Import Chart.js and react-chartjs-2 components
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
  Filler, // Import Filler plugin
} from "chart.js";

// Register Chart.js components including Filler
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

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

// Define the available time range options.
const rangeOptions = [
  {
    value: "5d",
    label: "Last 5 Days",
    days: 5,
    multiplier: 1,
    timespan: "day",
  },
  {
    value: "30d",
    label: "Last 30 Days",
    days: 30,
    multiplier: 1,
    timespan: "day",
  },
  {
    value: "3m",
    label: "Last 3 Months",
    days: 90,
    multiplier: 1,
    timespan: "week",
  },
  {
    value: "6m",
    label: "Last 6 Months",
    days: 180,
    multiplier: 1,
    timespan: "week",
  },
  {
    value: "1y",
    label: "Last Year",
    days: 365,
    multiplier: 1,
    timespan: "month",
  },
  {
    value: "2y",
    label: "Last 2 Years",
    days: 730,
    multiplier: 1,
    timespan: "month",
  },
  {
    value: "5y",
    label: "Last 5 Years",
    days: 1825,
    multiplier: 1,
    timespan: "year",
  },
  {
    value: "10y",
    label: "Last 10 Years",
    days: 3650,
    multiplier: 1,
    timespan: "year",
  },
];

const StockSearch: React.FC = () => {
  // Basic states for stock, company, news, and aggregated data
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [stockData, setStockData] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [marketStatus, setMarketStatus] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Timestamp state for market status caching
  const [lastMarketStatusFetched, setLastMarketStatusFetched] =
    useState<number>(0);

  // --- Search Button Disable Feature (for overall search) ---
  const [searchDisabled, setSearchDisabled] = useState(false);
  const [searchCountdown, setSearchCountdown] = useState(30);
  // -------------------------------------------------------------

  // --- New States for Range Selection Cooldown Feature ---
  const [selectedRange, setSelectedRange] = useState("30d");
  const [rangeDisabled, setRangeDisabled] = useState(false);
  const [rangeCountdown, setRangeCountdown] = useState(30);
  // ---------------------------------------------------------

  const [showAggregatedData, setShowAggregatedData] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Inline styling for the table
  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    fontFamily: "Arial, sans-serif",
  };

  const thStyle: React.CSSProperties = {
    borderBottom: "2px solid #009879",
    backgroundColor: "#009879",
    color: "#ffffff",
    textAlign: "left",
    padding: "12px",
  };

  const tdStyle: React.CSSProperties = {
    borderBottom: "1px solid #dddddd",
    textAlign: "left",
    padding: "12px",
  };

  // useEffect to check market status with caching
  useEffect(() => {
    const checkMarketStatus = async () => {
      const now = Date.now();
      if (now - lastMarketStatusFetched < 60000 && marketStatus !== null) {
        return;
      }
      try {
        const res = await axiosInstance.get(
          `https://api.polygon.io/v1/marketstatus/now?apiKey=${POLYGON_API_KEY}`
        );
        if (res.data.market === "closed") {
          setMarketStatus(
            "🚫 The market is closed, stock prices won’t update in real time."
          );
        } else {
          setMarketStatus(null);
        }
        setLastMarketStatusFetched(now);
      } catch (err) {
        console.error("Error checking market status", err);
      }
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, [lastMarketStatusFetched, marketStatus]);

  // useEffect for search button cooldown (30s)
  useEffect(() => {
    let timer: number;
    if (searchDisabled) {
      timer = window.setInterval(() => {
        setSearchCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setSearchDisabled(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [searchDisabled]);

  // useEffect for range selection cooldown (30s)
  useEffect(() => {
    let timer: number;
    if (rangeDisabled) {
      timer = window.setInterval(() => {
        setRangeCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setRangeDisabled(false);
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [rangeDisabled]);

  // Function to handle range selection change
  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Only process change if range selection is not disabled
    if (!rangeDisabled) {
      setSelectedRange(e.target.value);
      // Disable the dropdown for 20 seconds after a change
      setRangeDisabled(true);
      setRangeCountdown(20);
    }
  };

  // Function to fetch aggregated data based on the selected range and current query
  const fetchAggregatedData = async () => {
    if (!query) return;
    try {
      const rangeOption = rangeOptions.find((r) => r.value === selectedRange);
      if (!rangeOption) return;
      const { days, multiplier, timespan } = rangeOption;
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - days);
      const fromDate = pastDate.toISOString().split("T")[0];
      const toDate = today.toISOString().split("T")[0];

      const aggRes = await axiosInstance.get(
        `https://api.polygon.io/v2/aggs/ticker/${query}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      if (aggRes.data.results && aggRes.data.results.length > 0) {
        setAggregatedData(aggRes.data.results);
      } else {
        setAggregatedData([]);
      }
    } catch (err) {
      console.error("Error fetching aggregated data", err);
      setAggregatedData([]);
    }
  };

  // Refetch aggregated data when the selected range changes (if a query is present)
  useEffect(() => {
    if (query) {
      fetchAggregatedData();
    }
  }, [selectedRange]);

  // Function to search for a stock and fetch its various data
  const searchStock = async () => {
    // Disable search button for 30 seconds when search is initiated
    if (searchDisabled) return;
    setSearchDisabled(true);
    setSearchCountdown(30);

    try {
      setError("");

      // 1. Fetch previous close aggregated data (basic stock info)
      const stockRes = await axiosInstance.get(
        `https://api.polygon.io/v2/aggs/ticker/${query}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      if (stockRes.data.results && stockRes.data.results.length > 0) {
        setStockData(stockRes.data.results[0]);
      } else {
        setError("No stock data available.");
        setStockData(null);
      }

      // 2. Fetch basic company info
      const companyRes = await axiosInstance.get(
        `https://api.polygon.io/v3/reference/tickers/${query}?apiKey=${POLYGON_API_KEY}`
      );
      setCompanyInfo(companyRes.data.results);

      // 3. Fetch additional company details
      const companyDetailsRes = await axiosInstance.get(
        `https://api.polygon.io/v1/meta/symbols/${query}/company?apiKey=${POLYGON_API_KEY}`
      );
      setCompanyDetails(companyDetailsRes.data);

      // 4. Fetch latest news articles
      const newsRes = await axiosInstance.get(
        `https://api.polygon.io/v2/reference/news?ticker=${query}&apiKey=${POLYGON_API_KEY}`
      );
      setNews(newsRes.data.results);

      // 5. Fetch aggregated historical data for the selected range
      await fetchAggregatedData();
    } catch (err) {
      setError("Stock not found or API error.");
      setStockData(null);
      setCompanyInfo(null);
      setCompanyDetails(null);
      setNews([]);
      setAggregatedData([]);
    }
  };

  // Function to add the searched stock to the watchlist
  const addToWatchlist = async () => {
    if (!user) {
      setError("You must be logged in to add to watchlist");
      return;
    }
    try {
      await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
        { stock_symbol: query, quantity },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert(`${query} added to watchlist with quantity ${quantity}`);
    } catch (err) {
      setError("Failed to add to watchlist");
    }
  };

  // Prepare the chart data from the aggregated data
  const chartData = {
    labels: aggregatedData.map((item) => new Date(item.t).toLocaleDateString()),
    datasets: [
      {
        label: `${query} Closing Price`,
        data: aggregatedData.map((item) => item.c),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `${query} Closing Prices` },
    },
  };

  return (
    <div className="stock-search">
      <h2>Search Stocks</h2>
      <p>Get stock data, company info, news, and historical prices.</p>
      <p>Search for a stock symbol to get started.</p>
      <p>Example: AAPL, TSLA, MSFT, AMZN, GOOGL</p>
      <p>Market data provided by Polygon.io</p>

      <input
        type="text"
        placeholder="Enter stock symbol"
        value={query}
        onChange={(e) => setQuery(e.target.value.toUpperCase())}
      />
      {/* Disable the search button for 30s after click and show countdown */}
      <button onClick={searchStock} disabled={searchDisabled}>
        {searchDisabled ? `Search disabled (${searchCountdown})` : "Search"}
      </button>
      {marketStatus && <p className="market-status">{marketStatus}</p>}
      {error && <p className="error">{error}</p>}

      {/* Company Info */}
      {companyInfo && (
        <div className="company-info">
          <h3>{companyInfo.name}</h3>
          <p>Industry: {companyInfo.sic_description}</p>
        </div>
      )}

      {/* Company Details */}
      {companyDetails && (
        <div className="company-details">
          <h4>About {companyDetails.name}</h4>
          {companyDetails.description && <p>{companyDetails.description}</p>}
          {companyDetails.ceo && (
            <p>
              <strong>CEO:</strong> {companyDetails.ceo}
            </p>
          )}
          {companyDetails.industry && (
            <p>
              <strong>Industry:</strong> {companyDetails.industry}
            </p>
          )}
          {companyDetails.employees && (
            <p>
              <strong>Employees:</strong> {companyDetails.employees}
            </p>
          )}
          <p>
            <strong>Volume:</strong> {stockData.v}
          </p>
        </div>
      )}

      {/* Basic Stock Info */}
      {stockData && (
        <div className="stock-info">
          <h3>
            {query} - Closing Price: ${stockData.c}
          </h3>
          <button onClick={addToWatchlist} disabled={!user}>
            Add to Watchlist
          </button>
          <input
            type="number"
            min="1"
            placeholder="Choose quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
      )}

      {/* Range Selection Dropdown with cooldown */}
      {aggregatedData && aggregatedData.length > 0 && (
        <div className="range-selection" style={{ marginTop: "20px" }}>
          <label htmlFor="range-select">Select Time Range: </label>
          <select
            id="range-select"
            value={selectedRange}
            onChange={handleRangeChange}
            disabled={rangeDisabled} // Disable dropdown when cooldown is active
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {rangeDisabled && (
            <span style={{ marginLeft: "10px", color: "gray" }}>
              (Change disabled for {rangeCountdown} s)
            </span>
          )}
        </div>
      )}

      {/* Aggregated Data Section with Dropdown Toggle */}
      {aggregatedData && aggregatedData.length > 0 && (
        <div className="aggregated-data">
          <button
            onClick={() => setShowAggregatedData(!showAggregatedData)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#008000b3",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            {showAggregatedData
              ? "Hide Aggregated Data"
              : "Show Aggregated Data"}
          </button>
          {showAggregatedData && (
            <>
              {/* Chart Display */}
              <div className="chart-container" style={{ marginTop: "20px" }}>
                <Line data={chartData} options={chartOptions} />
              </div>
              {/* Aggregated Data Table */}
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Open</th>
                    <th style={thStyle}>High</th>
                    <th style={thStyle}>Low</th>
                    <th style={thStyle}>Close</th>
                    <th style={thStyle}>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedData.map((agg: any) => (
                    <tr key={agg.t}>
                      <td style={tdStyle}>
                        {new Date(agg.t).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>{agg.o}</td>
                      <td style={tdStyle}>{agg.h}</td>
                      <td style={tdStyle}>{agg.l}</td>
                      <td style={tdStyle}>{agg.c}</td>
                      <td style={tdStyle}>{agg.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Latest News */}
      {news.length > 0 && (
        <div className="company-news">
          <h4>Latest News</h4>
          <ul>
            {news.map((article) => (
              <li key={article.id}>
                <a
                  href={article.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.title}
                </a>
                <p>{new Date(article.published_utc).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
