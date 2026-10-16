/* ===========================================================================
   Player Card data.
   ---------------------------------------------------------------------------
   GET /players/me/card returns every figure already calculated by the
   backend's metric engine, with locked and unavailable states decided
   there. The screen only displays it. Return and XP calculations must not be
   repeated in the browser - the spec forbids duplicating them, and two
   implementations would eventually disagree.

   The types below mirror the backend's response (src/services/playerCard.ts
   in StockTracker-backend). Demo data in the same shape remains available
   with ?demo=1 (an established player) or ?demo=new (a new one), for
   working on the design without an account full of trades.
   =========================================================================== */

import axiosInstance from "./axiosInstance";
import { DEMO_PLAYER_CARDS, DemoScenario } from "../features/playerCard/demoData";

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/players`;

export type LockReason = "requires_min_active_portfolios" | "no_active_portfolio_above_threshold";
// not_defined: the rules behind the figure are deliberately unwritten yet
// (XP, levels and titles), so the server withholds it rather than invent it.
export type UnavailableReason = "missing_data" | "no_active_portfolios" | "not_defined";

// Mirrors CardValue in the backend metric engine.
export type CardValue<T> =
  | { state: "available"; value: T }
  | { state: "locked"; reason: LockReason }
  | { state: "unavailable"; reason: UnavailableReason };

export interface Localized {
  he: string;
  en: string;
}

// Which drawing represents an award. The banks are not defined yet, so these
// are the shapes the reference image uses.
export type AwardArt =
  | "laurel_trophy"
  | "gem"
  | "shield_top_percent"
  | "star_shield"
  | "hex_blue"
  | "hex_green"
  | "hex_purple"
  | "hex_gold";

export interface Award {
  id: string;
  art: AwardArt;
  name: Localized;
  description: Localized;
  condition: Localized;
  /** Prestige for a medal, importance for an achievement. */
  rank: number;
  xp: number;
  /** ISO date. */
  earned_at: string;
}

export interface TopPortfolio {
  id: number;
  name: string;
  cumulative_return: number;
}

export interface Progression {
  level: number;
  title: string;
  xp: number;
  next_level_xp: number;
  next_level: number;
  next_title: string;
}

export interface PlayerCardData {
  player: {
    /** null until the player has chosen one. */
    nickname: string | null;
    first_name: string | null;
    avatar_url: string | null;
    bio: string;
  };
  /** Level, title and XP: one value, so the header and the progress panel always agree. */
  progression: CardValue<Progression>;
  social: { followers: number; subscribers: number };
  stats: {
    portfolios_total: number;
    portfolios_active: number;
    average_active_return: CardValue<number>;
    best_portfolio_gain: CardValue<number>;
    top_portfolio: CardValue<TopPortfolio>;
    average_month_to_date_return: CardValue<number>;
  };
  competitions: { participations: number; prize_wins: number; top_3: number; first_place: number };
  /** `top` is at most four, already ranked by the server. */
  medals: { total: number; top: Award[] };
  achievements: { total: number; top: Award[] };
}

export interface PlayerCardResult {
  data: PlayerCardData;
  /** True while the card is served from demo data. */
  demo: boolean;
}

// Bio limit, from the Player Card spec (3.5). The database enforces it too.
export const BIO_MAX_LENGTH = 100;

// Counts characters as a person does, so a Hebrew letter or an emoji is one.
export const bioLength = (text: string): number => [...text].length;

// The signed-in player's card, or demo data when a scenario is given.
export const fetchPlayerCard = async (demo?: DemoScenario): Promise<PlayerCardResult> => {
  if (demo) return { data: structuredClone(DEMO_PLAYER_CARDS[demo]), demo: true };
  const res = await axiosInstance.get<PlayerCardData>(`${BASE}/me/card`);
  return { data: res.data, demo: false };
};

// Demo only for now: there is no profile-editing endpoint yet, so the page
// offers editing only on demo data, where the edit lasts until reload.
export const saveBio = async (bio: string): Promise<string> => {
  const trimmed = bio.trim();
  if (bioLength(trimmed) > BIO_MAX_LENGTH) {
    throw new RangeError(`Bio must be ${BIO_MAX_LENGTH} characters or fewer`);
  }
  return trimmed;
};
