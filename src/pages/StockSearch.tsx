import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

const StockSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [stockData, setStockData] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [marketStatus, setMarketStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showAggregatedData, setShowAggregatedData] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Inline styling objects for the table
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

  // Check market status on mount
  useEffect(() => {
    const checkMarketStatus = async () => {
      try {
        const res = await axios.get(
          `https://api.polygon.io/v1/marketstatus/now?apiKey=${POLYGON_API_KEY}`
        );
        if (res.data.market === "closed") {
          setMarketStatus(
            "🚫 The market is closed, stock prices won’t update in real time."
          );
        } else {
          setMarketStatus(null);
        }
      } catch (err) {
        console.error("Error checking market status", err);
      }
    };
    checkMarketStatus();
  }, []);

  // Function to search for a stock and fetch its data
  const searchStock = async () => {
    try {
      setError("");

      // 1. Fetch previous close aggregated data
      const stockRes = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${query}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      if (stockRes.data.results && stockRes.data.results.length > 0) {
        setStockData(stockRes.data.results[0]);
      } else {
        setError("No stock data available.");
        setStockData(null);
      }

      // 2. Fetch basic company info
      const companyRes = await axios.get(
        `https://api.polygon.io/v3/reference/tickers/${query}?apiKey=${POLYGON_API_KEY}`
      );
      setCompanyInfo(companyRes.data.results);

      // 3. Fetch additional company details
      const companyDetailsRes = await axios.get(
        `https://api.polygon.io/v1/meta/symbols/${query}/company?apiKey=${POLYGON_API_KEY}`
      );
      setCompanyDetails(companyDetailsRes.data);

      // 4. Fetch latest news articles
      const newsRes = await axios.get(
        `https://api.polygon.io/v2/reference/news?ticker=${query}&apiKey=${POLYGON_API_KEY}`
      );
      setNews(newsRes.data.results);

      // 5. Fetch aggregated historical data (last 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const fromDate = thirtyDaysAgo.toISOString().split("T")[0];
      const toDate = today.toISOString().split("T")[0];

      const aggRes = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${query}/range/1/day/${fromDate}/${toDate}?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      if (aggRes.data.results && aggRes.data.results.length > 0) {
        setAggregatedData(aggRes.data.results);
      } else {
        setAggregatedData([]);
      }
    } catch (err) {
      setError("Stock not found or API error.");
      setStockData(null);
      setCompanyInfo(null);
      setCompanyDetails(null);
      setNews([]);
      setAggregatedData([]);
    }
  };

  // Function to add stock to the watchlist
  const addToWatchlist = async () => {
    if (!user) {
      setError("You must be logged in to add to watchlist");
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
        { stock_symbol: query, quantity },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert(`${query} added to watchlist with quantity ${quantity}`);
    } catch (err) {
      setError("Failed to add to watchlist");
    }
  };

  return (
    <div className="stock-search">
      <h2>Search Stocks</h2>
      <input
        type="text"
        placeholder="Enter stock symbol"
        value={query}
        onChange={(e) => setQuery(e.target.value.toUpperCase())}
      />
      <button onClick={searchStock}>Search</button>
      {marketStatus && <p className="market-status">{marketStatus}</p>}
      {error && <p className="error">{error}</p>}

      {/* Company Info */}
      {companyInfo && (
        <div className="company-info">
          {companyInfo.branding?.logo_url && (
            <img
              src={`${companyInfo.branding.logo_url}?format=png`}
              alt={`${companyInfo.name} Logo`}
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
          )}
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
          {companyDetails.website && (
            <p>
              <strong>Website:</strong>{" "}
              <a
                href={companyDetails.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {companyDetails.website}
              </a>
            </p>
          )}
        </div>
      )}

      {/* Basic Stock Info */}
      {stockData && (
        <div className="stock-info">
          <h3>
            {query} - Closing Price: ${stockData.c}
          </h3>
          <p>Volume: {stockData.v}</p>
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

      {/* Aggregated Historical Data Dropdown */}
      {aggregatedData && aggregatedData.length > 0 && (
        <div className="aggregated-data">
          <button
            onClick={() => setShowAggregatedData(!showAggregatedData)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#009879",
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
          )}
        </div>
      )}

      {/* News Articles */}
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

      <button onClick={() => navigate("/")}>Log Out</button>
      <button onClick={() => navigate("/user")}>User Dashboard</button>
    </div>
  );
};

export default StockSearch;
