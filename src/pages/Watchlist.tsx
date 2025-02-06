import { useState, useEffect, useMemo } from "react"; // Import React hooks
import axios from "axios"; // Import axios for HTTP requests
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import { RootState } from "../store"; // Import RootState for type definitions
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import StockDistributionPieChart from "../components/charts/StockDistributionPieChart"; // Import StockDistributionPieChart component
import PortfolioPerformanceChart from "../components/charts/PortfolioPerformanceChart"; // Import PortfolioPerformanceChart component

// Define the Watchlist functional component
const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<any[]>([]); // State for storing the watchlist data
  const [total, setTotal] = useState<number>(0); // State for storing the total portfolio value
  const [editingItemId, setEditingItemId] = useState<number | null>(null); // State to track which item is being edited
  const [editingItemData, setEditingItemData] = useState<any>({}); // State to store the current editing data
  const [sortBy, setSortBy] = useState<string>("added_at"); // State for sort field (default is added_at)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // State for sort order (default is ascending)
  const [expandedSymbols, setExpandedSymbols] = useState<{
    [key: string]: boolean;
  }>({}); // State to track expanded groups by stock symbol
  const [latestPrices, setLatestPrices] = useState<{
    [symbol: string]: number;
  }>({}); // State for storing the latest prices for each stock
  const user = useSelector((state: RootState) => state.auth.user); // Get current user from Redux state
  const accessToken = useSelector((state: RootState) => state.auth.accessToken); // Get access token from Redux state
  const navigate = useNavigate(); // Initialize navigate for redirection

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
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }, // Include access token in headers
          }
        );
        setWatchlist(response.data.watchlist); // Update watchlist state with fetched data
        setTotal(response.data.total); // Update total state with fetched total portfolio value
      } catch (err: any) {
        console.error(
          "Error fetching watchlist:",
          err.response?.data || err.message // Log error details if fetching fails
        );
      }
    };
    fetchWatchlist(); // Call the fetch function
  }, [user, navigate, accessToken]); // Dependency array: refetch if user, navigate, or accessToken changes

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
            const response = await axios.get(
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

  // Handler function to start editing a watchlist item
  const handleEdit = (item: any) => {
    setEditingItemId(item.id); // Set the id of the item being edited
    setEditingItemData({
      quantity: item.quantity, // Set current quantity
      price_at_time: item.price_at_time, // Set current price
      added_at: item.added_at, // Set current added date/time
    });
  };

  // Handler to update editing data when input values change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // Destructure name and value from the input event
    setEditingItemData((prev: any) => ({ ...prev, [name]: value })); // Update editing data state
  };

  // Handler to save the edited watchlist item
  const handleSaveEdit = async (id: number) => {
    try {
      // Make a PUT request to update the watchlist item
      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}/watchlist/${id}`,
        editingItemData, // Send the updated data
        {
          headers: { Authorization: `Bearer ${accessToken}` }, // Include access token in headers
        }
      );
      // Update the local watchlist state with the edited data
      const updatedWatchlist = watchlist.map((item) =>
        item.id === id ? { ...item, ...editingItemData } : item
      );
      setWatchlist(updatedWatchlist); // Update watchlist state
      // Recalculate total portfolio value
      const newTotal = updatedWatchlist.reduce((sum, item) => {
        return sum + parseFloat(item.price_at_time) * Number(item.quantity);
      }, 0);
      setTotal(newTotal); // Update total state
      setEditingItemId(null); // Clear editing item id
      setEditingItemData({}); // Clear editing data state
      alert("Watchlist item updated"); // Alert success message
    } catch (err: any) {
      console.error(
        "Error updating watchlist item:",
        err.response?.data || err.message // Log error if update fails
      );
    }
  };

  // Handler to cancel the editing process
  const handleCancelEdit = () => {
    setEditingItemId(null); // Clear editing item id
    setEditingItemData({}); // Clear editing data state
  };

  // Handler to remove an item from the watchlist
  const handleRemoveFromWatchlist = async (id: number) => {
    try {
      // Make a DELETE request to remove the item
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_API_URL}/watchlist/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }, // Include access token in headers
        }
      );
      // Update local watchlist state by filtering out the removed item
      const updatedWatchlist = watchlist.filter((item) => item.id !== id);
      setWatchlist(updatedWatchlist); // Update state
      // Recalculate total portfolio value after removal
      const newTotal = updatedWatchlist.reduce((sum, item) => {
        return sum + parseFloat(item.price_at_time) * Number(item.quantity);
      }, 0);
      setTotal(newTotal); // Update total state
      alert("Watchlist item removed"); // Alert success message
    } catch (err: any) {
      console.error(
        "Error removing watchlist item:",
        err.response?.data || err.message // Log error if removal fails
      );
    }
  };

  // Return the Watchlist UI
  return (
    <div style={{ padding: "1rem" }}>
      {" "}
      {/* Container with inline padding */}
      <h4>Total Portfolio Value: ${total.toFixed(2)}</h4>{" "}
      {/* Display total portfolio value */}
      <StockDistributionPieChart watchlist={watchlist} />{" "}
      {/* Render pie chart component */}
      <PortfolioPerformanceChart
        watchlist={watchlist} // Pass watchlist data to the performance chart
        latestPrices={latestPrices} // Pass latest prices to the performance chart
      />
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
        {groupedStocks.map(({ symbol, items }) => {
          // Map over each grouped stock
          if (items.length === 1) {
            // If only one item in group, render it directly
            const stock = items[0];
            // Define an inline handler for removing this stock from the watchlist
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
                }`} // Add editing class if this row is being edited
              >
                <div className="ticker">{stock.stock_symbol}</div>{" "}
                {/* Display stock symbol */}
                <div className="price">
                  {editingItemId === stock.id ? ( // If editing, render an input field
                    <input
                      type="number"
                      name="price_at_time"
                      value={editingItemData.price_at_time}
                      onChange={handleEditChange}
                      step="0.01"
                      required
                    />
                  ) : (
                    `$${parseFloat(stock.price_at_time).toFixed(2)}` // Otherwise, display formatted price
                  )}
                </div>
                <div className="quantity">
                  {editingItemId === stock.id ? ( // If editing, render an input field
                    <input
                      type="number"
                      name="quantity"
                      value={editingItemData.quantity}
                      onChange={handleEditChange}
                      min="1"
                      required
                    />
                  ) : (
                    stock.quantity // Otherwise, display quantity
                  )}
                </div>
                <div className="added">
                  {editingItemId === stock.id ? ( // If editing, render an input field for date/time
                    <input
                      type="datetime-local"
                      name="added_at"
                      value={new Date(editingItemData.added_at)
                        .toISOString()
                        .slice(0, 16)}
                      onChange={handleEditChange}
                    />
                  ) : (
                    new Date(stock.added_at).toLocaleString() // Otherwise, display formatted date/time
                  )}
                </div>
                <div className="actions">
                  {editingItemId === stock.id ? ( // If editing, show Save and Cancel buttons
                    <>
                      <button onClick={() => handleSaveEdit(stock.id)}>
                        Save
                      </button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </>
                  ) : (
                    // Otherwise, show Edit and Remove buttons
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
            // For groups with multiple stocks, show a group header that can be expanded/collapsed
            return (
              <div key={symbol} className="watchlist-group">
                <div
                  className="group-header"
                  onClick={() => toggleGroup(symbol)} // Toggle group expansion on click
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#f0f0f0",
                    padding: "0.5rem",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  <span>{symbol}</span>{" "}
                  {/* Display the stock symbol for the group */}
                  <span style={{ float: "right" }}>
                    {expandedSymbols[symbol] ? "▲" : "▼"}{" "}
                    {/* Display arrow based on expansion state */}
                  </span>
                </div>
                {expandedSymbols[symbol] &&
                  items.map(
                    (
                      stock // If expanded, map over each stock in the group
                    ) => (
                      <div
                        key={stock.id}
                        className={`watchlist-row ${
                          editingItemId === stock.id ? "editing" : ""
                        }`}
                        style={{ paddingLeft: "1rem" }} // Indent rows in the expanded group
                      >
                        <div className="ticker">{stock.stock_symbol}</div>{" "}
                        {/* Display stock symbol */}
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
                    )
                  )}
              </div>
            );
          }
        })}
      </div>
      <button onClick={() => navigate("/manual-add")}>
        Add Stock Manually
      </button>{" "}
      {/* Button to navigate to the manual add stock page */}
    </div>
  );
};

export default Watchlist; // Export component as default
