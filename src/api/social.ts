// Shared types and calls for the leaderboard / social features.
import axiosInstance from "./axiosInstance";

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/social`;

// One row of the leaderboard.
export interface LeaderboardEntry {
  rank: number;
  id: number;
  display_name: string;
  member_since: string;
  invested: number;
  current_value: number;
  profit: number;
  return_pct: number;
  holdings_count: number;
}

// A single position within someone's portfolio.
export interface Holding {
  id: number;
  stock_symbol: string;
  price_at_time: number;
  latest_price: number;
  quantity: number;
  added_at: string;
  industry: string | null;
  profit_loss: number;
}

// Totals for a whole portfolio.
export interface PortfolioSummary {
  invested: number;
  current_value: number;
  profit: number;
  return_pct: number;
  holdings_count: number;
}

// Response shape of GET /social/users/:id/portfolio.
export interface PortfolioResponse {
  user: { id: number; display_name: string; member_since: string };
  is_self: boolean;
  summary: PortfolioSummary;
  holdings: Holding[];
}

// Fetch every account ranked by percentage return.
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await axiosInstance.get(`${BASE}/leaderboard`);
  return res.data.leaderboard;
};

// Fetch one account's portfolio. Works for your own id, which is how the
// compare view gets both sides in an identical shape.
export const fetchPortfolio = async (userId: number): Promise<PortfolioResponse> => {
  const res = await axiosInstance.get(`${BASE}/users/${userId}/portfolio`);
  return res.data;
};

// Money and percentage formatting, kept here so every social screen matches.
export const money = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const percent = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
