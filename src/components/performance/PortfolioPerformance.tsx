import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components (if using a pie chart)
ChartJS.register(ArcElement, Tooltip, Legend);

export interface WatchlistItem {
  id: number;
  stock_symbol: string;
  price_at_time: string;
  quantity: number;
  added_at: string;
  industry?: string;
  latestPrice?: number;
}

interface PortfolioPerformanceProps {
  watchlist: WatchlistItem[];
}

const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({
  watchlist,
}) => {
  // State for storing the latest prices from the backend
  const [latestPrices, setLatestPrices] = useState<{
    [symbol: string]: number;
  }>({});
  // Sorting state: sort field can be "stock_symbol", "quantity", or "profitLoss"
  const [sortBy, setSortBy] = useState<string>("stock_symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const uniqueSymbols = Array.from(
      new Set(watchlist.map((item) => item.stock_symbol))
    );
    const fetchLatestPrices = async () => {
      const prices: { [symbol: string]: number } = {};
      await Promise.all(
        uniqueSymbols.map(async (symbol) => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_BACKEND_API_URL}/stocks/${symbol}`
            );

            prices[symbol] = parseFloat(response.data.last_price);
          } catch (err) {
            console.error(`Error fetching latest price for ${symbol}`, err);
          }
        })
      );
      setLatestPrices(prices);
    };
    if (uniqueSymbols.length > 0) {
      fetchLatestPrices();
    }
  }, [watchlist]);

  // Compute sorted data with computed profit/loss
  const sortedData = useMemo(() => {
    const items = watchlist.map((item) => {
      const purchasePrice = parseFloat(item.price_at_time);
      const latestPrice = latestPrices[item.stock_symbol] || 0;
      const profitLoss = (latestPrice - purchasePrice) * Number(item.quantity);
      return { ...item, purchasePrice, latestPrice, profitLoss };
    });

    items.sort((a, b) => {
      let compare = 0;
      if (sortBy === "stock_symbol") {
        compare = a.stock_symbol.localeCompare(b.stock_symbol);
      } else if (sortBy === "quantity") {
        compare = Number(a.quantity) - Number(b.quantity);
      } else if (sortBy === "profitLoss") {
        compare = a.profitLoss - b.profitLoss;
      }
      return sortOrder === "asc" ? compare : -compare;
    });
    return items;
  }, [watchlist, latestPrices, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // toggle sort order if the same field is clicked again
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="portfolio-performance">
      <h3>Portfolio Performance</h3>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("stock_symbol")}>
              Ticker{" "}
              {sortBy === "stock_symbol" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th>Purchase Price</th>
            <th>Latest Price</th>
            <th onClick={() => handleSort("quantity")}>
              Quantity{" "}
              {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("profitLoss")}>
              Profit / Loss{" "}
              {sortBy === "profitLoss" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr key={item.id}>
              <td>{item.stock_symbol}</td>
              <td>${item.purchasePrice.toFixed(2)}</td>
              <td>${item.latestPrice.toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td style={{ color: item.profitLoss >= 0 ? "green" : "red" }}>
                ${item.profitLoss.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioPerformance;
