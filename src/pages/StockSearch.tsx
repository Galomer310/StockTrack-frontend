// frontend/src/pages/StockSearch.tsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import { RootState } from "../store";

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
  Filler,
} from "chart.js";
import { SERIES } from "../charts/chartTheme";

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

const API = import.meta.env.VITE_BACKEND_API_URL;

// Time ranges, expressed as a number of days for the backend's ?days= param.
const rangeOptions = [
  { value: "5d", label: "Last 5 Days", days: 5 },
  { value: "30d", label: "Last 30 Days", days: 30 },
  { value: "3m", label: "Last 3 Months", days: 90 },
  { value: "6m", label: "Last 6 Months", days: 180 },
  { value: "1y", label: "Last Year", days: 365 },
  { value: "2y", label: "Last 2 Years", days: 730 },
];

// Shapes returned by our backend, which normalises Alpha Vantage's awkward
// numbered-and-spaced keys into plain fields.
interface Quote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  price: number;
  volume: number;
  previous_close: number;
  change: number;
  change_percent: number;
  latest_trading_day: string;
}

interface Overview {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  sector: string;
  industry: string;
  market_cap: number;
  pe_ratio: number;
  week52_high: number;
  week52_low: number;
}

interface Article {
  title: string;
  url: string;
  published: string;
  source: string;
  summary: string;
  sentiment: string;
}

interface Bar {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

const StockSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [news, setNews] = useState<Article[]>([]);
  const [bars, setBars] = useState<Bar[]>([]);
  const [marketNote, setMarketNote] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Remaining requests in today's Alpha Vantage budget, read from the
  // X-Quota-Remaining header the backend sets on every market data response.
  const [quotaLeft, setQuotaLeft] = useState<number | null>(null);

  const [searchDisabled, setSearchDisabled] = useState(false);
  const [searchCountdown, setSearchCountdown] = useState(12);

  const [selectedRange, setSelectedRange] = useState("30d");
  const [showChart, setShowChart] = useState(false);
  const [barsLoading, setBarsLoading] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);

  // Record the quota figure the backend reports alongside each response.
  const readQuota = (headers: any) => {
    const remaining = headers?.["x-quota-remaining"];
    if (remaining !== undefined) setQuotaLeft(Number(remaining));
  };

  // Turn an axios failure into something a person can act on. 429 is the
  // interesting case: it means today's 25 requests are gone.
  const describeError = (err: any, fallback: string) => {
    if (err.response?.status === 429) {
      return err.response.data?.error || "Daily market data limit reached.";
    }
    if (err.response?.status === 404) {
      return err.response.data?.error || "Ticker not found.";
    }
    return fallback;
  };

  // Market status is derived from the clock on the server, so polling it is
  // free and does not eat into the request budget.
  useEffect(() => {
    const checkMarket = async () => {
      try {
        const res = await axiosInstance.get(`${API}/stocks/market-status`);
        setMarketNote(
          res.data.is_open
            ? null
            : `🚫 Market closed (${res.data.reason}). Prices reflect the last close.`
        );
      } catch {
        /* non-critical banner */
      }
    };
    checkMarket();
    const interval = setInterval(checkMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  // Search cooldown
  useEffect(() => {
    let timer: number;
    if (searchDisabled) {
      timer = window.setInterval(() => {
        setSearchCountdown((prev) => {
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

  // Historical bars are fetched lazily. Each fetch costs a request, so it
  // happens only once the chart is actually opened, or the range changes
  // while it is open.
  useEffect(() => {
    if (!showChart || !quote) return;
    const option = rangeOptions.find((r) => r.value === selectedRange);
    if (!option) return;

    const loadBars = async () => {
      setBarsLoading(true);
      try {
        const res = await axiosInstance.get(
          `${API}/stocks/${quote.symbol}/aggregates`,
          { params: { days: option.days } }
        );
        readQuota(res.headers);
        setBars(res.data.bars || []);
        setNotice(res.headers?.["x-cache"] === "STALE" ? "Chart data is from an earlier fetch." : "");
      } catch (err: any) {
        setBars([]);
        setError(describeError(err, "Could not load historical prices."));
      } finally {
        setBarsLoading(false);
      }
    };
    loadBars();
  }, [showChart, selectedRange, quote]);

  // A search costs 3 requests: quote, company overview, news.
  const searchStock = async () => {
    const symbol = query.trim().toUpperCase();
    if (!symbol || searchDisabled) return;

    setSearchDisabled(true);
    setSearchCountdown(12);
    setLoading(true);
    setError("");
    setNotice("");
    setBars([]);
    setShowChart(false);

    try {
      const quoteRes = await axiosInstance.get(`${API}/stocks/${symbol}/quote`);
      readQuota(quoteRes.headers);
      setQuote(quoteRes.data);
      if (quoteRes.headers?.["x-cache"] === "STALE") {
        setNotice("Showing the last known price; today's request budget is used up.");
      }
    } catch (err: any) {
      setQuote(null);
      setOverview(null);
      setNews([]);
      setError(describeError(err, "Stock not found or provider error."));
      setLoading(false);
      return;
    }

    // Company details and news are secondary: a failure here should not wipe
    // out the quote we just paid for.
    try {
      const res = await axiosInstance.get(`${API}/stocks/${symbol}/details`);
      readQuota(res.headers);
      setOverview(res.data);
    } catch {
      setOverview(null);
    }

    try {
      const res = await axiosInstance.get(`${API}/stocks/${symbol}/news`);
      readQuota(res.headers);
      setNews(res.data.articles || []);
    } catch {
      setNews([]);
    }

    setLoading(false);
  };

  const addToWatchlist = async () => {
    if (!user || !quote) {
      setError("You must be logged in to add to watchlist");
      return;
    }
    try {
      await axiosInstance.post(`${API}/watchlist`, {
        stock_symbol: quote.symbol,
        quantity,
      });
      alert(`${quote.symbol} added to watchlist with quantity ${quantity}`);
    } catch (err: any) {
      setError(describeError(err, "Failed to add to watchlist"));
    }
  };

  const chartData = {
    labels: bars.map((b) => new Date(b.t).toLocaleDateString()),
    datasets: [
      {
        label: `${quote?.symbol ?? ""} Closing Price`,
        data: bars.map((b) => b.c),
        borderColor: SERIES.gold,
        backgroundColor: SERIES.goldFill,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `${quote?.symbol ?? ""} Closing Prices` },
    },
  };

  const compact = (n: number) =>
    n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T`
    : n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B`
    : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M`
    : `$${n.toLocaleString()}`;

  return (
    <div className="stock-search">
      <h2>Search Stocks</h2>
      <p>Quote, company profile, news and price history. Data by Alpha Vantage.</p>
      <p>Example tickers: AAPL, TSLA, MSFT, AMZN, GOOGL</p>

      {/* The free plan allows 25 requests a day, so it is worth showing. */}
      {quotaLeft !== null && (
        <p className={quotaLeft <= 5 ? "quota-warning" : "quota-note"}>
          {quotaLeft} of today's market data requests remaining
          {quotaLeft <= 5 && " — resets at midnight UTC"}
        </p>
      )}

      <input
        type="text"
        placeholder="Enter stock symbol"
        value={query}
        onChange={(e) => setQuery(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && searchStock()}
      />
      <button onClick={searchStock} disabled={searchDisabled || loading}>
        {loading
          ? "Searching…"
          : searchDisabled
          ? `Search disabled (${searchCountdown})`
          : "Search"}
      </button>

      {marketNote && <p className="market-status">{marketNote}</p>}
      {notice && <p className="market-status">{notice}</p>}
      {error && <p className="error">{error}</p>}

      {/* Quote */}
      {quote && (
        <div className="stock-info">
          <h3>
            {quote.symbol} — ${quote.price.toFixed(2)}{" "}
            <span className={quote.change >= 0 ? "gain" : "loss"}>
              {quote.change >= 0 ? "+" : ""}
              {quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
            </span>
          </h3>
          <button onClick={addToWatchlist} disabled={!user}>
            Add to Watchlist
          </button>
          <input
            type="number"
            min="1"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
      )}

      {/* Quote detail */}
      {quote && (
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-label">Open</span>
            <span className="summary-value">${quote.open.toFixed(2)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Day range</span>
            <span className="summary-value">
              ${quote.low.toFixed(2)}–${quote.high.toFixed(2)}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Prev close</span>
            <span className="summary-value">${quote.previous_close.toFixed(2)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Volume</span>
            <span className="summary-value">{quote.volume.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Company profile */}
      {overview && overview.name && (
        <div className="company-details">
          <h4>About {overview.name}</h4>
          {overview.description && <p>{overview.description}</p>}
          {overview.sector && (
            <p>
              <strong>Sector:</strong> {overview.sector}
            </p>
          )}
          {overview.industry && (
            <p>
              <strong>Industry:</strong> {overview.industry}
            </p>
          )}
          {overview.exchange && (
            <p>
              <strong>Exchange:</strong> {overview.exchange}
            </p>
          )}
          {overview.market_cap > 0 && (
            <p>
              <strong>Market cap:</strong> {compact(overview.market_cap)}
            </p>
          )}
          {overview.pe_ratio > 0 && (
            <p>
              <strong>P/E ratio:</strong> {overview.pe_ratio.toFixed(2)}
            </p>
          )}
          {overview.week52_high > 0 && (
            <p>
              <strong>52-week range:</strong> ${overview.week52_low.toFixed(2)}–$
              {overview.week52_high.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Price history, loaded on demand so it only spends a request when asked */}
      {quote && (
        <div className="aggregated-data">
          <button onClick={() => setShowChart(!showChart)}>
            {showChart ? "Hide Price History" : "Show Price History"}
          </button>

          {showChart && (
            <>
              <div className="range-selection">
                <label htmlFor="range-select">Time range</label>
                <select
                  id="range-select"
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  disabled={barsLoading}
                >
                  {rangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {barsLoading && <span>Loading…</span>}
              </div>

              {bars.length > 0 && (
                <>
                  <div className="chart-container">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Open</th>
                          <th>High</th>
                          <th>Low</th>
                          <th>Close</th>
                          <th>Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bars.map((bar) => (
                          <tr key={bar.t}>
                            <td>{new Date(bar.t).toLocaleDateString()}</td>
                            <td>{bar.o.toFixed(2)}</td>
                            <td>{bar.h.toFixed(2)}</td>
                            <td>{bar.l.toFixed(2)}</td>
                            <td>{bar.c.toFixed(2)}</td>
                            <td>{bar.v.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {!barsLoading && bars.length === 0 && <p>No price history available.</p>}
            </>
          )}
        </div>
      )}

      {/* News */}
      {news.length > 0 && (
        <div className="company-news">
          <h4>Latest News</h4>
          <ul>
            {news.map((article, i) => (
              <li key={article.url || i}>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
                <p>
                  {article.source}
                  {article.published &&
                    ` · ${new Date(article.published).toLocaleString()}`}
                  {article.sentiment && ` · ${article.sentiment}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
