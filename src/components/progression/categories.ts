import type { Dependency } from "../../api/progression";
import { MessageKey } from "../../i18n/messages";

// How each title category presents itself. The names are part of the
// approved title system and stay in English in both languages, like the
// titles; the tagline under them is translated.
export const TITLE_CATEGORIES = [
  { id: "professional_path", name: "Professional Path", tagline: "prg_tag_professional_path", icon: "mortarboard", accent: "#9DBDE7" },
  { id: "market_legends", name: "Market Legends", tagline: "prg_tag_market_legends", icon: "flame", accent: "#DAA17F" },
  { id: "capital_empire", name: "Capital Empire", tagline: "prg_tag_capital_empire", icon: "crown", accent: "#E4CC91" },
] as const satisfies readonly { id: string; name: string; tagline: MessageKey; icon: string; accent: string }[];

export const categoryOf = (id: string) => TITLE_CATEGORIES.find((c) => c.id === id);

// A special or store title (future) has a category of its own; its name is
// shown as sent, so nothing here has to change when one is added.
export const categoryName = (id: string): string =>
  categoryOf(id)?.name ?? id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const WAITS_FOR: Record<Dependency, MessageKey> = {
  nicknames: "ach_waits_nicknames",
  follows: "ach_waits_follows",
  subscriptions: "ach_waits_subscriptions",
  competitions: "ach_waits_competitions",
};

export const RARITY_TEXT: Record<string, MessageKey> = {
  basic: "rarity_basic",
  advanced: "rarity_advanced",
  rare: "rarity_rare",
  epic: "rarity_epic",
  exceptional: "rarity_exceptional",
};
