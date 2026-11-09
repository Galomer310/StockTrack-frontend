import axiosInstance from "./axiosInstance";

/* ===========================================================================
   Professional achievements and medals (spec v1.0, stage 2). Everything is
   evaluated on the server from the portfolio history; these calls only read
   it, choose which medals the Player Card shows, and mark notices as seen.
   =========================================================================== */

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/players/me`;

export type Localized = { en: string; he: string };

export interface ProRecord {
  id: number;
  name: Localized;
  description: Localized;
  portfolio: { id: number; name: string | null } | null;
  period_id: string;
  period_label: Localized;
  earned_on: string;
  /** Fractions (0.05 = 5%), or a streak length for streak achievements. */
  qualifying_value: number | null;
  benchmark_value: number | null;
  outperformance: number | null;
  details: {
    partial?: boolean;
    from?: string;
    medal_eligible?: boolean;
    via_grace?: boolean;
    window_start?: string;
    /** Risk & Discipline: lowest point from the period's opening value, both sides. */
    portfolio_downside?: number;
    benchmark_downside?: number;
    /** Recoveries: the lowest return before the recovery (evidence only). */
    low?: number;
  };
  xp_awarded: number;
  /** null: the XP for this achievement has not been decided yet. */
  xp_configured: number | null;
}

export interface ProAchievement {
  id: string;
  category_id: string;
  name: Localized;
  scope: "portfolio" | "player";
  measurement_period: string;
  contributes_to_medal: string | null;
  rarity: string;
  records: ProRecord[];
}

export interface MedalView {
  medal_id: string;
  /** "" for an evolving medal, the year for an annual one. */
  period_key: string;
  name: Localized;
  description: Localized;
  track: string;
  icon: string;
  tier: number;
  highest_tier: number;
  decoration: number;
  portfolio: { id: number; name: string | null } | null;
  relevant_period: string | null;
  relevant_period_label: Localized | null;
  qualifying_value: number | null;
  highest_streak: number | null;
  current_streak: number | null;
  subtitle: string | null;
  as_of: string;
  first_unlocked_at: string;
  last_upgraded_at: string;
  history: { tier: number; decoration: number; at: string }[];
}

export interface MedalRef {
  medal_id: string;
  period_key: string;
}

export interface ProfessionalView {
  categories: { id: string; name: Localized; status: "active" | "coming_soon" }[];
  achievements: ProAchievement[];
  progress: {
    windows: {
      portfolio: { id: number; name: string };
      threshold: number;
      start: string;
      day30: string;
      grace_until: string;
      best_streak: number;
      seven_met: boolean;
      day30_result: "above" | "below" | null;
    }[];
    portfolios: { portfolio: { id: number; name: string }; final_through: string | null; btm_month_streak: number; green_streak: number; btm_quarter_streak: number }[];
  };
  medal_catalog: { id: string; track: string; icon: string; is_historical: boolean; is_special: boolean; name: Localized; description: Localized }[];
  medals: MedalView[];
  display: { automatic: boolean; shown: MedalRef[] };
  xp_configured: boolean;
}

export interface ProNotifications {
  achievements: { id: number; name: Localized; portfolio_name: string | null; rarity: string; xp_awarded: number }[];
  medals: { id: number; medal_id: string; period_key: string; name: Localized; icon: string; tier: number; decoration: number; is_upgrade: boolean }[];
}

export const fetchProfessional = async (): Promise<ProfessionalView> =>
  (await axiosInstance.get<ProfessionalView>(`${BASE}/professional`)).data;

export const saveMedalDisplay = async (body: { automatic: true } | { automatic: false; selected: MedalRef[] }) =>
  (await axiosInstance.put<{ automatic: boolean; shown: MedalRef[] }>(`${BASE}/medals/display`, body)).data;

export const fetchProNotifications = async (): Promise<ProNotifications> =>
  (await axiosInstance.get<ProNotifications>(`${BASE}/professional/notifications`)).data;

export const acknowledgePro = async (achievement_ids: number[], medal_event_ids: number[]) => {
  await axiosInstance.post(`${BASE}/professional/acknowledge`, { achievement_ids, medal_event_ids });
};

export const MAX_DISPLAYED_MEDALS = 4;
export const TIER_KEYS = ["", "tier_bronze", "tier_silver", "tier_gold", "tier_platinum", "tier_sovereign"] as const;
