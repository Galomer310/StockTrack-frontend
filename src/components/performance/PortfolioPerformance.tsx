import React, { useState, useEffect, useMemo } from "react"; // Import React and necessary hooks
import axios from "axios"; // Import axios for HTTP requests
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // Import Chart.js components

// Register Chart.js components (if using a pie chart, for example)
ChartJS.register(ArcElement, Tooltip, Legend); // Register ArcElement, Tooltip, and Legend

// Define TypeScript interface for a watchlist item
export interface WatchlistItem {
  id: number; // Unique identifier
  stock_symbol: string; // Stock symbol
  price_at_time: string; // Price at time of purchase (as a string)
  quantity: number; // Number of shares purchased
  added_at: string; // Date/time when the stock was added
  industry?: string; // Optional industry information
  latestPrice?: number; // Optional latest price (if available)
}

// Define the props interface for the component
interface PortfolioPerformanceProps {
  watchlist: WatchlistItem[]; // Array of watchlist items
}

// Define the functional component using the props interface
const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({
  watchlist, // Destructure watchlist from props
}) => {
  // State for storing the latest prices from the backend
  const [latestPrices, setLatestPrices] = useState<{
    [symbol: string]: number;
  }>({});

  // State for sorting: field to sort by and sort order (ascending/descending)
  const [sortBy, setSortBy] = useState<string>("stock_symbol"); // Default sort by stock_symbol
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default sort order is ascending

  // useEffect hook to fetch the latest prices for each unique stock symbol
  useEffect(() => {
    const uniqueSymbols = Array.from(
      new Set(watchlist.map((item) => item.stock_symbol)) // Extract unique stock symbols from the watchlist
    );
    // Async function to fetch the latest prices for each symbol
    const fetchLatestPrices = async () => {
      const prices: { [symbol: string]: number } = {}; // Initialize an object to hold prices
      await Promise.all(
        uniqueSymbols.map(async (symbol) => {
          // For each unique symbol
          try {
            // Make a GET request to fetch the latest price for the symbol
            const response = await axios.get(
              `${import.meta.env.VITE_BACKEND_API_URL}/stocks/${symbol}`
            );
            // Parse and store the latest price
            prices[symbol] = parseFloat(response.data.last_price);
          } catch (err) {
            // Log error if fetching fails
            console.error(`Error fetching latest price for ${symbol}`, err);
          }
        })
      );
      // Update the latestPrices state with the fetched prices
      setLatestPrices(prices);
    };
    if (uniqueSymbols.length > 0) {
      // If there are symbols to fetch
      fetchLatestPrices(); // Call the fetch function
    }
  }, [watchlist]); // Re-run if the watchlist changes

  // useMemo hook to compute sorted data with computed profit/loss values
  const sortedData = useMemo(() => {
    // Map each watchlist item to include computed purchasePrice, latestPrice, and profitLoss
    const items = watchlist.map((item) => {
      const purchasePrice = parseFloat(item.price_at_time); // Convert purchase price to number
      const latestPrice = latestPrices[item.stock_symbol] || 0; // Use latest price if available, otherwise 0
      const profitLoss = (latestPrice - purchasePrice) * Number(item.quantity); // Compute profit or loss
      return { ...item, purchasePrice, latestPrice, profitLoss }; // Return the augmented item
    });
    // Sort the items based on the selected field and order
    items.sort((a, b) => {
      let compare = 0; // Initialize comparison result
      if (sortBy === "stock_symbol") {
        // If sorting by stock symbol
        compare = a.stock_symbol.localeCompare(b.stock_symbol); // Compare alphabetically
      } else if (sortBy === "quantity") {
        // If sorting by quantity
        compare = Number(a.quantity) - Number(b.quantity); // Compare numerically
      } else if (sortBy === "profitLoss") {
        // If sorting by profit/loss
        compare = a.profitLoss - b.profitLoss; // Compare numerically
      }
      // Return the result based on the sort order (ascending/descending)
      return sortOrder === "asc" ? compare : -compare;
    });
    return items; // Return the sorted array
  }, [watchlist, latestPrices, sortBy, sortOrder]); // Recompute if any dependency changes

  // Handler to change the sort field and toggle the sort order if the same field is clicked twice
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle sort order if already sorting by this field
    } else {
      setSortBy(field); // Set new sort field
      setSortOrder("asc"); // Reset sort order to ascending
    }
  };

  // Return the portfolio performance table
  return (
    <div className="portfolio-performance">
      {" "}
      {/* Container with CSS class */}
      <h3>Portfolio Performance</h3> {/* Section title */}
      <table>
        {" "}
        {/* Start of table */}
        <thead>
          <tr>
            <th onClick={() => handleSort("stock_symbol")}>
              Ticker{" "}
              {sortBy === "stock_symbol" && (sortOrder === "asc" ? "↑" : "↓")}{" "}
              {/* Show sort arrow */}
            </th>
            <th>Purchase Price</th> {/* Table header for purchase price */}
            <th>Latest Price</th> {/* Table header for latest price */}
            <th onClick={() => handleSort("quantity")}>
              Quantity{" "}
              {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}{" "}
              {/* Show sort arrow */}
            </th>
            <th onClick={() => handleSort("profitLoss")}>
              Profit / Loss{" "}
              {sortBy === "profitLoss" && (sortOrder === "asc" ? "↑" : "↓")}{" "}
              {/* Show sort arrow */}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map(
            (
              item // Map over each sorted item to create a table row
            ) => (
              <tr key={item.id}>
                {" "}
                {/* Unique key per row */}
                <td>{item.stock_symbol}</td> {/* Stock symbol cell */}
                <td>${item.purchasePrice.toFixed(2)}</td>{" "}
                {/* Formatted purchase price */}
                <td>${item.latestPrice.toFixed(2)}</td>{" "}
                {/* Formatted latest price */}
                <td>{item.quantity}</td> {/* Quantity cell */}
                <td style={{ color: item.profitLoss >= 0 ? "green" : "red" }}>
                  ${item.profitLoss.toFixed(2)}{" "}
                  {/* Profit or loss value, colored green if positive and red if negative */}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioPerformance; // Export the component as default
