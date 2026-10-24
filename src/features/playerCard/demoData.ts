/* ===========================================================================
   Demo data for the Player Card.
   ---------------------------------------------------------------------------
   Kept apart from the components, as the spec requires, and in exactly the
   shape the backend will return, so swapping it out touches only
   src/api/playerCard.ts.

   Illustrative values only. The medals are not a medal bank (none is
   defined yet) and the levels and XP are not an XP table. Titles and game
   achievements are real entries from the catalog, so the demo shows them as
   they will look.

   Two players: an established one (/player?demo=1) and a new one whose card
   shows the locked and empty states (/player?demo=new). Without ?demo the
   page shows the signed-in player's real card.
   =========================================================================== */

import type { Award, PlayerCardData } from "../../api/playerCard";
import type { Title } from "../../api/progression";

export type DemoScenario = "established" | "newcomer";

// A game achievement as the card receives it.
const achievement = (
  id: string,
  category: string,
  art: string,
  accent: string,
  rarity: string,
  xp: number,
  earnedAt: string,
  name: { he: string; en: string },
  condition: { he: string; en: string }
): Award => ({
  id,
  art,
  category,
  accent_color: accent,
  rarity,
  rank: { basic: 1, advanced: 2, rare: 3, epic: 4, exceptional: 5 }[rarity] ?? 1,
  xp,
  earned_at: earnedAt,
  name,
  description: condition,
  condition,
});

const openingBell = (earnedAt: string) =>
  achievement("the_opening_bell", "first_steps", "flag", "#8FA7C2", "advanced", 50, earnedAt,
    { he: "פעמון הפתיחה", en: "The Opening Bell" },
    { he: "פתיחת תיק השקעות ראשון", en: "Create the first portfolio" });

const momentumRider: Title = {
  id: "momentum_rider", name: "Momentum Rider", category: "market_legends", source_type: "level",
  required_level: 26, tier: 6, icon: "flame", accent_color: "#DAA17F", sort_order: 61, rarity: null,
};

const established: PlayerCardData = {
  player: {
    nickname: "growthhunter",
    first_name: "Roee",
    avatar_url: null,
    avatar_id: "investor",
    bio: "משקיע צמיחה עם חשיבה אנליטית. מתמקד בטכנולוגיה, ביצועים עקביים וניהול סיכון.",
  },
  progression: {
    state: "available",
    value: {
      level: 27, xp: 8420, current_level_xp: 8000, next_level: 28, next_level_xp: 10000,
      thresholds_configured: true, thresholds_provisional: true, next_title_level: 31, active_title: momentumRider,
    },
  },
  social: { followers: 2430, subscribers: 618 },
  stats: {
    portfolios_total: 9,
    portfolios_active: 4,
    average_active_return: { state: "available", value: 0.248 },
    best_portfolio_gain: { state: "available", value: 0.864 },
    top_portfolio: {
      state: "available",
      value: { id: 1, name: "Growth Hunter Alpha", cumulative_return: 0.864 },
    },
    average_month_to_date_return: { state: "available", value: 0.019 },
  },
  competitions: { participations: 18, prize_wins: 3, top_3: 7, first_place: 1 },
  medals: {
    total: 5,
    top: [
      {
        id: "september-champion-2026",
        art: "laurel_trophy",
        rank: 95,
        xp: 1500,
        earned_at: "2026-10-01",
        name: { he: "September Champion 2026", en: "September Champion 2026" },
        description: { he: "מקום ראשון בתחרות התשואה של ספטמבר 2026.", en: "First place in the September 2026 return competition." },
        condition: { he: "לסיים במקום הראשון בתחרות חודשית.", en: "Finish first in a monthly competition." },
      },
      {
        id: "beat-the-market",
        art: "gem",
        rank: 88,
        xp: 1200,
        earned_at: "2026-07-01",
        name: { he: "Beat the Market", en: "Beat the Market" },
        description: { he: "תיק שהכה את מדד S&P 500 לאורך רבעון מלא.", en: "A portfolio that beat the S&P 500 over a full quarter." },
        condition: { he: "תשואה רבעונית גבוהה ממדד הייחוס.", en: "A quarterly return above the benchmark." },
      },
      {
        id: "top-1-percent",
        art: "shield_top_percent",
        rank: 84,
        xp: 1000,
        earned_at: "2026-04-02",
        name: { he: "Top 1% Investor", en: "Top 1% Investor" },
        description: { he: "דירוג בין האחוז העליון של השחקנים.", en: "Ranked among the top 1% of players." },
        condition: { he: "לסיים חודש באחוזון העליון בטבלת הדירוג.", en: "End a month in the top percentile of the leaderboard." },
      },
      {
        id: "risk-master",
        art: "star_shield",
        rank: 76,
        xp: 800,
        earned_at: "2026-02-15",
        name: { he: "Risk Master", en: "Risk Master" },
        description: { he: "תשואה חיובית עם סיכון נמוך לאורך זמן.", en: "Positive returns with low risk, sustained over time." },
        condition: { he: "שישה חודשים של תשואה חיובית בציון סיכון נמוך.", en: "Six months of positive return at a low risk score." },
      },
    ],
  },
  achievements: {
    total: 13,
    top: [
      achievement("one_year_veteran", "dedication", "hourglass", "#83B498", "rare", 100, "2026-03-02",
        { he: "ותיק של שנה", en: "One-Year Veteran" },
        { he: "החזקת תיק פתוח במשך שנה", en: "Keep a portfolio open for 365 days" }),
      achievement("founding_member", "legacy_milestones", "crown", "#C9AB71", "rare", 100, "2025-11-02",
        { he: "חבר מייסד", en: "Founding Member" },
        { he: "הצטרפות בתקופת ההשקה הרשמית", en: "Join during the official launch period" }),
      achievement("three_of_a_kind", "portfolio_lab", "briefcase", "#C5A56C", "advanced", 50, "2025-12-14",
        { he: "שלישייה מנצחת", en: "Three of a Kind" },
        { he: "פתיחת 3 תיקים", en: "Open 3 portfolios" }),
      openingBell("2025-11-03"),
    ],
  },
};

const newcomer: PlayerCardData = {
  player: {
    nickname: "newinvestor",
    first_name: null,
    avatar_url: null,
    avatar_id: null,
    bio: "Learning the ropes, one trade at a time.",
  },
  progression: {
    state: "available",
    value: {
      level: 1, xp: 75, current_level_xp: 0, next_level: null, next_level_xp: null,
      thresholds_configured: false, thresholds_provisional: false, next_title_level: 6, active_title: null,
    },
  },
  social: { followers: 14, subscribers: 0 },
  stats: {
    portfolios_total: 1,
    portfolios_active: 1,
    average_active_return: { state: "locked", reason: "requires_min_active_portfolios" },
    best_portfolio_gain: { state: "locked", reason: "requires_min_active_portfolios" },
    top_portfolio: { state: "locked", reason: "no_active_portfolio_above_threshold" },
    average_month_to_date_return: { state: "available", value: 0.062 },
  },
  competitions: { participations: 0, prize_wins: 0, top_3: 0, first_place: 0 },
  medals: { total: 0, top: [] },
  achievements: { total: 2, top: [openingBell("2026-10-03")] },
};

export const DEMO_PLAYER_CARDS: Record<DemoScenario, PlayerCardData> = { established, newcomer };
