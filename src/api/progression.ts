/* ===========================================================================
   Progression data: player titles, game achievements, unlock notices.
   ---------------------------------------------------------------------------
   The server decides everything here - what is unlocked, how much XP it
   gave, which ceremony is pending - and the screens only display it
   (StockTracker-backend src/progression). Titles and achievements come from
   the server's catalog, so an XP value or a target changed there shows up
   without a frontend change.

   With ?demo on the Player Card, the same shapes come from a local copy of
   the catalog instead (features/progression/demo.ts), fetched only then.
   =========================================================================== */

import axiosInstance from "./axiosInstance";
import type { Localized } from "./playerCard";
import type { DemoScenario } from "../features/playerCard/demoData";

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/players/me`;

export type TitleCategory = "professional_path" | "market_legends" | "capital_empire";

export interface Title {
  id: string;
  name: string;
  /** A level category, or a future special/store category. */
  category: TitleCategory | string;
  source_type: "level" | "special" | "store";
  required_level: number | null;
  tier: number | null;
  icon: string;
  accent_color: string;
  sort_order: number;
  rarity: string | null;
}

export interface OwnedTitle extends Title {
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface TitleCollection {
  level: number;
  active_title_id: string | null;
  titles: OwnedTitle[];
}

// Systems some achievements wait for. They do not exist yet.
export type Dependency = "nicknames" | "follows" | "subscriptions" | "competitions";

export interface Achievement {
  id: string;
  category_id: string;
  name: Localized;
  description: Localized;
  xp_reward: number;
  rarity: "basic" | "advanced" | "rare" | "epic" | "exceptional";
  /** null: the category's icon. */
  icon: string | null;
  state: "locked" | "in_progress" | "unlocked";
  progress: { current: number; target: number } | null;
  blocked_by: Dependency[];
  unlocked_at: string | null;
  xp_awarded: number | null;
}

export interface AchievementCategory {
  id: string;
  name: Localized;
  icon: string;
  accent_color: string;
  total: number;
  unlocked: number;
}

export interface AchievementCollection {
  totals: { total: number; unlocked: number; xp_earned: number };
  categories: AchievementCategory[];
  achievements: Achievement[];
}

export interface UnlockNotice {
  id: string;
  category_id: string;
  name: Localized;
  rarity: Achievement["rarity"];
  icon: string;
  accent_color: string;
  xp_awarded: number;
  unlocked_at: string;
}

export interface Ceremony {
  tier: number;
  /** The tier's three titles, one per category. */
  titles: Title[];
  /** Every tier waiting for a ceremony; acknowledging the highest closes them all. */
  pending_tiers: number[];
}

export interface Notifications {
  achievements: UnlockNotice[];
  ceremony: Ceremony | null;
  active_title_id: string | null;
}

export class TitleNotOwnedError extends Error {}

const demo = () => import("../features/progression/demo");

export const fetchTitles = async (scenario?: DemoScenario): Promise<TitleCollection> => {
  if (scenario) return (await demo()).demoTitles(scenario);
  return (await axiosInstance.get<TitleCollection>(`${BASE}/titles`)).data;
};

// Makes an owned title the active one. The server refuses a locked title
// (403 TITLE_NOT_OWNED), which surfaces as TitleNotOwnedError.
export const setActiveTitle = async (titleId: string, scenario?: DemoScenario): Promise<TitleCollection> => {
  if (scenario) return (await demo()).demoSelectTitle(scenario, titleId);
  try {
    return (await axiosInstance.put<TitleCollection>(`${BASE}/title`, { title_id: titleId })).data;
  } catch (err) {
    const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
    if (code === "TITLE_NOT_OWNED") throw new TitleNotOwnedError(code);
    throw err;
  }
};

export const fetchAchievements = async (scenario?: DemoScenario): Promise<AchievementCollection> => {
  if (scenario) return (await demo()).demoAchievements(scenario);
  return (await axiosInstance.get<AchievementCollection>(`${BASE}/achievements`)).data;
};

export const fetchNotifications = async (): Promise<Notifications> =>
  (await axiosInstance.get<Notifications>(`${BASE}/progression/notifications`)).data;

export const acknowledgeNotifications = async (ack: {
  achievement_ids?: string[];
  ceremony_tier?: number | null;
}): Promise<void> => {
  await axiosInstance.post(`${BASE}/progression/acknowledge`, {
    achievement_ids: ack.achievement_ids ?? [],
    ceremony_tier: ack.ceremony_tier ?? null,
  });
};

// Anything that may have earned XP (a new portfolio, a profile edit, a title
// choice) calls this; the notice watcher then asks the server what unlocked,
// and pages showing progression refresh.
export const PROGRESSION_CHECK = "progression:check";
export const PROGRESSION_CHANGED = "progression:changed";
export const requestProgressionCheck = () => window.dispatchEvent(new Event(PROGRESSION_CHECK));
export const announceProgressionChanged = () => window.dispatchEvent(new Event(PROGRESSION_CHANGED));
