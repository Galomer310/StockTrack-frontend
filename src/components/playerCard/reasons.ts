import type { CardValue, LockReason, UnavailableReason } from "../../api/playerCard";
import { MessageKey } from "../../i18n/messages";

// The words for each reason a figure is withheld, shared by every place that
// shows one so a locked value reads the same everywhere on the card.

const LOCK_TEXT: Record<LockReason, MessageKey> = {
  requires_min_active_portfolios: "lock_min_active",
  no_active_portfolio_above_threshold: "lock_top_threshold",
};

const UNAVAILABLE_TEXT: Record<UnavailableReason, MessageKey> = {
  missing_data: "unavailable_missing",
  no_active_portfolios: "unavailable_none",
  not_defined: "unavailable_not_defined",
};

// The message key for a withheld value; null when the value is available.
export const reasonKey = (value: CardValue<unknown>): MessageKey | null => {
  if (value.state === "locked") return LOCK_TEXT[value.reason];
  if (value.state === "unavailable") return UNAVAILABLE_TEXT[value.reason];
  return null;
};
