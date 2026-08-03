import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../../store";
import { SERIES } from "../../charts/chartTheme";
import { useToast } from "../ui/ToastProvider";
import TradeNoteModal, { TradeSubmission } from "../trades/TradeNoteModal";

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

/* ===========================================================================
   One stock, in full: quote, company profile, price history with a range
   picker, and news.
   ---------------------------------------------------------------------------
   Shared by the search page and by clicking a ticker in any portfolio, so the
   two can never drift apart.
   =========================================================================== */

// Daily bars only. A 1-day range would need TIME_SERIES_INTRADAY, which is a
// premium Alpha Vantage endpoint - on the free plan it returns "This is a
// premium endpoint". Re-add { key: "1d", label: "1D", days: 1 } here and set
// ALPHA_VANTAGE_PREMIUM=true on the server after upgrading.
export const RANGES = [
  { key: "5d", label: "5D", days: 5 },
  { key: "1w", label: "1W", days: 7 },
  { key: "1m", label: "1M", days: 30 },
  { key: "3m", label: "3M", days: 90 },
  { key: "6m", label: "6M", days: 180 },
  { key: "1y", label: "1Y", days: 365 },
  { key: "2y", label: "2Y", days: 730 },
];

export interface Quote {
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

interface Props {
  symbol: string;
  /** Show the quantity input and "Add to portfolio" button */
  allowAdd?: boolean;
  /** Called with the remaining daily request budget after each response */
  onQuota?: (remaining: number) => void;
}

const money = (n: number) => `$${n.toFixed(2)}`;

const compact = (n: number) =>
  n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T`
  : n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B`
  : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M`
  : `$${n.toLocaleString()}`;

const describeError = (err: any, fallback: string) => {
  if (err.response?.status === 429) {
    return err.response.data?.error || "Daily market data limit reached.";
  }
  if (err.response?.status === 404) {
    return err.response.data?.error || "No data available for this ticker.";
  }
  return fallback;
};

const StockDetailPanel: React.FC<Props> = ({ symbol, allowAdd = false, onQuota }) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [news, setNews] = useState<Article[]>([]);
  const [bars, setBars] = useState<Bar[]>([]);
  const [intraday, setIntraday] = useState(false);

  const [range, setRange] = useState("1m");
  const [loading, setLoading] = useState(true);
  const [barsLoading, setBarsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [noteOpen, setNoteOpen] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const toast = useToast();

  const readQuota = (headers: any) => {
    const remaining = headers?.["x-quota-remaining"];
    if (remaining !== undefined && onQuota) onQuota(Number(remaining));
  };

  // Quote, profile and news. Profile and news are secondary: if either fails
  // the quote we already paid for still renders.
  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setNotice("");
      setQuote(null);
      setOverview(null);
      setNews([]);

      try {
        const res = await axiosInstance.get(`${API}/stocks/${symbol}/quote`);
        if (cancelled) return;
        readQuota(res.headers);
        setQuote(res.data);
        if (res.headers?.["x-cache"] === "STALE") {
          setNotice("Showing the last known price; today's request budget is used up.");
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(describeError(err, "Could not load this stock."));
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get(`${API}/stocks/${symbol}/details`);
        if (!cancelled) {
          readQuota(res.headers);
          setOverview(res.data);
        }
      } catch {
        /* profile is optional */
      }

      try {
        const res = await axiosInstance.get(`${API}/stocks/${symbol}/news`);
        if (!cancelled) {
          readQuota(res.headers);
          setNews(res.data.articles || []);
        }
      } catch {
        /* news is optional */
      }

      if (!cancelled) setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  // Price history, refetched whenever the range changes. The backend buckets
  // its cache, so returning to a range you already viewed is free.
  useEffect(() => {
    if (!symbol) return;
    const option = RANGES.find((r) => r.key === range);
    if (!option) return;
    let cancelled = false;

    const loadBars = async () => {
      setBarsLoading(true);
      try {
        const res = await axiosInstance.get(`${API}/stocks/${symbol}/aggregates`, {
          params: { days: option.days },
        });
        if (cancelled) return;
        readQuota(res.headers);
        setBars(res.data.bars || []);
        setIntraday(res.data.interval === "5min");
      } catch (err: any) {
        if (cancelled) return;
        setBars([]);
        // Failing to load a chart should not blank the whole panel, so this
        // surfaces as a toast rather than replacing the page with an error.
        toast.error(describeError(err, "Could not load price history."));
      } finally {
        if (!cancelled) setBarsLoading(false);
      }
    };

    loadBars();
    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  // Buying opens the note window first: the trade and its thesis are recorded
  // together, so the journal can never contain a trade with no reasoning.
  const recordPurchase = async ({ note }: TradeSubmission) => {
    if (!quote) return;
    await axiosInstance.post(`${API}/watchlist`, {
      stock_symbol: quote.symbol,
      quantity,
      note,
    });
    setNoteOpen(false);
    toast.success(
      `${quote.symbol} × ${quantity} at ${money(quote.price)} added, with your note.`,
      "Purchase recorded"
    );
  };

  const positive = bars.length > 1 ? bars[bars.length - 1].c >= bars[0].c : true;
  const lineColor = positive ? SERIES.gold : "#E05561";

  const chartData = {
    labels: bars.map((b) =>
      intraday
        ? new Date(b.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : new Date(b.t).toLocaleDateString()
    ),
    datasets: [
      {
        label: `${symbol} close`,
        data: bars.map((b) => b.c),
        borderColor: lineColor,
        backgroundColor: positive ? SERIES.goldFill : "rgba(224, 85, 97, 0.12)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 8 } },
      y: { ticks: { callback: (v: any) => `$${v}` } },
    },
  };

  if (loading && !quote) {
    return <p className="stock-panel-loading">Loading {symbol}…</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="stock-panel">
      {quote && (
        <TradeNoteModal
          open={noteOpen}
          mode="buy"
          symbol={quote.symbol}
          defaultQuantity={quantity}
          defaultPrice={quote.price}
          onClose={() => setNoteOpen(false)}
          onSubmit={recordPurchase}
        />
      )}

      {notice && <p className="market-status">{notice}</p>}

      {/* Headline */}
      {quote && (
        <div className="stock-headline">
          <div>
            <h2>
              {overview?.name || quote.symbol}
              <span className="stock-ticker-chip">{quote.symbol}</span>
            </h2>
            <div className="stock-price-row">
              <span className="stock-price">{money(quote.price)}</span>
              <span className={quote.change >= 0 ? "gain" : "loss"}>
                {quote.change >= 0 ? "▲" : "▼"} {money(Math.abs(quote.change))} (
                {quote.change_percent.toFixed(2)}%)
              </span>
            </div>
            {quote.latest_trading_day && (
              <p className="stock-asof">As of {quote.latest_trading_day}</p>
            )}
          </div>

          {allowAdd && user && (
            <div className="stock-add">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                aria-label="Quantity"
              />
              <button className="compare-btn" onClick={() => setNoteOpen(true)}>
                Buy…
              </button>
            </div>
          )}
        </div>
      )}

      {/* Key figures */}
      {quote && (
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-label">Open</span>
            <span className="summary-value">{money(quote.open)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Day range</span>
            <span className="summary-value">
              {money(quote.low)}–{money(quote.high)}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Prev close</span>
            <span className="summary-value">{money(quote.previous_close)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Volume</span>
            <span className="summary-value">{quote.volume.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Price history */}
      <h3>Price history</h3>
      <div className="range-picker">
        {RANGES.map((option) => (
          <button
            key={option.key}
            className={`range-chip${range === option.key ? " is-active" : ""}`}
            onClick={() => setRange(option.key)}
            disabled={barsLoading}
          >
            {option.label}
          </button>
        ))}
        {barsLoading && <span className="range-loading">Loading…</span>}
      </div>

      {bars.length > 0 ? (
        <div className="chart-container chart-tall">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        !barsLoading && <p className="stock-empty">No price history for this range.</p>
      )}

      {/* Company profile */}
      {overview && overview.name && (
        <>
          <h3>About</h3>
          <div className="company-details">
            {overview.description && <p>{overview.description}</p>}
            <div className="profile-grid">
              {overview.sector && (
                <div>
                  <span className="summary-label">Sector</span>
                  <span>{overview.sector}</span>
                </div>
              )}
              {overview.industry && (
                <div>
                  <span className="summary-label">Industry</span>
                  <span>{overview.industry}</span>
                </div>
              )}
              {overview.exchange && (
                <div>
                  <span className="summary-label">Exchange</span>
                  <span>{overview.exchange}</span>
                </div>
              )}
              {overview.market_cap > 0 && (
                <div>
                  <span className="summary-label">Market cap</span>
                  <span>{compact(overview.market_cap)}</span>
                </div>
              )}
              {overview.pe_ratio > 0 && (
                <div>
                  <span className="summary-label">P/E ratio</span>
                  <span>{overview.pe_ratio.toFixed(2)}</span>
                </div>
              )}
              {overview.week52_high > 0 && (
                <div>
                  <span className="summary-label">52-week range</span>
                  <span>
                    {money(overview.week52_low)}–{money(overview.week52_high)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* News */}
      {news.length > 0 && (
        <>
          <h3>Latest news</h3>
          <div className="company-news">
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
                    {article.sentiment && (
                      <span className="news-sentiment"> {article.sentiment}</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default StockDetailPanel;
