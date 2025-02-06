import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import StockDistributionPieChart from "../components/charts/StockDistributionPieChart";
import PortfolioPerformanceChart from "../components/charts/PortfolioPerformanceChart";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemData, setEditingItemData] = useState<any>({});

  const [sortBy, setSortBy] = useState<string>("added_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // State to track expanded groups (by stock symbol)
  const [expandedSymbols, setExpandedSymbols] = useState<{
    [key: string]: boolean;
  }>({});
  // State to hold latest prices per ticker
  const [latestPrices, setLatestPrices] = useState<{
    [symbol: string]: number;
  }>({});

  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchWatchlist = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setWatchlist(response.data.watchlist);
        setTotal(response.data.total);
      } catch (err: any) {
        console.error(
          "Error fetching watchlist:",
          err.response?.data || err.message
        );
      }
    };
    fetchWatchlist();
  }, [user, navigate, accessToken]);

  // Fetch latest prices for all unique symbols in the watchlist
  useEffect(() => {
    const fetchLatestPrices = async () => {
      const symbols = Array.from(
        new Set(watchlist.map((item) => item.stock_symbol))
      );
      const prices: { [symbol: string]: number } = {};

      await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_BACKEND_API_URL}/stocks/${symbol}`
            );
            prices[symbol] = parseFloat(response.data.last_price);
          } catch (error) {
            console.error(`Error fetching latest price for ${symbol}`, error);
          }
        })
      );

      setLatestPrices(prices);
    };

    if (watchlist.length > 0) {
      fetchLatestPrices();
    }
  }, [watchlist]);

  // Sorting function for the watchlist table
  const sortedWatchlist = useMemo(() => {
    const items = [...watchlist];
    items.sort((a, b) => {
      let compare = 0;
      if (sortBy === "stock_symbol") {
        compare = a.stock_symbol.localeCompare(b.stock_symbol);
      } else if (sortBy === "price") {
        compare = parseFloat(a.price_at_time) - parseFloat(b.price_at_time);
      } else if (sortBy === "quantity") {
        compare = a.quantity - b.quantity;
      } else if (sortBy === "added_at") {
        compare =
          new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
      }
      return sortOrder === "asc" ? compare : -compare;
    });
    return items;
  }, [watchlist, sortBy, sortOrder]);

  // Group sorted watchlist items by their stock symbol.
  // This preserves the order of their first appearance.
  const groupedStocks = useMemo(() => {
    const groups: { [symbol: string]: any[] } = {};
    const groupOrder: string[] = [];
    sortedWatchlist.forEach((stock) => {
      if (!groups[stock.stock_symbol]) {
        groups[stock.stock_symbol] = [];
        groupOrder.push(stock.stock_symbol);
      }
      groups[stock.stock_symbol].push(stock);
    });
    return groupOrder.map((symbol) => ({
      symbol,
      items: groups[symbol],
    }));
  }, [sortedWatchlist]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Toggle the expanded state of a given stock symbol group
  const toggleGroup = (symbol: string) => {
    setExpandedSymbols((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  // Editing functions (unchanged)
  const handleEdit = (item: any) => {
    setEditingItemId(item.id);
    setEditingItemData({
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      added_at: item.added_at,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingItemData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}/watchlist/${id}`,
        editingItemData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const updatedWatchlist = watchlist.map((item) =>
        item.id === id ? { ...item, ...editingItemData } : item
      );
      setWatchlist(updatedWatchlist);
      const newTotal = updatedWatchlist.reduce((sum, item) => {
        return sum + parseFloat(item.price_at_time) * Number(item.quantity);
      }, 0);
      setTotal(newTotal);
      setEditingItemId(null);
      setEditingItemData({});
      alert("Watchlist item updated");
    } catch (err: any) {
      console.error(
        "Error updating watchlist item:",
        err.response?.data || err.message
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemData({});
  };

  const handleRemoveFromWatchlist = async (id: number) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_URL}/watchlist/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const updatedWatchlist = watchlist.filter((item) => item.id !== id);
      setWatchlist(updatedWatchlist);
      const newTotal = updatedWatchlist.reduce((sum, item) => {
        return sum + parseFloat(item.price_at_time) * Number(item.quantity);
      }, 0);
      setTotal(newTotal);
      alert("Watchlist item removed");
    } catch (err: any) {
      console.error(
        "Error removing watchlist item:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h4>Total Portfolio Value: ${total.toFixed(2)}</h4>
      {/* Render the stock distribution pie chart */}
      <StockDistributionPieChart watchlist={watchlist} />
      {/* Render the performance line chart using our new component */}
      <PortfolioPerformanceChart
        watchlist={watchlist}
        latestPrices={latestPrices}
      />
      {/* Watchlist Table */}
      <div className="watchlist">
        {/* Header Row with sorting controls */}
        <div className="watchlist-header">
          <div className="ticker" onClick={() => handleSort("stock_symbol")}>
            Ticker{" "}
            {sortBy === "stock_symbol" && (sortOrder === "asc" ? "↑" : "↓")}
          </div>
          <div className="price" onClick={() => handleSort("price")}>
            Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
          </div>
          <div className="quantity" onClick={() => handleSort("quantity")}>
            Qty {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
          </div>
          <div className="added" onClick={() => handleSort("added_at")}>
            Added {sortBy === "added_at" && (sortOrder === "asc" ? "↑" : "↓")}
          </div>
          <div className="actions">Actions</div>
        </div>

        {/* Grouped Data Rows */}
        {groupedStocks.map(({ symbol, items }) => {
          // If there's only one item, render it directly
          if (items.length === 1) {
            const stock = items[0];
            const handleRemoveFromWatchlist = async (id: number) => {
              try {
                await axios.delete(
                  `${import.meta.env.VITE_BACKEND_API_URL}/watchlist/${id}`,
                  {
                    headers: { Authorization: `Bearer ${accessToken}` },
                  }
                );
                const updatedWatchlist = watchlist.filter(
                  (item) => item.id !== id
                );
                setWatchlist(updatedWatchlist);
                const newTotal = updatedWatchlist.reduce((sum, item) => {
                  return (
                    sum + parseFloat(item.price_at_time) * Number(item.quantity)
                  );
                }, 0);
                setTotal(newTotal);
                alert("Watchlist item removed");
              } catch (err: any) {
                console.error(
                  "Error removing watchlist item:",
                  err.response?.data || err.message
                );
              }
            };

            return (
              <div
                key={stock.id}
                className={`watchlist-row ${
                  editingItemId === stock.id ? "editing" : ""
                }`}
              >
                <div className="ticker">{stock.stock_symbol}</div>
                <div className="price">
                  {editingItemId === stock.id ? (
                    <input
                      type="number"
                      name="price_at_time"
                      value={editingItemData.price_at_time}
                      onChange={handleEditChange}
                      step="0.01"
                      required
                    />
                  ) : (
                    `$${parseFloat(stock.price_at_time).toFixed(2)}`
                  )}
                </div>
                <div className="quantity">
                  {editingItemId === stock.id ? (
                    <input
                      type="number"
                      name="quantity"
                      value={editingItemData.quantity}
                      onChange={handleEditChange}
                      min="1"
                      required
                    />
                  ) : (
                    stock.quantity
                  )}
                </div>
                <div className="added">
                  {editingItemId === stock.id ? (
                    <input
                      type="datetime-local"
                      name="added_at"
                      value={new Date(editingItemData.added_at)
                        .toISOString()
                        .slice(0, 16)}
                      onChange={handleEditChange}
                    />
                  ) : (
                    new Date(stock.added_at).toLocaleString()
                  )}
                </div>
                <div className="actions">
                  {editingItemId === stock.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(stock.id)}>
                        Save
                      </button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(stock)}>Edit</button>
                      <button
                        onClick={() => handleRemoveFromWatchlist(stock.id)}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          } else {
            // For groups with multiple stocks, show a dropdown header row
            return (
              <div key={symbol} className="watchlist-group">
                <div
                  className="group-header"
                  onClick={() => toggleGroup(symbol)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#f0f0f0",
                    padding: "0.5rem",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  <span>{symbol}</span>
                  <span style={{ float: "right" }}>
                    {expandedSymbols[symbol] ? "▲" : "▼"}
                  </span>
                </div>
                {expandedSymbols[symbol] &&
                  items.map((stock) => (
                    <div
                      key={stock.id}
                      className={`watchlist-row ${
                        editingItemId === stock.id ? "editing" : ""
                      }`}
                      style={{ paddingLeft: "1rem" }}
                    >
                      <div className="ticker">{stock.stock_symbol}</div>
                      <div className="price">
                        {editingItemId === stock.id ? (
                          <input
                            type="number"
                            name="price_at_time"
                            value={editingItemData.price_at_time}
                            onChange={handleEditChange}
                            step="0.01"
                            required
                          />
                        ) : (
                          `$${parseFloat(stock.price_at_time).toFixed(2)}`
                        )}
                      </div>
                      <div className="quantity">
                        {editingItemId === stock.id ? (
                          <input
                            type="number"
                            name="quantity"
                            value={editingItemData.quantity}
                            onChange={handleEditChange}
                            min="1"
                            required
                          />
                        ) : (
                          stock.quantity
                        )}
                      </div>
                      <div className="added">
                        {editingItemId === stock.id ? (
                          <input
                            type="datetime-local"
                            name="added_at"
                            value={new Date(editingItemData.added_at)
                              .toISOString()
                              .slice(0, 16)}
                            onChange={handleEditChange}
                          />
                        ) : (
                          new Date(stock.added_at).toLocaleString()
                        )}
                      </div>
                      <div className="actions">
                        {editingItemId === stock.id ? (
                          <>
                            <button onClick={() => handleSaveEdit(stock.id)}>
                              Save
                            </button>
                            <button onClick={handleCancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(stock)}>
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveFromWatchlist(stock.id)
                              }
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            );
          }
        })}
      </div>
      <button onClick={() => navigate("/manual-add")}>
        Add Stock Manually
      </button>
    </div>
  );
};

export default Watchlist;
