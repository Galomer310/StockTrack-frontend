import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import PortfolioPerformance from "../components/performance/PortfolioPerformance";
import { WatchlistItem } from "../components/performance/PortfolioPerformance";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const PortfolioPerformancePage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [latestPrices, setLatestPrices] = useState<{
    [symbol: string]: number;
  }>({});
  const [expandedSymbols, setExpandedSymbols] = useState<{
    [symbol: string]: boolean;
  }>({});

  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Fetch the watchlist when the user is available
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setWatchlist(response.data.watchlist);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    };

    if (user) {
      fetchWatchlist();
    }
  }, [user, accessToken]);

  // Fetch latest prices for all unique symbols whenever the watchlist changes
  useEffect(() => {
    const fetchLatestPrices = async () => {
      const uniqueSymbols = Array.from(
        new Set(watchlist.map((item) => item.stock_symbol))
      );
      const prices: { [symbol: string]: number } = {};

      await Promise.all(
        uniqueSymbols.map(async (symbol) => {
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

  // Calculate total financial contribution (i.e. total invested)
  const totalInvested = useMemo(() => {
    return watchlist.reduce((sum, item) => {
      return sum + parseFloat(item.price_at_time) * item.quantity;
    }, 0);
  }, [watchlist]);

  // Calculate current portfolio value
  const totalCurrentValue = useMemo(() => {
    return watchlist.reduce((sum, item) => {
      const purchasePrice = parseFloat(item.price_at_time);
      const latestPrice = latestPrices[item.stock_symbol] || 0;
      const profitLoss = (latestPrice - purchasePrice) * item.quantity;
      return sum + purchasePrice * item.quantity + profitLoss;
    }, 0);
  }, [watchlist, latestPrices]);

  // Calculate Total Gain (sum of profits only)
  const totalGain = useMemo(() => {
    return watchlist.reduce((gain, item) => {
      const purchasePrice = parseFloat(item.price_at_time);
      const latestPrice = latestPrices[item.stock_symbol] || 0;
      const profitLoss = (latestPrice - purchasePrice) * item.quantity;
      return profitLoss > 0 ? gain + profitLoss : gain;
    }, 0);
  }, [watchlist, latestPrices]);

  // Calculate Total Lost (sum of losses only, as a positive number)
  const totalLost = useMemo(() => {
    return watchlist.reduce((loss, item) => {
      const purchasePrice = parseFloat(item.price_at_time);
      const latestPrice = latestPrices[item.stock_symbol] || 0;
      const profitLoss = (latestPrice - purchasePrice) * item.quantity;
      return profitLoss < 0 ? loss + profitLoss : loss;
    }, 0);
  }, [watchlist, latestPrices]);

  // Group watchlist items by stock_symbol
  const groupedStocks = useMemo(() => {
    const groups: { [symbol: string]: WatchlistItem[] } = {};
    const groupOrder: string[] = [];
    watchlist.forEach((item) => {
      if (!groups[item.stock_symbol]) {
        groups[item.stock_symbol] = [];
        groupOrder.push(item.stock_symbol);
      }
      groups[item.stock_symbol].push(item);
    });
    return groupOrder.map((symbol) => ({
      symbol,
      items: groups[symbol],
    }));
  }, [watchlist]);

  // Toggle the expanded state for a given symbol group
  const toggleGroup = (symbol: string) => {
    setExpandedSymbols((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  return (
    <div className="portfolio-performance-page" style={{ padding: "1rem" }}>
      <h2>Total financial contribution: ${totalInvested.toFixed(2)}</h2>
      <h2>Current Portfolio Value: ${totalCurrentValue.toFixed(2)}</h2>
      <h2>Total Gain: ${totalGain.toFixed(2)}</h2>
      <h2>Total Lost: ${Math.abs(totalLost).toFixed(2)}</h2>

      {/* Your performance component (if you wish to keep it) */}
      <PortfolioPerformance watchlist={watchlist} />
    </div>
  );
};

export default PortfolioPerformancePage;
