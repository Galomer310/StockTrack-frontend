import axiosInstance from "./axiosInstance";

/* ===========================================================================
   The Portfolio Dashboard's data (spec Part 1, Module 1 and Portfolio
   History). Every figure is calculated on the server; the owner's own
   portfolio only, for now.
   =========================================================================== */

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/portfolios`;

export interface AllocationSlice {
  kind: "holding" | "other" | "cash";
  label: string;
  weight_pct: number;
}

export interface AllocationHolding {
  symbol: string;
  exposure_pct: number;
  added_at: string;
  avg_buy_price: number | null;
  price_now: number;
  /** No quote cached yet: the price shown is what was paid. */
  price_is_estimate: boolean;
  gain_pct: number | null;
  sector: string | null;
}

export interface Allocation {
  portfolio: { id: number; name: string; status: string; created_at: string };
  summary: {
    starting_capital: number;
    capital_base: number;
    capital_earned: number;
    capital_rewards: number;
    return_pct: number;
    cash_pct: number;
  };
  slices: AllocationSlice[];
  holdings: AllocationHolding[];
}

export type ChangeKind = "added" | "increased" | "reduced" | "removed";

export interface CompositionEvent {
  trade_id: number;
  at: string;
  symbol: string;
  action: "buy" | "sell";
  kind: ChangeKind;
  quantity: number;
  price: number;
  /** Weights (0-1) by symbol, plus CASH, just before and after the action. */
  before: Record<string, number>;
  after: Record<string, number>;
  note: string | null;
  /** The author's dated additions to the rationale, oldest first. */
  followups: Followup[];
}

export interface Followup {
  id: number;
  body: string;
  created_at: string;
}

export interface Composition {
  portfolio: { id: number; name: string };
  symbols: string[];
  /** Newest first. */
  events: CompositionEvent[];
}

export const CASH_KEY = "CASH";

export const fetchAllocation = async (portfolioId: number): Promise<Allocation> =>
  (await axiosInstance.get<Allocation>(`${BASE}/${portfolioId}/allocation`)).data;

/** The trade's author adds a dated follow-up to its rationale. */
export const addFollowup = async (tradeId: number, body: string): Promise<Followup> =>
  (await axiosInstance.post<{ followup: Followup }>(`${import.meta.env.VITE_BACKEND_API_URL}/feed/${tradeId}/followups`, { body })).data.followup;

export const fetchComposition = async (portfolioId: number): Promise<Composition> =>
  (await axiosInstance.get<Composition>(`${BASE}/${portfolioId}/composition`)).data;

/* ---------------------------------------------------------------------------
   Module 5 - Performance Insights. Returns are fractions (0.05 = 5%),
   measured on investing alone; the benchmarks share the portfolio's dates.
   --------------------------------------------------------------------------- */

export interface DatedReturn {
  date: string;
  value: number;
}

export interface MonthReturn {
  month: string;
  value: number;
  partial: boolean;
  in_progress: boolean;
}

export interface BenchmarkInfo {
  key: string;
  symbol: string;
  name: string;
  source: string;
  return_type: string;
  provisional: boolean;
}

export interface InsightsData {
  start: string;
  end: string;
  sessions: number;
  total_return: number;
  average_monthly_return: number | null;
  best_month: MonthReturn | null;
  worst_month: MonthReturn | null;
  positive_months: { positive: number; counted: number };
  months: MonthReturn[];
  max_drawdown: { value: number; peak_date: string | null; trough_date: string | null };
  max_daily_gain: DatedReturn | null;
  max_daily_loss: DatedReturn | null;
  age_days: number;
  benchmarks: { key: string; symbol: string; name: string; return: number | null; excess_return: number | null }[];
  chart: ({ date: string; portfolio: number } & Record<string, number | string | null>)[];
  estimated: boolean;
}

export type Insights = {
  portfolio: { id: number; name: string; created_at: string };
  status: { consistent: boolean; final_through: string | null; rebuilt_at: string } | null;
  benchmarks: BenchmarkInfo[];
} & (
  | { available: true; insights: InsightsData }
  | { available: false; reason: "no_history" | "too_new"; age_days: number }
);

export const fetchInsights = async (portfolioId: number): Promise<Insights> =>
  (await axiosInstance.get<Insights>(`${BASE}/${portfolioId}/insights`)).data;
