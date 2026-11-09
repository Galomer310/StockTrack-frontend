import { TIER_KEYS } from "../../api/professional";
import { fill } from "../../i18n/fill";
import { MessageKey } from "../../i18n/messages";

/* The short text a medal carries (spec 5.5, 13.3): period, figure, subtitle.
   Never the benchmark's name - that lives in the rules and details. */

type T = (k: MessageKey) => string;

const WORDS = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"];
const ROMAN = ["", "", "II", "III", "IV", "V", "VI"];

export const tierName = (t: T, tier: number, decoration = 0, medalId = "") => {
  // A special medal is one-time: it has no tier to name (spec 28).
  if (medalId.startsWith("special_")) return t("pro_special_medal");
  const base = t(TIER_KEYS[Math.min(5, Math.max(1, tier))] as MessageKey);
  // Sovereign II / III are evolutions of the fifth tier (portfolio performance).
  return tier === 5 && decoration >= 2 && medalId === "portfolio_performance" ? `${base} ${ROMAN[decoration] ?? decoration}` : base;
};

const signedPct = (x: number, digits = 1) => `${x >= 0 ? "+" : ""}${(x * 100).toFixed(digits)}%`;

export interface MedalFacts {
  medal_id: string;
  tier: number;
  decoration: number;
  subtitle: string | null;
  figure: number | null;
  figure_kind: "outperformance" | "return" | "months" | "quarters";
  current_streak: number | null;
}

/** The engraved figure: "+6.8%", "100%", "6 months". */
export const figureText = (t: T, f: MedalFacts) => {
  if (f.figure === null) return null;
  if (f.figure_kind === "months") return fill(t("pro_months"), { n: f.figure });
  if (f.figure_kind === "return") return `${Math.round(f.figure * 100)}%`;
  if (f.figure_kind === "quarters") return fill(t("pro_quarters_protected"), { n: f.figure });
  return signedPct(f.figure);
};

/** ANNUAL CHAMPION, CALENDAR SWEEP, COMBO TWO QUARTERS. */
const PHOENIX: MessageKey[] = ["pro_phoenix_1", "pro_phoenix_2", "pro_phoenix_3", "pro_phoenix_4", "pro_phoenix_5"];

export const subtitleText = (t: T, lang: string, f: MedalFacts) => {
  // Each Phoenix tier has its own name (spec 25.2).
  if (f.medal_id === "phoenix_recovery") return t(PHOENIX[Math.min(5, Math.max(1, f.tier)) - 1]);
  if (f.subtitle === "annual_champion") return t("pro_annual_champion");
  if (f.subtitle === "calendar_sweep") return t("pro_calendar_sweep");
  if (f.subtitle === "combo" && f.current_streak && f.current_streak >= 2) {
    return fill(t("pro_combo"), { n: lang === "en" ? WORDS[f.current_streak] ?? String(f.current_streak) : f.current_streak });
  }
  return null;
};
