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
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

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

    const fetchLatestPrices = async () => {
      const symbols = watchlist.map((item) => item.stock_symbol);
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

    if (user) {
      fetchWatchlist();
    }

    if (watchlist.length > 0) {
      fetchLatestPrices();
    }
  }, [user, accessToken, watchlist.length]);

  const totalInvested = useMemo(() => {
    return watchlist.reduce((sum, item) => {
      return sum + parseFloat(item.price_at_time) * item.quantity;
    }, 0);
  }, [watchlist]);

  const totalCurrentValue = useMemo(() => {
    return watchlist.reduce((sum, item) => {
      const purchasePrice = parseFloat(item.price_at_time);
      const latestPrice = latestPrices[item.stock_symbol] || 0;
      const profitLoss = (latestPrice - purchasePrice) * item.quantity;
      return sum + purchasePrice * item.quantity + profitLoss; // Sum up the total value with profit/loss
    }, 0);
  }, [watchlist, latestPrices]);

  return (
    <div className="portfolio-performance-page">
      <h2>Total financial contribution: ${totalInvested.toFixed(2)}</h2>
      <h2>Current Portfolio Value: ${totalCurrentValue.toFixed(2)}</h2>
      <PortfolioPerformance watchlist={watchlist} />
    </div>
  );
};

export default PortfolioPerformancePage;
