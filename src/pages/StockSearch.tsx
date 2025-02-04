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
  // New state for additional company details (from the /company endpoint)
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  // Optionally, add state for company news
  const [news, setNews] = useState<any[]>([]);
  const [marketStatus, setMarketStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

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

  const searchStock = async () => {
    try {
      setError("");
      // Fetch basic stock data (previous close)
      const stockRes = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${query}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      if (stockRes.data.results && stockRes.data.results.length > 0) {
        setStockData(stockRes.data.results[0]);
      } else {
        setError("No stock data available.");
        setStockData(null);
      }
      // Fetch basic company info (from reference tickers endpoint)
      const companyRes = await axios.get(
        `https://api.polygon.io/v3/reference/tickers/${query}?apiKey=${POLYGON_API_KEY}`
      );
      setCompanyInfo(companyRes.data.results);

      // NEW: Fetch additional company details using the /company endpoint
      const companyDetailsRes = await axios.get(
        `https://api.polygon.io/v1/meta/symbols/${query}/company?apiKey=${POLYGON_API_KEY}`
      );
      setCompanyDetails(companyDetailsRes.data);

      // OPTIONAL: Fetch latest news articles about the company
      const newsRes = await axios.get(
        `https://api.polygon.io/v2/reference/news?ticker=${query}&apiKey=${POLYGON_API_KEY}`
      );
      setNews(newsRes.data.results);
    } catch (err) {
      setError("Stock not found or API error.");
      setStockData(null);
      setCompanyInfo(null);
      setCompanyDetails(null);
      setNews([]);
    }
  };

  // Add stock to watchlist (including quantity)
  const addToWatchlist = async () => {
    if (!user) {
      setError("You must be logged in to add to watchlist");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/watchlist",
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

      {/* Display basic company info */}
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

      {/* NEW: Display additional company details */}
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

      {/* Display basic stock data */}
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
            placeholder="choose quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
      )}

      {/* OPTIONAL: Display recent news articles */}
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
