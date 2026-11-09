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

export const fetchComposition = async (portfolioId: number): Promise<Composition> =>
  (await axiosInstance.get<Composition>(`${BASE}/${portfolioId}/composition`)).data;
