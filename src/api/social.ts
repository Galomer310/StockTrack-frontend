// Shared types and calls for the leaderboard / social features.
import axiosInstance from "./axiosInstance";

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/social`;

/* ===========================================================================
   Money is private, percentages are public.
   ---------------------------------------------------------------------------
   The server decides this, not these types: when you are not the owner of a
   portfolio it simply does not send prices, quantities or any absolute figure.
   The optional fields below mirror that - they are present on your own data
   and absent on everyone else's, so `is_self` is what tells you which shape
   you are holding.
   =========================================================================== */

// One row of the leaderboard. Percentages only, for every row including yours.
//
// The unit is the PORTFOLIO, not the account: a user runs up to three and each
// is ranked on its own, so `id` here is a portfolio id.
export interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  owner: { id: number; display_name: string };
  is_mine: boolean;
  return_pct: number;
  holdings_count: number;
  /** Share of the book still sitting in cash */
  cash_weight_pct: number;
  created_at: string;
}

// A single position, as its owner sees it: with prices and size.
export interface OwnHolding {
  id: number;
  stock_symbol: string;
  price_at_time: number;
  latest_price: number;
  quantity: number;
  added_at: string;
  industry: string | null;
  profit_loss: number;
  /** Share of the book, measured against equity so cash is counted too */
  weight_pct: number;
}

// The same position as everyone else sees it: how it has done, and how much of
// the book it is. Both are ratios, so neither reveals a price or a share count.
export interface PublicHolding {
  id: number;
  stock_symbol: string;
  industry: string | null;
  added_at: string;
  gain_pct: number;
  weight_pct: number;
}

export type Holding = OwnHolding | PublicHolding;

// Narrowing helper, so a component can tell the two apart without repeating
// the property check (and without trusting a flag the two shapes don't carry).
export const isOwnHolding = (h: Holding): h is OwnHolding =>
  (h as OwnHolding).price_at_time !== undefined;

// Totals for a whole portfolio. The monetary fields arrive only for your own.
export interface PortfolioSummary {
  id: number;
  name: string;
  return_pct: number;
  holdings_count: number;
  /** Share of the book still sitting in cash - a ratio, so public */
  cash_weight_pct: number;
  created_at: string;
  starting_balance?: number;
  cash?: number;
  positions_value?: number;
  equity?: number;
  profit?: number;
}

// Response shape of GET /social/portfolios/:id.
export interface PortfolioResponse {
  portfolio: { id: number; name: string; created_at: string };
  owner: { id: number; display_name: string };
  is_self: boolean;
  summary: PortfolioSummary;
  holdings: Holding[];
}

// Fetch every portfolio ranked by percentage return.
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await axiosInstance.get(`${BASE}/leaderboard`);
  return res.data.leaderboard;
};

// Fetch one portfolio. Works for your own, which is how the compare view gets
// both sides in an identical shape.
export const fetchPortfolio = async (portfolioId: number): Promise<PortfolioResponse> => {
  const res = await axiosInstance.get(`${BASE}/portfolios/${portfolioId}`);
  return res.data;
};

// Money and percentage formatting, kept here so every social screen matches.
// money() is only ever valid on your own figures.
export const money = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const percent = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

// A percentage that may be unknown, because the symbol has no cached quote.
// Printing "+0.00%" there would claim the stock had not moved, which is a
// different statement from "we do not know".
export const percentOrDash = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : percent(n);

// Date and time an action was taken, to the minute.
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
