// frontend/src/pages/StockSearch.tsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import StockDetailPanel from "../components/stock/StockDetailPanel";

const API = import.meta.env.VITE_BACKEND_API_URL;

// Search for a ticker, then render the shared detail panel for it. All of the
// quote/profile/chart/news rendering lives in that panel so this page and
// /stock/:ticker can never diverge.
const StockSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [symbol, setSymbol] = useState(""); // the submitted ticker
  const [marketNote, setMarketNote] = useState<string | null>(null);
  const [quotaLeft, setQuotaLeft] = useState<number | null>(null);

  const [searchDisabled, setSearchDisabled] = useState(false);
  const [countdown, setCountdown] = useState(12);

  // Market status is derived from the clock server-side, so polling it does
  // not spend any of the daily request budget.
  useEffect(() => {
    const checkMarket = async () => {
      try {
        const res = await axiosInstance.get(`${API}/stocks/market-status`);
        setMarketNote(
          res.data.is_open
            ? null
            : `Market closed (${res.data.reason}). Prices reflect the last close.`
        );
      } catch {
        /* non-critical banner */
      }
    };
    checkMarket();
    const interval = setInterval(checkMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cooldown between searches, since each one spends several requests.
  useEffect(() => {
    let timer: number;
    if (searchDisabled) {
      timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setSearchDisabled(false);
            return 12;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [searchDisabled]);

  const submit = () => {
    const next = query.trim().toUpperCase();
    if (!next || searchDisabled) return;
    setSymbol(next);
    setSearchDisabled(true);
    setCountdown(12);
  };

  return (
    <div className="stock-search">
      <h2>Search Stocks</h2>
      <p>Quote, company profile, price history and news. Data by Alpha Vantage.</p>
      <p>Example tickers: AAPL, TSLA, MSFT, AMZN, GOOGL</p>

      {quotaLeft !== null && (
        <p className={quotaLeft <= 5 ? "quota-warning" : "quota-note"}>
          {quotaLeft} of today's market data requests remaining
          {quotaLeft <= 5 && " — resets at midnight UTC"}
        </p>
      )}

      <div className="search-row">
        <input
          type="text"
          placeholder="Enter stock symbol"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button onClick={submit} disabled={searchDisabled}>
          {searchDisabled ? `Wait ${countdown}s` : "Search"}
        </button>
      </div>

      {marketNote && <p className="market-status">{marketNote}</p>}

      {symbol ? (
        <StockDetailPanel symbol={symbol} allowAdd onQuota={setQuotaLeft} />
      ) : (
        <p className="stock-empty">Search for a ticker to see its details.</p>
      )}
    </div>
  );
};

export default StockSearch;
