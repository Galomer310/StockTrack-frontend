import React, { useState, useEffect, useMemo } from "react"; // Import React and necessary hooks
import axios from "axios"; // Import axios for HTTP requests
import PortfolioPerformance from "../components/performance/PortfolioPerformance"; // Import the PortfolioPerformance component
import { WatchlistItem } from "../components/performance/PortfolioPerformance"; // Import WatchlistItem type
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import { RootState } from "../store"; // Import RootState for type definitions

// Define the PortfolioPerformancePage functional component
const PortfolioPerformancePage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]); // State for the watchlist data
  const [latestPrices, setLatestPrices] = useState<{
    [symbol: string]: number;
  }>({}); // State for latest prices per stock
  const [expandedSymbols, setExpandedSymbols] = useState<{
    [symbol: string]: boolean;
  }>({}); // State for expanded symbol groups (if needed)
  const user = useSelector((state: RootState) => state.auth.user); // Get the current user from Redux state
  const accessToken = useSelector((state: RootState) => state.auth.accessToken); // Get the access token from Redux state

  // useEffect hook to fetch the watchlist when the user is available
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        // Make a GET request to fetch the watchlist for the user
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }, // Include access token in headers
          }
        );
        setWatchlist(response.data.watchlist); // Update watchlist state with fetched data
      } catch (error) {
        console.error("Error fetching watchlist:", error); // Log error if fetching fails
      }
    };
    if (user) {
      // Only fetch if user exists
      fetchWatchlist();
    }
  }, [user, accessToken]); // Dependency array: refetch if user or accessToken changes

  // useEffect hook to fetch latest prices for all unique stock symbols in the watchlist
  useEffect(() => {
    const fetchLatestPrices = async () => {
      const uniqueSymbols = Array.from(
        new Set(watchlist.map((item) => item.stock_symbol)) // Extract unique symbols from the watchlist
      );
      const prices: { [symbol: string]: number } = {}; // Initialize an object to hold prices
      await Promise.all(
        uniqueSymbols.map(async (symbol) => {
          // For each unique symbol
          try {
            // Make a GET request to fetch the latest price for the symbol
            const response = await axios.get(
              `${import.meta.env.VITE_BACKEND_API_URL}/stocks/${symbol}`
            );
            // Store the parsed latest price in the prices object
            prices[symbol] = parseFloat(response.data.last_price);
          } catch (error) {
            console.error(`Error fetching latest price for ${symbol}`, error); // Log error if fetching fails
          }
        })
      );
      setLatestPrices(prices); // Update the latestPrices state with fetched prices
    };
    if (watchlist.length > 0) {
      // Only fetch if the watchlist is not empty
      fetchLatestPrices();
    }
  }, [watchlist]); // Dependency array: refetch if watchlist changes

  // useMemo hook to calculate total invested amount based on the watchlist
  const totalInvested = useMemo(() => {
    return watchlist.reduce((sum, item) => {
      return sum + parseFloat(item.price_at_time) * item.quantity; // Sum the invested amount for each item
    }, 0);
  }, [watchlist]); // Recalculate if watchlist changes

  // useMemo hook to calculate current portfolio value
  const totalCurrentValue = useMemo(() => {
    return watchlist.reduce((sum, item) => {
      const purchasePrice = parseFloat(item.price_at_time); // Convert purchase price to number
      const latestPrice = latestPrices[item.stock_symbol] || 0; // Get latest price if available
      const profitLoss = (latestPrice - purchasePrice) * item.quantity; // Calculate profit or loss
      return sum + purchasePrice * item.quantity + profitLoss; // Add to cumulative total
    }, 0);
  }, [watchlist, latestPrices]); // Recalculate if watchlist or latestPrices change

  // useMemo hook to calculate total gain (only profit, ignoring losses)
  const totalGain = useMemo(() => {
    return watchlist.reduce((gain, item) => {
      const purchasePrice = parseFloat(item.price_at_time); // Convert purchase price to number
      const latestPrice = latestPrices[item.stock_symbol] || 0; // Get latest price if available
      const profitLoss = (latestPrice - purchasePrice) * item.quantity; // Calculate profit or loss
      return profitLoss > 0 ? gain + profitLoss : gain; // Only add positive profit
    }, 0);
  }, [watchlist, latestPrices]); // Recalculate if watchlist or latestPrices change

  // useMemo hook to calculate total lost (only losses, as a positive number)
  const totalLost = useMemo(() => {
    return watchlist.reduce((loss, item) => {
      const purchasePrice = parseFloat(item.price_at_time); // Convert purchase price to number
      const latestPrice = latestPrices[item.stock_symbol] || 0; // Get latest price if available
      const profitLoss = (latestPrice - purchasePrice) * item.quantity; // Calculate profit or loss
      return profitLoss < 0 ? loss + profitLoss : loss; // Only add negative values (losses)
    }, 0);
  }, [watchlist, latestPrices]); // Recalculate if watchlist or latestPrices change

  // useMemo hook to group watchlist items by stock symbol
  const groupedStocks = useMemo(() => {
    const groups: { [symbol: string]: WatchlistItem[] } = {}; // Initialize groups object
    const groupOrder: string[] = []; // Array to preserve group order
    watchlist.forEach((item) => {
      // Loop over each watchlist item
      if (!groups[item.stock_symbol]) {
        // If group for the symbol doesn't exist
        groups[item.stock_symbol] = []; // Create a new array for that symbol
        groupOrder.push(item.stock_symbol); // Add the symbol to the order array
      }
      groups[item.stock_symbol].push(item); // Add the item to its group
    });
    // Return an array of objects with symbol and corresponding items, preserving order
    return groupOrder.map((symbol) => ({
      symbol,
      items: groups[symbol],
    }));
  }, [watchlist]); // Recalculate if watchlist changes

  // Function to toggle the expanded state for a given symbol group
  const toggleGroup = (symbol: string) => {
    setExpandedSymbols((prev) => ({
      ...prev,
      [symbol]: !prev[symbol], // Toggle the current expanded state for the symbol
    }));
  };

  // Return the performance page UI
  return (
    <div className="portfolio-performance-page" style={{ padding: "1rem" }}>
      {" "}
      {/* Container with inline padding */}
      <h2>Total financial contribution: ${totalInvested.toFixed(2)}</h2>{" "}
      {/* Display total invested */}
      <h2>Current Portfolio Value: ${totalCurrentValue.toFixed(2)}</h2>{" "}
      {/* Display current portfolio value */}
      <h2>
        Total Gain: <span id="h2Gain">${totalGain.toFixed(2)}</span>
      </h2>{" "}
      {/* Display total gain */}
      <h2>
        Total Lost:<span id="h2Lost">${Math.abs(totalLost).toFixed(2)}</span>{" "}
      </h2>{" "}
      <p>Click On: Ticker / Quantity / Profit/Loss </p>
      {/* Display total lost (absolute value) */}
      {/* Render the PortfolioPerformance component passing the watchlist */}
      <PortfolioPerformance watchlist={watchlist} />
    </div>
  );
};

export default PortfolioPerformancePage; // Export component as default
