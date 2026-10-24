/* ===========================================================================
   Demo progression for /player?demo=1 and ?demo=new.
   ---------------------------------------------------------------------------
   Same shapes as the server's answers, built from the generated catalog
   copy. Illustrative only: the levels, XP and unlocked achievements below
   are not an XP table. A title chosen here lasts until the page reloads.
   =========================================================================== */

import type { AchievementCollection, Achievement, TitleCollection } from "../../api/progression";
import type { DemoScenario } from "../playerCard/demoData";
import { DEMO_ACHIEVEMENT_CATEGORIES, DEMO_ACHIEVEMENTS, DEMO_TITLES } from "./demoCatalog";

const LEVEL: Record<DemoScenario, number> = { established: 27, newcomer: 1 };
const active: Record<DemoScenario, string | null> = { established: "momentum_rider", newcomer: null };

// Unlocked achievements, and measurable progress on some of the rest.
const UNLOCKED: Record<DemoScenario, string[]> = {
  established: [
    "welcome_to_the_market", "the_introduction", "the_opening_bell", "a_title_to_remember", "the_second_act",
    "three_of_a_kind", "still_in_the_game", "playing_the_long_game", "the_half_year_mark", "one_year_veteran",
    "double_anchor", "the_first_five", "founding_member",
  ],
  newcomer: ["welcome_to_the_market", "the_opening_bell"],
};
const PROGRESS: Record<DemoScenario, Record<string, number>> = {
  established: { high_five: 3, the_two_year_club: 410, the_trophy_case: 13, the_grand_tour: 3 },
  newcomer: { the_second_act: 1, still_in_the_game: 9, the_introduction: 1, the_first_five: 2 },
};

export const demoTitles = (scenario: DemoScenario): TitleCollection => {
  const level = LEVEL[scenario];
  return {
    level,
    active_title_id: active[scenario],
    titles: DEMO_TITLES.map((t) => ({
      ...t,
      unlocked: t.required_level <= level,
      unlocked_at: t.required_level <= level ? "2026-01-15T10:00:00.000Z" : null,
    })),
  };
};

export const demoSelectTitle = (scenario: DemoScenario, titleId: string): TitleCollection => {
  const title = DEMO_TITLES.find((t) => t.id === titleId);
  if (title && title.required_level <= LEVEL[scenario]) active[scenario] = titleId;
  return demoTitles(scenario);
};

export const demoAchievements = (scenario: DemoScenario): AchievementCollection => {
  const unlocked = new Set(UNLOCKED[scenario]);
  const blocked = (category: string): Achievement["blocked_by"] =>
    category === "exploration" || category === "community_influence"
      ? ["follows"]
      : category === "the_arena"
        ? ["competitions"]
        : [];
  const achievements: Achievement[] = DEMO_ACHIEVEMENTS.map((a) => {
    const done = unlocked.has(a.id);
    const current = PROGRESS[scenario][a.id];
    const target = a.target_value ?? (a.id === "the_introduction" ? 2 : 0);
    return {
      id: a.id,
      category_id: a.category_id,
      name: a.name,
      description: a.description,
      xp_reward: a.xp_reward,
      rarity: a.rarity,
      icon: a.icon,
      state: done ? "unlocked" : current ? "in_progress" : "locked",
      progress: current !== undefined && target ? { current, target } : null,
      blocked_by: done || current !== undefined ? [] : blocked(a.category_id),
      unlocked_at: done ? "2026-03-02T09:00:00.000Z" : null,
      xp_awarded: done ? a.xp_reward : null,
    };
  });
  return {
    totals: {
      total: achievements.length,
      unlocked: unlocked.size,
      xp_earned: achievements.reduce((sum, a) => sum + (a.xp_awarded ?? 0), 0),
    },
    categories: DEMO_ACHIEVEMENT_CATEGORIES.map((c) => ({
      id: c.id,
      name: { en: c.name_en, he: c.name_he },
      icon: c.icon,
      accent_color: c.accent_color,
      total: achievements.filter((a) => a.category_id === c.id).length,
      unlocked: achievements.filter((a) => a.category_id === c.id && a.state === "unlocked").length,
    })),
    achievements,
  };
};
