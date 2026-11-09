import axiosInstance from "./axiosInstance";
import type { MessageKey } from "../i18n/messages";

/* ===========================================================================
   Daily rewards: login streak, daily XP and capital growth.
   ---------------------------------------------------------------------------
   The server decides everything - which calendar day it is (Israel time),
   the streak, the XP and the capital percentage - so the device clock cannot
   earn a day twice. See the backend's src/rewards.
   =========================================================================== */

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/players/me/daily-rewards`;

export type CapitalTier = "weekly" | "monthly" | "quarterly";

export interface CapitalReward {
  id: number;
  login_date: string;
  streak_day: number;
  percentage: number;
  tier: CapitalTier | string;
  earned_at: string;
  status: "pending" | "redeemed";
  message: { id: string; en: string; he: string } | null;
  portfolio: { id: number; name: string | null } | null;
  redeemed_at: string | null;
  value_before: number | null;
  value_after: number | null;
  base_before: number | null;
  base_after: number | null;
  capital_added: number | null;
}

export interface DailyRewards {
  date: string;
  time_zone: string;
  /** Consecutive login days; 0 once a day has been missed. */
  streak: number;
  total_login_days: number;
  checked_in_today: boolean;
  today: {
    streak_day: number;
    xp: number;
    capital_reward: CapitalReward | null;
    /** Today's notice has not been shown yet. */
    unseen: boolean;
  } | null;
  next_xp: { day: number; xp: number } | null;
  /** from_day: the last capital day at or before the streak (0 before the first). */
  next_capital: { day: number; pct: number; tier: CapitalTier | string; from_day: number } | null;
  base_xp: number;
  pending: CapitalReward[];
  /** Only on check-in: true the first time today. */
  counted?: boolean;
}

export interface RedeemResult {
  reward_id: number;
  portfolio: { id: number; name: string };
  percentage: number;
  value_before: number;
  value_after: number;
  capital_added: number;
  base_before: number;
  base_after: number;
  return_before_pct: number;
  return_after_pct: number;
}

export interface RewardsHistory {
  logins: { type: "DAILY_LOGIN_XP"; date: string; streak_day: number; xp: number }[];
  capital_rewards: (CapitalReward & { type: "CAPITAL_BOOST_REWARD" })[];
}

export type RedeemErrorCode =
  | "REWARD_NOT_FOUND"
  | "REWARD_ALREADY_REDEEMED"
  | "PORTFOLIO_NOT_FOUND"
  | "PORTFOLIO_NOT_ELIGIBLE"
  | "INVALID_VALUATION"
  | "UNKNOWN";

export class RedeemError extends Error {
  constructor(public code: RedeemErrorCode) {
    super(code);
  }
}

export const checkIn = async (): Promise<DailyRewards> => (await axiosInstance.post<DailyRewards>(`${BASE}/check-in`)).data;

export const fetchDailyRewards = async (): Promise<DailyRewards> => (await axiosInstance.get<DailyRewards>(BASE)).data;

export const acknowledgeToday = async (): Promise<void> => {
  await axiosInstance.post(`${BASE}/acknowledge`);
};

export const fetchRewardsHistory = async (): Promise<RewardsHistory> =>
  (await axiosInstance.get<RewardsHistory>(`${BASE}/history`)).data;

const KNOWN: RedeemErrorCode[] = [
  "REWARD_NOT_FOUND",
  "REWARD_ALREADY_REDEEMED",
  "PORTFOLIO_NOT_FOUND",
  "PORTFOLIO_NOT_ELIGIBLE",
  "INVALID_VALUATION",
];

export const redeemReward = async (rewardId: number, portfolioId: number): Promise<RedeemResult> => {
  try {
    return (await axiosInstance.post<RedeemResult>(`${BASE}/${rewardId}/redeem`, { portfolio_id: portfolioId })).data;
  } catch (err) {
    const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
    throw new RedeemError(KNOWN.includes(code as RedeemErrorCode) ? (code as RedeemErrorCode) : "UNKNOWN");
  }
};

// Anything that changes the rewards (a check-in, a redemption) announces it,
// so every panel on screen reloads, and the portfolio screens too.
export const DAILY_REWARDS_CHANGED = "daily-rewards:changed";
export const announceDailyRewardsChanged = () => window.dispatchEvent(new Event(DAILY_REWARDS_CHANGED));
// Opens the capital boost dialog for one reward from anywhere in the app.
export const OPEN_CAPITAL_BOOST = "daily-rewards:open-boost";
export const openCapitalBoost = (reward: CapitalReward) =>
  window.dispatchEvent(new CustomEvent<CapitalReward>(OPEN_CAPITAL_BOOST, { detail: reward }));

/** The tier's accent colour (spec section 14): blue, purple, champagne gold. */
export const TIER_ACCENT: Record<string, string> = {
  weekly: "#8FB3E0",
  monthly: "#A993DB",
  quarterly: "#D9BE89",
};

/** The tier name shown to the player. */
export const TIER_LABEL: Record<string, MessageKey> = {
  weekly: "dr_tier_weekly",
  monthly: "dr_tier_monthly",
  quarterly: "dr_tier_quarterly",
};

/** Value and return after applying `pct` to a portfolio, as the server will (cents). */
export const previewBoost = (equity: number, capitalBase: number, pct: number) => {
  const added = Math.round(equity * pct) / 100;
  const after = equity + added;
  const baseAfter = capitalBase * (1 + pct / 100);
  return {
    added,
    after,
    returnBefore: capitalBase > 0 ? (equity / capitalBase - 1) * 100 : 0,
    returnAfter: baseAfter > 0 ? (after / baseAfter - 1) * 100 : 0,
  };
};
