import { useState, useEffect, useMemo } from "react"; // Import React hooks
import axiosInstance from "../api/axiosInstance";
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import { RootState } from "../store"; // Import RootState for type definitions
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate for navigation
import StockDistributionPieChart from "../components/charts/StockDistributionPieChart"; // Import StockDistributionPieChart component
import PortfolioPerformanceChart from "../components/charts/PortfolioPerformanceChart"; // Import PortfolioPerformanceChart component
import { useToast } from "../components/ui/ToastProvider";
import TradeNoteModal, { TradeSubmission } from "../components/trades/TradeNoteModal";
import { MyPortfolio } from "../api/portfolios";
import { money } from "../api/social";
import PortfolioPerformance from "../components/performance/PortfolioPerformance";

interface Props {
  /** The portfolio being shown. Its cash is what limits what can be bought. */
  portfolio: MyPortfolio;
  /** Tells the dashboard a trade moved the cash, so the switcher re-reads it */
  onTraded?: () => void;
}

// Define the Watchlist functional component
const Watchlist = ({ portfolio, onTraded }: Props) => {
  const [watchlist, setWatchlist] = useState<any[]>([]); // State for storing the watchlist data
  const [total, setTotal] = useState<number>(0); // State for storing the total portfolio value
  // Cash left in this portfolio. Seeded from the portfolio the dashboard
  // passed in, then kept current from each trade's response, so the figure on
  // screen is the server's rather than one guessed at locally.
  const [cash, setCash] = useState<number>(portfolio.cash);
  const [sortBy, setSortBy] = useState<string>("added_at"); // State for sort field (default is added_at)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // State for sort order (default is ascending)
  const [expandedSymbols, setExpandedSymbols] = useState<{
    [key: string]: boolean;
  }>({}); // State to track expanded groups by stock symbol
  const [reloadKey, setReloadKey] = useState(0); // bumped after a sale to refetch
  const [latestPrices, setLatestPrices] = useState<{
    [symbol: string]: number;
  }>({}); // State for storing the latest prices for each stock
  const user = useSelector((state: RootState) => state.auth.user); // Get current user from Redux state
  const accessToken = useSelector((state: RootState) => state.auth.accessToken); // Get access token from Redux state
  const navigate = useNavigate(); // Initialize navigate for redirection
  const toast = useToast();

  // Mirrors REMOVAL_WINDOW_MS on the server. A buy can be taken back for 60
  // seconds; after that it is part of the public record and the only way out
  // is a sale. There is no edit: a recorded trade cannot be rewritten, so the
  // actions on a position are buy and sell. Checked here purely so the buttons
  // reflect reality - the server is what actually enforces it.
  //
  // Measured from recorded_at - when the buy was written down - and not from
  // added_at, which is the trade's own date and may be backdated. Falls back
  // to added_at only for rows with no journal entry behind them.
  const REMOVAL_WINDOW_MS = 60 * 1000;
  const isRemovable = (stock: any) =>
    Date.now() - new Date(stock.recorded_at || stock.added_at).getTime() <
    REMOVAL_WINDOW_MS;

  // The window is short enough that a row rendered as removable goes stale
  // while the user is looking at it, so re-render on a timer and let the
  // button disappear on its own rather than failing on click.
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(tick);
  }, []);
  // The holding currently being sold, if the note window is open
  const [selling, setSelling] = useState<any | null>(null);

  // useEffect hook to fetch the watchlist when the component mounts or when user changes
  useEffect(() => {
    if (!user) {
      // If user is not logged in
      navigate("/login"); // Redirect to login page
      return;
    }
    // Async function to fetch watchlist data
    const fetchWatchlist = async () => {
      try {
        // Make a GET request to fetch the watchlist
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }, // Include access token in headers
          }
        );
        setWatchlist(response.data.watchlist); // Update watchlist state with fetched data
        setTotal(response.data.total); // Update total state with fetched total portfolio value
        if (typeof response.data.cash === "number") setCash(response.data.cash);
      } catch (err: any) {
        console.error(
          "Error fetching watchlist:",
          err.response?.data || err.message // Log error details if fetching fails
        );
      }
    };
    fetchWatchlist(); // Call the fetch function
  }, [user, navigate, accessToken, reloadKey]); // Dependency array: refetch if user, navigate, or accessToken changes

  // useEffect hook to fetch the latest prices for each unique stock symbol in the watchlist
  useEffect(() => {
    const fetchLatestPrices = async () => {
      const symbols = Array.from(
        new Set(watchlist.map((item) => item.stock_symbol)) // Extract unique stock symbols
      );
      const prices: { [symbol: string]: number } = {}; // Initialize object for prices
      await Promise.all(
        symbols.map(async (symbol) => {
          // For each symbol, fetch its latest price
          try {
            const response = await axiosInstance.get(
              `${import.meta.env.VITE_BACKEND_API_URL}/stocks/${symbol}`
            );
            prices[symbol] = parseFloat(response.data.last_price); // Parse and store the price
          } catch (error) {
            console.error(`Error fetching latest price for ${symbol}`, error); // Log error if fetching fails
          }
        })
      );
      setLatestPrices(prices); // Update state with fetched prices
    };
    if (watchlist.length > 0) {
      // Only fetch if watchlist is not empty
      fetchLatestPrices();
    }
  }, [watchlist]); // Dependency array: refetch if watchlist changes

  // useMemo hook to sort the watchlist based on the selected field and order
  const sortedWatchlist = useMemo(() => {
    const items = [...watchlist]; // Create a shallow copy of watchlist
    items.sort((a, b) => {
      let compare = 0; // Initialize comparison value
      if (sortBy === "stock_symbol") {
        // If sorting by stock symbol
        compare = a.stock_symbol.localeCompare(b.stock_symbol); // Compare alphabetically
      } else if (sortBy === "price") {
        // If sorting by price
        compare = parseFloat(a.price_at_time) - parseFloat(b.price_at_time); // Compare numerically
      } else if (sortBy === "quantity") {
        // If sorting by quantity
        compare = a.quantity - b.quantity; // Compare numerically
      } else if (sortBy === "added_at") {
        // If sorting by date added
        compare =
          new Date(a.added_at).getTime() - new Date(b.added_at).getTime(); // Compare date values
      }
      return sortOrder === "asc" ? compare : -compare; // Return based on sort order
    });
    return items; // Return the sorted items
  }, [watchlist, sortBy, sortOrder]); // Dependency array: refetch if any dependency changes

  // useMemo hook to group sorted watchlist items by their stock symbol
  const groupedStocks = useMemo(() => {
    const groups: { [symbol: string]: any[] } = {}; // Initialize groups object
    const groupOrder: string[] = []; // Array to maintain order of groups
    sortedWatchlist.forEach((stock) => {
      if (!groups[stock.stock_symbol]) {
        // If group for the symbol doesn't exist
        groups[stock.stock_symbol] = []; // Create a new array for that symbol
        groupOrder.push(stock.stock_symbol); // Add the symbol to the order array
      }
      groups[stock.stock_symbol].push(stock); // Add the stock to its group
    });
    // Return an array of objects with symbol and corresponding items, preserving order
    return groupOrder.map((symbol) => ({
      symbol,
      items: groups[symbol],
    }));
  }, [sortedWatchlist]); // Dependency array: recalculate if sortedWatchlist changes

  // Handler to change the sort field and toggle sort order if the same field is clicked
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle sort order
    } else {
      setSortBy(field); // Set new sort field
      setSortOrder("asc"); // Reset sort order to ascending
    }
  };

  // Function to toggle the expanded state of a grouped stock symbol
  const toggleGroup = (symbol: string) => {
    setExpandedSymbols((prev) => ({
      ...prev,
      [symbol]: !prev[symbol], // Toggle the expanded state for the given symbol
    }));
  };

  // There is no edit handler. A trade, once recorded, is part of the public
  // record: the only ways to change a position are to buy more or to sell,
  // both of which are logged with their date, time and reasoning.

  // Selling opens the note window; the backend records the trade and its
  // thesis in one transaction, then we refresh from the server rather than
  // guessing at the new quantity locally.
  const handleSell = async ({ note, quantity, price }: TradeSubmission) => {
    if (!selling) return;
    const res = await axiosInstance.post(
      `${import.meta.env.VITE_BACKEND_API_URL}/watchlist/${selling.id}/sell`,
      { quantity, price, note }
    );
    const symbol = selling.stock_symbol;
    setSelling(null);
    setReloadKey((k) => k + 1);
    if (typeof res.data?.cash_remaining === "number") setCash(res.data.cash_remaining);
    onTraded?.(); // the sale moved the cash; let the switcher re-read it
    toast.success(
      `Sold ${quantity} ${symbol} at $${price.toFixed(2)}. ${money(
        res.data?.proceeds ?? quantity * price
      )} back in cash.`,
      "Sale recorded"
    );
  };

  // Takes back a buy made in the last 60 seconds, deleting the trade and its
  // feed post along with the holding. After that the server refuses and the
  // position can only be closed by selling.
  const handleRemoveFromWatchlist = async (id: number) => {
    try {
      // Make a DELETE request to remove the item
      const res = await axiosInstance.delete(
        `${import.meta.env.VITE_BACKEND_API_URL}/watchlist/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }, // Include access token in headers
        }
      );
      if (typeof res.data?.cash_remaining === "number") setCash(res.data.cash_remaining);
      onTraded?.(); // the refund moved the cash back
      // Update local watchlist state by filtering out the removed item
      const updatedWatchlist = watchlist.filter((item) => item.id !== id);
      setWatchlist(updatedWatchlist); // Update state
      // Recalculate total portfolio value after removal
      const newTotal = updatedWatchlist.reduce((sum, item) => {
        return sum + parseFloat(item.price_at_time) * Number(item.quantity);
      }, 0);
      setTotal(newTotal); // Update total state
      toast.success(
        `The purchase has been taken back, and ${money(res.data?.refund ?? 0)} returned to cash.`,
        "Buy undone"
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || "Could not undo this purchase.",
        err.response?.data?.code === "REMOVAL_WINDOW_CLOSED" ? "Record is locked" : undefined
      );
    }
  };

  // Performance of the open positions: what they cost, what they are worth
  // now, and the two sides of the difference kept apart - a book that is up
  // 300 on one name and down 250 on another is a different story from one
  // quietly up 50.
  const { positionsValue, unrealisedGain, unrealisedLoss } = useMemo(() => {
    let value = 0;
    let gain = 0;
    let loss = 0;
    for (const item of watchlist) {
      const paid = parseFloat(item.price_at_time);
      const qty = Number(item.quantity);
      // No cached quote yet: value it at cost, which scores it flat rather
      // than counting the position as worthless.
      const latest = latestPrices[item.stock_symbol] ?? paid;
      const move = (latest - paid) * qty;
      value += latest * qty;
      if (move >= 0) gain += move;
      else loss += move;
    }
    return { positionsValue: value, unrealisedGain: gain, unrealisedLoss: Math.abs(loss) };
  }, [watchlist, latestPrices]);

  // One holding. Single positions and the rows inside an expanded group are
  // the same thing and now render through the same function, so the two can
  // no longer drift apart.
  //
  // These are your own numbers, so the price you paid is shown in full - it is
  // only other people's prices that stay private.
  const renderRow = (stock: any, indented = false) => (
    <div
      key={stock.id}
      className="watchlist-row"
      style={indented ? { paddingLeft: "1rem" } : undefined}
    >
      <div className="ticker">
        <Link className="ticker-link" to={`/stock/${stock.stock_symbol}`}>
          {stock.stock_symbol}
        </Link>
      </div>
      <div className="price">${parseFloat(stock.price_at_time).toFixed(2)}</div>
      <div className="quantity">{stock.quantity}</div>
      {/* Date AND time of the purchase, which is what the log and the feed
          show everyone else too. */}
      <div className="added">{new Date(stock.added_at).toLocaleString()}</div>
      <div className="actions">
        <button onClick={() => setSelling(stock)}>Sell…</button>
        {isRemovable(stock) ? (
          <button
            className="undo-btn"
            onClick={() => handleRemoveFromWatchlist(stock.id)}
            title="Bought this by mistake? You have 60 seconds to take it back."
          >
            Undo buy
          </button>
        ) : null}
      </div>
    </div>
  );

  // Return the Watchlist UI
  return (
    <div style={{ padding: "1rem" }}>
      {selling && (
        <TradeNoteModal
          open
          mode="sell"
          symbol={selling.stock_symbol}
          maxQuantity={Number(selling.quantity)}
          defaultQuantity={Number(selling.quantity)}
          defaultPrice={
            latestPrices[selling.stock_symbol] ||
            parseFloat(selling.price_at_time)
          }
          onClose={() => setSelling(null)}
          onSubmit={handleSell}
        />
      )}
      {/* What this book is made of: what was deployed, what is left, and what
          it all adds up to against the balance it opened with. */}
      <div className="cash-bar">
        <div className="cash-figure">
          <span className="summary-label">Invested</span>
          <span className="summary-value">{money(total)}</span>
        </div>
        <div className="cash-figure">
          <span className="summary-label">Cash available</span>
          <span className="summary-value">{money(cash)}</span>
        </div>
        <div className="cash-figure">
          <span className="summary-label">Opened with</span>
          <span className="summary-value">{money(portfolio.starting_balance)}</span>
        </div>
        {/* How much of the book is still uninvested, drawn as a bar. */}
        <div className="cash-meter" title={`${money(cash)} of ${money(total + cash)} uninvested`}>
          <span
            className="cash-meter-fill"
            style={{
              width: `${total + cash > 0 ? Math.min((total / (total + cash)) * 100, 100) : 0}%`,
            }}
          />
        </div>
      </div>{" "}
      {/* The whole book: positions at today's prices, plus the cash left. */}
      <StockDistributionPieChart
        watchlist={watchlist}
        cash={cash}
        latestPrices={latestPrices}
      />{" "}
      <PortfolioPerformanceChart
        watchlist={watchlist} // Pass watchlist data to the performance chart
        latestPrices={latestPrices} // Pass latest prices to the performance chart
      />
      {/* Performance, directly beneath the over-time chart. This used to be its
          own tab in the header; it lives here now because it is about the book
          you have open, and it reads the same watchlist and prices this
          component already holds rather than fetching them again. */}
      {watchlist.length > 0 && (
        <section className="dashboard-performance">
          <h3>{portfolio.name} · performance</h3>

          <div className="summary-cards">
            <div className="summary-card">
              <span className="summary-label">Cost of holdings</span>
              <span className="summary-value">{money(total)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Worth today</span>
              <span className="summary-value">{money(positionsValue)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Unrealised gain</span>
              <span className="summary-value gain">{money(unrealisedGain)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Unrealised loss</span>
              <span className="summary-value loss">{money(unrealisedLoss)}</span>
            </div>
          </div>

          <p className="compare-note">
            Sort by ticker, quantity or profit and loss.
          </p>
          <PortfolioPerformance watchlist={watchlist} latestPrices={latestPrices} />
        </section>
      )}
      <div className="watchlist">
        {" "}
        {/* Container for watchlist table */}
        <div className="watchlist-header">
          {" "}
          {/* Header row for the watchlist table */}
          <div className="ticker" onClick={() => handleSort("stock_symbol")}>
            Ticker{" "}
            {sortBy === "stock_symbol" && (sortOrder === "asc" ? "↑" : "↓")}{" "}
            {/* Show sort arrow */}
          </div>
          <div className="price" onClick={() => handleSort("price")}>
            Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}{" "}
            {/* Show sort arrow */}
          </div>
          <div className="quantity" onClick={() => handleSort("quantity")}>
            Qty {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}{" "}
            {/* Show sort arrow */}
          </div>
          <div className="added" onClick={() => handleSort("added_at")}>
            Added {sortBy === "added_at" && (sortOrder === "asc" ? "↑" : "↓")}{" "}
            {/* Show sort arrow */}
          </div>
          <div className="actions">Actions</div>{" "}
          {/* Column header for actions */}
        </div>
        {groupedStocks.map(({ symbol, items }) =>
          // A single position renders as a row; several purchases of the same
          // ticker collapse behind a header that expands into the same rows.
          items.length === 1 ? (
            renderRow(items[0])
          ) : (
            <div key={symbol} className="watchlist-group">
              <div
                className="group-header"
                onClick={() => toggleGroup(symbol)} // Toggle group expansion on click
              >
                <span>{symbol}</span>{" "}
                {/* Display the stock symbol for the group */}
                <span style={{ float: "right" }}>
                  {expandedSymbols[symbol] ? "▲" : "▼"}{" "}
                  {/* Display arrow based on expansion state */}
                </span>
              </div>
              {expandedSymbols[symbol] &&
                items.map((stock) => renderRow(stock, true))}
            </div>
          )
        )}
      </div>
      {/* No "Add Stock Manually" button here.
          A position on this dashboard is meant to be opened by buying at a
          real quoted price, which is what makes a weight on the leaderboard
          comparable between two people. Typing in your own entry price from
          the dashboard undercut that, so the shortcut is gone from the book
          itself. The manual entry screen still exists on its own route for
          backfilling a holding that predates the account. */}
    </div>
  );
};

export default Watchlist; // Export component as default
