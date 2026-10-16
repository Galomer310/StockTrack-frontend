/* ===========================================================================
   Player Card data.
   ---------------------------------------------------------------------------
   The shape below is what the backend will return: every figure already
   calculated by the metric engine (src/metrics/player.ts in the backend),
   with locked and unavailable states decided there. The screen only
   displays it. Return and XP calculations must not be repeated in the
   browser - the spec forbids duplicating them, and two implementations
   would eventually disagree.

   No player endpoints exist yet, so these functions serve demo data with
   the same shape. Replacing their bodies with API calls is the whole of the
   switch; nothing that renders the card needs to change.
   =========================================================================== */

import { DEMO_PLAYER_CARDS, DemoScenario } from "../features/playerCard/demoData";

export type LockReason = "requires_min_active_portfolios" | "no_active_portfolio_above_threshold";
export type UnavailableReason = "missing_data" | "no_active_portfolios";

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

export interface PlayerCardData {
  player: {
    nickname: string;
    first_name: string | null;
    avatar_url: string | null;
    bio: string;
    level: number;
    title: string;
    xp: number;
    next_level_xp: number;
    next_level: number;
    next_title: string;
  };
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

// Bio limit, from the Player Card spec (3.5).
export const BIO_MAX_LENGTH = 100;

// Counts characters as a person does, so a Hebrew letter or an emoji is one.
export const bioLength = (text: string): number => [...text].length;

export const fetchPlayerCard = async (scenario: DemoScenario = "established"): Promise<PlayerCardResult> => {
  // TODO: GET /players/me/card once the backend serves it.
  return { data: structuredClone(DEMO_PLAYER_CARDS[scenario]), demo: true };
};

export const saveBio = async (bio: string): Promise<string> => {
  const trimmed = bio.trim();
  if (bioLength(trimmed) > BIO_MAX_LENGTH) {
    throw new RangeError(`Bio must be ${BIO_MAX_LENGTH} characters or fewer`);
  }
  // TODO: PATCH /players/me { bio } once the backend serves it. Until then
  // the edit lasts until the page is reloaded.
  return trimmed;
};
