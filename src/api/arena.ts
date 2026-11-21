import axiosInstance from "./axiosInstance";

/* The Arena (StockTracker-backend src/arena): monthly leagues for portfolios.
   Every figure is a percentage; no one's money leaves the server. */

export interface ArenaOwner {
  id: number;
  name: string;
  nickname: string | null;
  avatar_id: string | null;
}

export interface ArenaGroupRow {
  rank: number | null;
  portfolio_id: number;
  name: string;
  owner: ArenaOwner;
  excess_pct: number | null;
  mine: boolean;
}

export type ArenaMine =
  | {
      portfolio_id: number;
      name: string;
      state: "competing";
      league: number;
      group_id: number;
      group_no: number;
      group_size: number;
      rank: number | null;
      excess_pct: number | null;
      promote_through: number;
      relegate_from: number | null;
      zone: "promote" | "safe" | "relegate" | "unranked";
      group: ArenaGroupRow[];
    }
  | {
      portfolio_id: number;
      name: string;
      state: "waiting";
      league: number;
      reason: "too_young" | "few_holdings" | "next_season" | "tester";
      days_to_eligible: number;
      holdings: number;
    };

export type BoardKey = "beat_market" | "capital_shield" | "consistency" | "rising_stars" | "climbers";

export interface ArenaBoard {
  key: BoardKey;
  size: number;
  rows: {
    place: number;
    portfolio_id: number;
    value: number | null;
    mine: boolean;
    name: string;
    owner: ArenaOwner;
    league: number | null;
    age_days?: number;
  }[];
  me: { place: number; portfolio_id: number; value: number | null } | null;
}

export type DiscoverReason = "thoughtful" | "active" | "steady" | "newcomer" | "drawn";

export interface ArenaView {
  season: {
    key: string;
    starts_on: string;
    ends_on: string;
    measured_through: string | null;
    days_total: number;
    days_left: number;
    benchmark: string;
    portfolios: number;
  } | null;
  leagues: { league: number; key: string; name: string; portfolios: number; mine: number }[];
  hall_of_fame: {
    season: string | null;
    champions: { league: number; portfolio_id: number | null; name: string | null; owner: ArenaOwner | null; excess_pct: number | null }[];
  };
  mine: ArenaMine[];
  boards: ArenaBoard[];
  discover: {
    portfolio_id: number;
    name: string;
    owner: ArenaOwner;
    league: number;
    excess_pct: number | null;
    seasons_played: number;
    reason: DiscoverReason;
    mine: boolean;
  }[];
  rules: { groupTarget: number; minAgeDays: number; minHoldings: number; promoteShare: number; relegateShare: number };
  today: string;
}

export const LEAGUE_NAMES: Record<number, string> = {
  1: "Startup",
  2: "Small Cap",
  3: "Mid Cap",
  4: "Large Cap",
  5: "Mega Cap",
};

export const fetchArena = async (): Promise<ArenaView> => (await axiosInstance.get<ArenaView>("/arena")).data;
