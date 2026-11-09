import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import {
  acknowledgeToday,
  announceDailyRewardsChanged,
  CapitalReward,
  checkIn,
  DAILY_CHECKIN_REQUEST,
  OPEN_CAPITAL_BOOST,
  TIER_ACCENT,
} from "../../api/dailyRewards";
import { requestProgressionCheck } from "../../api/progression";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { Emblem } from "../progression/emblems";
import { CapitalBoostDialog } from "./CapitalBoostDialog";
import "../progression/progression.css";
import "./dailyRewards.css";

/* ===========================================================================
   The day's login, for the signed-in player.
   ---------------------------------------------------------------------------
   Mounted once, beside the routes. Checks in when the app opens, when the
   tab comes back into view, and every half hour while it stays open (so a
   session left open past midnight counts the new day). The server decides
   whether the day is new; repeats change nothing.

   The first time a day's reward is seen: a light notice with the XP and the
   streak, and - on a capital day - the capital boost dialog. The notice is
   then acknowledged, so a refresh does not repeat it. The XP may level the
   player up, so the progression watcher is asked to look.
   =========================================================================== */

const RECHECK_MS = 30 * 60 * 1000;
const SHOW_MS = 5200;

type Notice = { streak: number; xp: number; capital: number | null; tier: string | null };

export const DailyRewardsWatcher = () => {
  const { t, dir, lang, locale } = useLanguage();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [boost, setBoost] = useState<{ reward: CapitalReward; fresh: boolean } | null>(null);
  const inFlight = useRef(false);
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);

  const run = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const r = await checkIn();
      if (r.counted) {
        requestProgressionCheck();
        announceDailyRewardsChanged();
      }
      if (r.today?.unseen) {
        const cap = r.today.capital_reward;
        setNotice({ streak: r.today.streak_day, xp: r.today.xp, capital: cap?.percentage ?? null, tier: cap?.tier ?? null });
        if (cap && cap.status === "pending") setBoost({ reward: cap, fresh: true });
        acknowledgeToday().catch(() => undefined);
      }
    } catch {
      // Never worth an error on someone else's page; the next check retries.
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    run();
    const onVisible = () => document.visibilityState === "visible" && run();
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(run, RECHECK_MS);
    window.addEventListener(DAILY_CHECKIN_REQUEST, run);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
      window.removeEventListener(DAILY_CHECKIN_REQUEST, run);
    };
  }, [run]);

  // Any screen can open the dialog for a pending reward.
  useEffect(() => {
    const open = (e: Event) => setBoost({ reward: (e as CustomEvent<CapitalReward>).detail, fresh: false });
    window.addEventListener(OPEN_CAPITAL_BOOST, open);
    return () => window.removeEventListener(OPEN_CAPITAL_BOOST, open);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <>
      <div className="prg dr-notices" dir={dir} lang={lang} aria-live="polite">
        {notice && (
          <div
            className="prg-notice dr-notice"
            role="status"
            style={{ "--accent": notice.tier ? TIER_ACCENT[notice.tier] : "#D9BE89" } as CSSProperties}
          >
            <span className="prg-notice-icon" aria-hidden="true">
              <Emblem name="hourglass" />
            </span>
            <span className="prg-notice-text">
              <span className="prg-eyebrow">{t("dr_daily_reward")}</span>
              <span className="prg-notice-name prg-serif">{fill(t("dr_streak_day"), { n: n(notice.streak) })}</span>
              <bdi className="prg-notice-xp" dir="ltr">
                +{n(notice.xp)} XP{notice.capital !== null ? ` · +${n(notice.capital)}%` : ""}
              </bdi>
            </span>
            <button type="button" className="prg-notice-close" onClick={() => setNotice(null)} aria-label={t("close")}>
              ×
            </button>
          </div>
        )}
      </div>
      <CapitalBoostDialog reward={boost?.reward ?? null} fresh={boost?.fresh ?? false} onClose={() => setBoost(null)} />
    </>
  );
};
