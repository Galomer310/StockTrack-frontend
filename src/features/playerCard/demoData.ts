/* ===========================================================================
   Demo data for the Player Card.
   ---------------------------------------------------------------------------
   Kept apart from the components, as the spec requires, and in exactly the
   shape the backend will return, so swapping it out touches only
   src/api/playerCard.ts.

   Illustrative values only. Nothing here is the medal bank, the achievement
   bank, the title bank or an XP table - none of those is defined yet - and
   the figures are not the reference image's sample values hard-coded into
   components.

   Two players: an established one (/player?demo=1) and a new one whose card
   shows the locked and empty states (/player?demo=new). Without ?demo the
   page shows the signed-in player's real card.
   =========================================================================== */

import type { Award, PlayerCardData } from "../../api/playerCard";

export type DemoScenario = "established" | "newcomer";

const firstTrade = (earnedAt: string): Award => ({
  id: "first-trade",
  art: "hex_blue",
  rank: 20,
  xp: 50,
  earned_at: earnedAt,
  name: { he: "First Trade", en: "First Trade" },
  description: { he: "הקנייה הראשונה בפלטפורמה.", en: "A first purchase on the platform." },
  condition: { he: "לבצע קנייה ראשונה.", en: "Make a first purchase." },
});

const established: PlayerCardData = {
  player: {
    nickname: "growthhunter",
    first_name: "Roee",
    avatar_url: null,
    bio: "משקיע צמיחה עם חשיבה אנליטית. מתמקד בטכנולוגיה, ביצועים עקביים וניהול סיכון.",
  },
  progression: {
    state: "available",
    value: { level: 27, title: "Elite Investor", xp: 8420, next_level_xp: 10000, next_level: 28, next_title: "Master Strategist" },
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
    total: 12,
    top: [
      {
        id: "first-100-subscribers",
        art: "hex_blue",
        rank: 90,
        xp: 600,
        earned_at: "2026-05-30",
        name: { he: "First 100 Subscribers", en: "First 100 Subscribers" },
        description: { he: "הגעה ל־100 מנויים משלמים.", en: "Reached 100 paid subscribers." },
        condition: { he: "100 מנויים משלמים פעילים.", en: "100 active paid subscribers." },
      },
      {
        id: "community-builder",
        art: "hex_green",
        rank: 80,
        xp: 400,
        earned_at: "2026-03-12",
        name: { he: "Community Builder", en: "Community Builder" },
        description: { he: "פעילות קהילתית עקבית בפיד.", en: "Consistent activity in the community feed." },
        condition: { he: "50 תגובות שקיבלו תגובה חוזרת.", en: "50 comments that drew a reply." },
      },
      {
        id: "veteran-player",
        art: "hex_purple",
        rank: 70,
        xp: 300,
        earned_at: "2026-03-02",
        name: { he: "Veteran Player", en: "Veteran Player" },
        description: { he: "שנה שלמה של פעילות בפלטפורמה.", en: "A full year of activity on the platform." },
        condition: { he: "שנה מפתיחת התיק הראשון.", en: "One year since the first portfolio opened." },
      },
      {
        id: "competition-explorer",
        art: "hex_gold",
        rank: 60,
        xp: 250,
        earned_at: "2025-11-30",
        name: { he: "Competition Explorer", en: "Competition Explorer" },
        description: { he: "השתתפות בחמש תחרויות שונות.", en: "Entered five different competitions." },
        condition: { he: "חמש השתתפויות בתחרויות.", en: "Five competition entries." },
      },
    ],
  },
};

const newcomer: PlayerCardData = {
  player: {
    nickname: "newinvestor",
    first_name: null,
    avatar_url: null,
    bio: "Learning the ropes, one trade at a time.",
  },
  progression: {
    state: "available",
    value: { level: 3, title: "Rookie", xp: 340, next_level_xp: 500, next_level: 4, next_title: "Apprentice" },
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
  achievements: { total: 1, top: [firstTrade("2026-10-03")] },
};

export const DEMO_PLAYER_CARDS: Record<DemoScenario, PlayerCardData> = { established, newcomer };
