import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import { fetchMyPortfolios, MyPortfolio } from "../../api/portfolios";
import { setActivePortfolio as selectPortfolio } from "../../features/portfolioSlice";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";
import { fill, ltr } from "../../i18n/fill";

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

// Daily bars only. A 1-day range needs intraday bars, which the free Massive
// plan does not include. Re-add { key: "1d", label: "range_1d", days: 1 } here
// (with range_1d in messages.ts) and set MASSIVE_INTRADAY=true on the server
// after upgrading.
export const RANGES: { key: string; label: MessageKey; days: number }[] = [
  { key: "5d", label: "range_5d", days: 5 },
  { key: "1w", label: "range_1w", days: 7 },
  { key: "1m", label: "range_1m", days: 30 },
  { key: "3m", label: "range_3m", days: 90 },
  { key: "6m", label: "range_6m", days: 180 },
  { key: "1y", label: "range_1y", days: 365 },
  { key: "2y", label: "range_2y", days: 730 },
];

// The provider's news sentiment, as the server capitalises it.
const SENTIMENTS: Record<string, MessageKey> = {
  Positive: "sentiment_positive",
  Negative: "sentiment_negative",
  Neutral: "sentiment_neutral",
};

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

// In English the server's own message is the most specific one there is. In
// Hebrew it would be English text in a Hebrew screen, so the message is chosen
// by status instead: market-data refusals carry no error codes.
const describeError = (
  err: any,
  lang: "he" | "en",
  t: (key: MessageKey) => string,
  fallback: MessageKey
) => {
  const server = lang === "en" ? err.response?.data?.error : undefined;
  if (err.response?.status === 429) return server || t("stock_err_limit");
  if (err.response?.status === 404) return server || t("stock_err_no_data");
  return t(fallback);
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
  const [stale, setStale] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [noteOpen, setNoteOpen] = useState(false);

  // The portfolio the buy will land in, and what it can afford. A purchase is
  // paid for out of that book's cash, so the button has to know about it -
  // otherwise the only feedback would be the server's refusal after the user
  // has already written a thesis.
  //
  // The whole list is held, not just the active one: when someone runs three
  // books, "which one am I about to spend from" is the first thing they need to
  // know on this page, and being able to change it here saves a trip back to
  // the dashboard.
  const dispatch = useDispatch();
  const activePortfolioId = useSelector((state: RootState) => state.portfolio.activeId);
  const [portfolios, setPortfolios] = useState<MyPortfolio[]>([]);
  const [activePortfolio, setActivePortfolio] = useState<MyPortfolio | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const toast = useToast();
  const { t, dir, lang, locale } = useLanguage();
  // Inside Hebrew sentences, prices, tickers and names keep their own direction.
  const iso = (value: string) => (lang === "he" ? ltr(value) : value);

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
      setStale(false);
      setQuote(null);
      setOverview(null);
      setNews([]);

      try {
        const res = await axiosInstance.get(`${API}/stocks/${symbol}/quote`);
        if (cancelled) return;
        readQuota(res.headers);
        setQuote(res.data);
        if (res.headers?.["x-cache"] === "STALE") setStale(true);
      } catch (err: any) {
        if (cancelled) return;
        setError(describeError(err, lang, t, "stock_load_failed"));
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
        toast.error(describeError(err, lang, t, "stock_history_failed"));
      } finally {
        if (!cancelled) setBarsLoading(false);
      }
    };

    loadBars();
    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  // Which book is open, and what is left in it. Re-read after each purchase so
  // the affordable quantity reflects the money just spent.
  const [cashRefresh, setCashRefresh] = useState(0);
  useEffect(() => {
    if (!allowAdd || !user) return;
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchMyPortfolios();
        if (cancelled) return;
        setPortfolios(data.portfolios);
        setActivePortfolio(
          data.portfolios.find((p) => p.id === activePortfolioId) ??
            data.portfolios[0] ??
            null
        );
      } catch {
        // A failed lookup only costs the affordability hint; the server still
        // refuses anything the portfolio cannot pay for.
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [allowAdd, user, activePortfolioId, cashRefresh]);

  // Buying opens the note window first: the trade and its thesis are recorded
  // together, so the journal can never contain a trade with no reasoning.
  const recordPurchase = async ({ note }: TradeSubmission) => {
    if (!quote) return;
    const res = await axiosInstance.post(`${API}/watchlist`, {
      stock_symbol: quote.symbol,
      quantity,
      note,
    });
    setNoteOpen(false);
    setCashRefresh((k) => k + 1);
    toast.success(
      fill(t("stock_bought_toast"), {
        symbol: iso(quote.symbol),
        qty: quantity,
        price: iso(money(quote.price)),
        cash: iso(money(res.data?.cash_remaining ?? 0)),
        portfolio: activePortfolio ? iso(activePortfolio.name) : t("stock_this_portfolio"),
      }),
      t("stock_bought_title")
    );
  };

  // What this order costs, and what the portfolio is left with if it goes
  // through. Both are shown before the buy rather than after it: the whole
  // point of a fixed starting balance is knowing what you are giving up.
  const cash = activePortfolio?.cash ?? 0;
  const maxAffordable = quote && quote.price > 0 ? Math.floor(cash / quote.price) : 0;
  const orderCost = quote ? quote.price * quantity : 0;
  const cashAfter = cash - orderCost;
  const tooExpensive = Boolean(quote) && orderCost > cash;

  // Switching book from here, so a purchase can be aimed at the right one
  // without going back to the dashboard first. This is the same selection the
  // dashboard makes, so it persists after the buy.
  const handlePortfolioChange = (id: number) => {
    const next = portfolios.find((p) => p.id === id);
    if (!next) return;
    dispatch(selectPortfolio(id));
    setActivePortfolio(next);
  };

  const positive = bars.length > 1 ? bars[bars.length - 1].c >= bars[0].c : true;
  const lineColor = positive ? SERIES.gold : "#E05561";

  const chartData = {
    labels: bars.map((b) =>
      intraday
        ? new Date(b.t).toLocaleTimeString(locale ?? [], { hour: "2-digit", minute: "2-digit" })
        : new Date(b.t).toLocaleDateString(locale)
    ),
    datasets: [
      {
        label: fill(t("stock_close_series"), { symbol: iso(symbol) }),
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
      tooltip: { rtl: dir === "rtl" },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 8 } },
      y: { ticks: { callback: (v: any) => `$${v}` } },
    },
  };

  if (loading && !quote) {
    return <p className="stock-panel-loading">{fill(t("stock_loading"), { symbol: iso(symbol) })}</p>;
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

      {/* Which book you are about to spend from, before anything else on the
          page. With three portfolios in play, buying into the wrong one is the
          easy mistake to make, and it cannot be edited away afterwards. */}
      {allowAdd && user && activePortfolio && (
        <div className="buying-into">
          <div className="buying-into-which">
            <span className="summary-label">{t("stock_buying_into")}</span>
            {portfolios.length > 1 ? (
              <select
                className="buying-into-select"
                value={activePortfolio.id}
                onChange={(e) => handlePortfolioChange(Number(e.target.value))}
                aria-label={t("stock_portfolio_select_label")}
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {fill(t("stock_portfolio_option"), { name: iso(p.name), cash: iso(money(p.cash)) })}
                  </option>
                ))}
              </select>
            ) : (
              <span className="buying-into-name">{activePortfolio.name}</span>
            )}
          </div>

          <div className="buying-into-cash">
            <span className="summary-label">{t("stock_available")}</span>
            <span className="summary-value">{money(cash)}</span>
          </div>

          {portfolios.length > 1 && (
            <span className="field-hint">
              {fill(t("stock_portfolio_count"), {
                n: portfolios.findIndex((p) => p.id === activePortfolio.id) + 1,
                total: portfolios.length,
              })}
            </span>
          )}
        </div>
      )}

      {stale && <p className="market-status">{t("stock_stale")}</p>}

      {/* Headline */}
      {quote && (
        <div className="stock-headline">
          <div>
            <h2>
              {/* Company names arrive in English; bdi keeps "Apple Inc." from
                  showing as ".Apple Inc" on a Hebrew page. */}
              <bdi>{overview?.name || quote.symbol}</bdi>
              <span className="stock-ticker-chip">{quote.symbol}</span>
            </h2>
            <div className="stock-price-row">
              <span className="stock-price">{money(quote.price)}</span>
              <span className={quote.change >= 0 ? "gain" : "loss"} dir="ltr">
                {quote.change >= 0 ? "▲" : "▼"} {money(Math.abs(quote.change))} (
                {quote.change_percent.toFixed(2)}%)
              </span>
            </div>
            {quote.latest_trading_day && (
              <p className="stock-asof">
                {fill(t("stock_as_of"), { date: iso(quote.latest_trading_day) })}
              </p>
            )}
          </div>

          {allowAdd && user && (
            <div className="stock-add">
              <div className="stock-add-row">
                <label className="stock-qty">
                  <span className="summary-label">{t("stock_shares")}</span>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    aria-label={t("stock_quantity_label")}
                  />
                </label>
                <button
                  className="compare-btn"
                  onClick={() => setNoteOpen(true)}
                  disabled={tooExpensive}
                >
                  {t("stock_buy")}
                </button>
              </div>

              {/* The cost of this order and what would be left afterwards,
                  updating as the quantity changes. The server enforces the
                  limit either way; showing it here means nobody writes a
                  thesis for a trade that was never going to clear. */}
              {activePortfolio && (
                <div className={`order-preview${tooExpensive ? " is-over" : ""}`}>
                  <div className="order-line">
                    <span dir="ltr">
                      {quantity} × {money(quote.price)}
                    </span>
                    <span className="order-figure" dir="ltr">{money(orderCost)}</span>
                  </div>
                  <div className="order-line">
                    <span>{t("stock_cash_after")}</span>
                    <span className={`order-figure ${tooExpensive ? "loss" : ""}`} dir="ltr">
                      {money(cashAfter)}
                    </span>
                  </div>
                  {tooExpensive ? (
                    <p className="order-warning">
                      {fill(t(maxAffordable === 1 ? "stock_short_one" : "stock_short_many"), {
                        name: iso(activePortfolio.name),
                        short: iso(money(orderCost - cash)),
                        n: maxAffordable,
                      })}
                      {maxAffordable > 0 && (
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => setQuantity(maxAffordable)}
                        >
                          {fill(t("stock_buy_n"), { n: maxAffordable })}
                        </button>
                      )}
                    </p>
                  ) : (
                    <p className="field-hint">
                      {fill(t("stock_leaves"), {
                        pct: ((cashAfter / (activePortfolio.equity || 1)) * 100).toFixed(0),
                        name: iso(activePortfolio.name),
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Key figures */}
      {quote && (
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-label">{t("stock_open")}</span>
            <span className="summary-value">{money(quote.open)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">{t("stock_day_range")}</span>
            <span className="summary-value" dir="ltr">
              {money(quote.low)}–{money(quote.high)}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">{t("stock_prev_close")}</span>
            <span className="summary-value">{money(quote.previous_close)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">{t("stock_volume")}</span>
            <span className="summary-value">{quote.volume.toLocaleString(locale)}</span>
          </div>
        </div>
      )}

      {/* Price history */}
      <h3>{t("stock_price_history")}</h3>
      <div className="range-picker">
        {RANGES.map((option) => (
          <button
            key={option.key}
            className={`range-chip${range === option.key ? " is-active" : ""}`}
            onClick={() => setRange(option.key)}
            disabled={barsLoading}
          >
            {t(option.label)}
          </button>
        ))}
        {barsLoading && <span className="range-loading">{t("loading")}</span>}
      </div>

      {bars.length > 0 ? (
        <div className="chart-container chart-tall">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        !barsLoading && <p className="stock-empty">{t("stock_no_history")}</p>
      )}

      {/* Company profile */}
      {overview && overview.name && (
        <>
          <h3>{t("stock_about")}</h3>
          <div className="company-details">
            {overview.description && <p dir="auto">{overview.description}</p>}
            <div className="profile-grid">
              {overview.sector && (
                <div>
                  <span className="summary-label">{t("stock_sector")}</span>
                  <span>{overview.sector}</span>
                </div>
              )}
              {overview.industry && (
                <div>
                  <span className="summary-label">{t("stock_industry")}</span>
                  <span>{overview.industry}</span>
                </div>
              )}
              {overview.exchange && (
                <div>
                  <span className="summary-label">{t("stock_exchange")}</span>
                  <span>{overview.exchange}</span>
                </div>
              )}
              {overview.market_cap > 0 && (
                <div>
                  <span className="summary-label">{t("stock_market_cap")}</span>
                  <span>{compact(overview.market_cap)}</span>
                </div>
              )}
              {overview.pe_ratio > 0 && (
                <div>
                  <span className="summary-label">{t("stock_pe")}</span>
                  <span>{overview.pe_ratio.toFixed(2)}</span>
                </div>
              )}
              {overview.week52_high > 0 && (
                <div>
                  <span className="summary-label">{t("stock_52w")}</span>
                  <span dir="ltr">
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
          <h3>{t("stock_news")}</h3>
          <div className="company-news">
            <ul>
              {news.map((article, i) => (
                <li key={article.url || i}>
                  {/* Headlines arrive in English; dir="auto" keeps them reading correctly in Hebrew. */}
                  <a href={article.url} target="_blank" rel="noopener noreferrer" dir="auto">
                    {article.title}
                  </a>
                  <p>
                    {article.source}
                    {article.published &&
                      ` · ${new Date(article.published).toLocaleString(locale)}`}
                    {article.sentiment && (
                      <span className="news-sentiment">
                        {" "}
                        {SENTIMENTS[article.sentiment] ? t(SENTIMENTS[article.sentiment]) : article.sentiment}
                      </span>
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
