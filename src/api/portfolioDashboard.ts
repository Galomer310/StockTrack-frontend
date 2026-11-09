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

/* ---------------------------------------------------------------------------
   Module 3 - Investment Profile. Scores are 0-100; weights and returns are
   fractions. Scales are provisional (approved 2026-11-09).
   --------------------------------------------------------------------------- */

export type Band = "Very Low" | "Low" | "Medium" | "High" | "Very High";
export type HorizonCategory = "Very Short" | "Short" | "Medium" | "Long" | "Very Long";
type Missing<R extends string> = { available: false; reason: R };

export interface InvestmentProfile {
  portfolio: { id: number; name: string };
  history_built: boolean;
  risk:
    | {
        available: true;
        score: number;
        band: Band;
        components: { volatility: number; max_drawdown: number; concentration: number; liquidity: number; turnover: number };
      }
    | Missing<"too_short" | "missing_data">;
  volatility:
    | {
        available: true;
        annualized: number;
        daily: number;
        sessions: number;
        full_window: boolean;
        score: number;
        band: Band;
        average_positive_day: number | null;
        average_negative_day: number | null;
        max_daily_gain: DatedReturn | null;
        max_daily_loss: DatedReturn | null;
      }
    | (Missing<"too_short"> & { sessions: number; needed: number });
  max_drawdown: { value: number; peak_date: string | null; trough_date: string | null; score: number } | null;
  diversification:
    | {
        available: true;
        score: number;
        band: Band;
        concentration: number;
        parts: {
          effective_holdings: { value: number; holdings: number; score: number };
          largest_position: { symbol: string; weight: number; score: number };
          top_3: { weight: number; score: number };
          sector: { largest: string | null; largest_weight: number; hhi: number; score: number; unclassified: string[] };
        };
      }
    | Missing<"no_holdings">;
  liquidity: { low_liquidity_weight: number; score: number; threshold_usd: number; unknown: string[] } | null;
  turnover: { value: number; events: number; window_days: number; score: number; band: Band };
  horizon:
    | { available: true; median_days: number; category: HorizonCategory; meter: number; lots: number; open_lots: number }
    | Missing<"no_holdings">;
}

export const fetchProfile = async (portfolioId: number): Promise<InvestmentProfile> =>
  (await axiosInstance.get<InvestmentProfile>(`${BASE}/${portfolioId}/profile`)).data;

/* ---------------------------------------------------------------------------
   Comparing a portfolio with a market index (spec 41). Fractions; the
   chart starts both at 100; never affects Beat the Market.
   --------------------------------------------------------------------------- */

export type IndexComparisonResult = {
  portfolio: { id: number; name: string };
  index: { key: string; symbol: string; name: string; source: string; return_type: string; provisional: boolean };
  indices: { key: string; symbol: string; name: string }[];
  range: { earliest: string; latest: string | null };
} & (
  | {
      ok: true;
      start: string;
      end: string;
      portfolio_return: number;
      index_return: number;
      excess_return: number;
      chart: { date: string; portfolio: number; index: number }[];
      estimated: boolean;
    }
  | { ok: false; reason: "no_history" | "no_index_data" | "too_short" }
);

export const fetchIndexComparison = async (portfolioId: number, q: { index: string; from?: string; to?: string }) =>
  (await axiosInstance.get<IndexComparisonResult>(`${BASE}/${portfolioId}/compare-index`, { params: q })).data;

/* ---------------------------------------------------------------------------
   Module 4 - Exposure & Characteristics. Shares of the whole portfolio
   (cash included); `unclassified` is the share that could not be judged.
   --------------------------------------------------------------------------- */

export interface ExposureValue {
  value: number;
  unclassified: number;
}

export interface ExposureData {
  portfolio: { id: number; name: string };
  micro_cap: ExposureValue;
  small_cap: ExposureValue;
  low_volume: ExposureValue;
  tech: ExposureValue;
  momentum: ExposureValue;
  cash: number;
  threshold_usd: number;
  holdings: {
    symbol: string;
    weight: number;
    market_cap: number | null;
    cap: "micro" | "small" | null;
    dollar_volume: number | null;
    low_liquidity: boolean | null;
    tech: boolean | null;
    momentum: boolean | null;
    industry: string | null;
  }[];
  not_available: string[];
}

export const fetchExposures = async (portfolioId: number): Promise<ExposureData> =>
  (await axiosInstance.get<ExposureData>(`${BASE}/${portfolioId}/exposures`)).data;
