import { CompositionEvent } from "../../api/portfolioDashboard";
import { MessageKey } from "../../i18n/messages";

// Shared by the activity module, its dialog, the composition table and
// Portfolio History, so an action reads the same everywhere.

/** A weight (0-1) as a percentage, or a dash when the holding is not there. */
export const exposure = (w: number | undefined) => (w && w > 0.00005 ? `${(w * 100).toFixed(1)}%` : "—");

/** Date and time, short: "15 Sept 26, 18:30". */
export const whenShort = (at: string, locale: string | undefined) =>
  new Date(at).toLocaleString(locale, { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Date only, for the compact list. */
export const dayShort = (at: string, locale: string | undefined) =>
  new Date(at).toLocaleDateString(locale, { day: "numeric", month: "short" });

export const KIND_LABEL: Record<CompositionEvent["kind"], MessageKey> = {
  added: "ph_added",
  increased: "ph_increased",
  reduced: "ph_reduced",
  removed: "ph_removed",
};
