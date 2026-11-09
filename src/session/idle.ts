/* ===========================================================================
   Signing out after inactivity.
   ---------------------------------------------------------------------------
   A signed-in player who does nothing for IDLE_LIMIT_MS is signed out.
   "Doing something" is any pointer, key, wheel, scroll or touch input in any
   tab of the site. The moment of the last input is kept in localStorage, so
   every open tab shares one clock: working in one tab keeps the others
   signed in, and the clock survives closing the browser - coming back after
   the limit finds the session already over (authSlice checks on startup).

   Timing is always "now minus the stored moment", never a counter, so a
   sleeping laptop or a throttled background tab cannot stretch the limit.
   =========================================================================== */

export const IDLE_LIMIT_MS = 15 * 60 * 1000;
/** The warning shows for the last minute. */
export const IDLE_WARNING_MS = 60 * 1000;

const LAST_ACTIVITY_KEY = "stocktrack_last_activity";
const SIGNED_OUT_NOTICE_KEY = "stocktrack_idle_signed_out";

export const readLastActivity = (): number | null => {
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    const at = raw === null ? NaN : Number(raw);
    return Number.isFinite(at) ? at : null;
  } catch {
    return null;
  }
};

export const markActivity = (now: number = Date.now()) => {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  } catch {
    // Storage can be unavailable; the watcher then runs on its own memory.
  }
};

/**
 * Milliseconds left before the session ends for inactivity. With no record
 * of activity at all, the session is treated as expired: a stored session
 * nobody can vouch for is not kept.
 */
export const idleRemaining = (now: number = Date.now(), last: number | null = readLastActivity()): number =>
  last === null ? 0 : last + IDLE_LIMIT_MS - now;

/** Leaves a note for the login page to explain why the player is there. */
export const noteIdleSignOut = () => {
  try {
    sessionStorage.setItem(SIGNED_OUT_NOTICE_KEY, "1");
  } catch {
    // Best effort.
  }
};

/** Reads and clears that note. */
export const takeIdleSignOutNote = (): boolean => {
  try {
    const had = sessionStorage.getItem(SIGNED_OUT_NOTICE_KEY) === "1";
    sessionStorage.removeItem(SIGNED_OUT_NOTICE_KEY);
    return had;
  } catch {
    return false;
  }
};
