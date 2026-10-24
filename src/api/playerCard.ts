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
import type { Title } from "./progression";
import { DEMO_PLAYER_CARDS, DemoScenario } from "../features/playerCard/demoData";

const BASE = `${import.meta.env.VITE_BACKEND_API_URL}/players`;

export type LockReason = "requires_min_active_portfolios" | "no_active_portfolio_above_threshold";
// not_defined: the rules behind the figure are deliberately unwritten yet,
// so the server withholds it rather than invent it.
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

// Which drawing represents a medal. The medal bank is not defined yet, so
// these are the shapes the reference image uses. Game achievements carry a
// category and are drawn with their category's emblem instead.
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
  /** A medal drawing, or for a game achievement the name of its emblem. */
  art: AwardArt | string;
  /** Game achievements only. */
  category?: string;
  accent_color?: string;
  rarity?: string;
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

// Mirrors the backend's LevelProgress plus the active title. XP per level is
// not decided yet: until thresholds are configured every player is level 1,
// next_level is null and thresholds_configured says why.
export interface Progression {
  level: number;
  xp: number;
  /** XP at which the current level began; 0 at level 1. */
  current_level_xp: number;
  next_level: number | null;
  next_level_xp: number | null;
  thresholds_configured: boolean;
  thresholds_provisional: boolean;
  /** Level at which the next three titles unlock; null after the last tier. */
  next_title_level: number | null;
  /** null until the player chooses a title. */
  active_title: Title | null;
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

// Bio limit, from the Player Card spec (3.5). The server enforces it too.
export const BIO_MAX_LENGTH = 100;

// The server's first-name limit. Not in the spec, which sets none; a
// placeholder cap mirrored from the backend (src/services/playerProfile.ts).
export const FIRST_NAME_MAX_LENGTH = 50;

// Counts characters as a person does, so a Hebrew letter or an emoji is one.
export const bioLength = (text: string): number => [...text].length;

// What the player may change about themselves. The nickname and picture are
// not editable yet: their rules and storage are still to be decided.
export interface ProfileUpdate {
  bio?: string;
  /** null removes it; the first name is optional. */
  first_name?: string | null;
}

// Reasons the server gives for refusing an edit, so the page can explain
// them in the reader's language.
export type ProfileErrorCode =
  | "BIO_TOO_LONG"
  | "FIRST_NAME_TOO_LONG"
  | "INVALID_CHARACTERS"
  | "NOT_EDITABLE"
  | "UNKNOWN";

export class ProfileSaveError extends Error {
  constructor(public code: ProfileErrorCode) {
    super(code);
  }
}

// The signed-in player's card, or demo data when a scenario is given.
export const fetchPlayerCard = async (demo?: DemoScenario): Promise<PlayerCardResult> => {
  if (demo) return { data: structuredClone(DEMO_PLAYER_CARDS[demo]), demo: true };
  const res = await axiosInstance.get<PlayerCardData>(`${BASE}/me/card`);
  return { data: res.data, demo: false };
};

const KNOWN_CODES: ProfileErrorCode[] = ["BIO_TOO_LONG", "FIRST_NAME_TOO_LONG", "INVALID_CHARACTERS", "NOT_EDITABLE"];

// Saves the player's own bio and/or first name with PATCH /players/me and
// returns their identity as it now stands. On demo data nothing is sent: the
// edit is applied locally and lasts until the page is reloaded.
export const saveProfile = async (
  update: ProfileUpdate,
  current: PlayerCardData["player"],
  demo: boolean
): Promise<PlayerCardData["player"]> => {
  if (demo) {
    const bio = update.bio?.trim();
    const firstName = update.first_name?.trim();
    if (bio !== undefined && bioLength(bio) > BIO_MAX_LENGTH) throw new ProfileSaveError("BIO_TOO_LONG");
    if (firstName && bioLength(firstName) > FIRST_NAME_MAX_LENGTH) throw new ProfileSaveError("FIRST_NAME_TOO_LONG");
    return {
      ...current,
      ...(bio !== undefined ? { bio } : {}),
      ...("first_name" in update ? { first_name: firstName || null } : {}),
    };
  }
  try {
    const res = await axiosInstance.patch<{ player: PlayerCardData["player"] }>(`${BASE}/me`, update);
    return res.data.player;
  } catch (err) {
    const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
    throw new ProfileSaveError(KNOWN_CODES.includes(code as ProfileErrorCode) ? (code as ProfileErrorCode) : "UNKNOWN");
  }
};
