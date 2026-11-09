// The caller's own portfolios: how many they may hold, what is in each, and
// how much cash is left to deploy.
import axiosInstance from "./axiosInstance";

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/portfolios`;

// Your own portfolio, with money in it. Only ever returned for books you own -
// what other people see is the percentage-only shape in api/social.ts.
export interface MyPortfolio {
  id: number;
  name: string;
  starting_balance: number;
  /** starting_balance grown by capital growth rewards; the return is measured against it. */
  capital_base: number;
  cash: number;
  positions_value: number;
  equity: number;
  profit: number;
  return_pct: number;
  holdings_count: number;
  cash_weight_pct: number;
  created_at: string;
  /** active or closed (archived is not defined yet). */
  status?: "active" | "closed";
  /** The latest trade, or the opening when there is none. */
  last_updated?: string;
  /** Genuine performance index, thinned for the card's sparkline. */
  sparkline?: number[];
  /** The Investment Profile's Risk Score; null while it cannot be computed. */
  risk?: { score: number; band: "Very Low" | "Low" | "Medium" | "High" | "Very High" } | null;
}

export interface PortfolioList {
  portfolios: MyPortfolio[];
  /** How many this account may hold. Rises with paid tiers later. */
  limit: number;
  /** What each new portfolio opens with. */
  starting_cash: number;
}

export const fetchMyPortfolios = async (): Promise<PortfolioList> => {
  const res = await axiosInstance.get(BASE);
  return res.data;
};

export const createPortfolio = async (name: string): Promise<MyPortfolio> => {
  const res = await axiosInstance.post(BASE, { name });
  return res.data.portfolio;
};
