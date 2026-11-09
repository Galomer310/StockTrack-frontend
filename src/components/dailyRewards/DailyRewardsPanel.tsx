import { CSSProperties, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DAILY_REWARDS_CHANGED, DailyRewards, fetchDailyRewards, openCapitalBoost, TIER_ACCENT, TIER_LABEL } from "../../api/dailyRewards";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { Emblem } from "../progression/emblems";
import "../progression/progression.css";
import "./dailyRewards.css";

/* ===========================================================================
   The daily rewards dashboard (spec section 11).
   ---------------------------------------------------------------------------
   The streak, today's XP, the next XP milestone and the next capital boost,
   with a track of the days left until that boost, and the capital rewards
   waiting to be applied. Everything comes from the server. Compact on the
   Player Card (with a link to the history); full on the rewards page.
   =========================================================================== */

export const DailyRewardsPanel = ({ compact = false }: { compact?: boolean }) => {
  const { t, dir, lang, locale } = useLanguage();
  const [data, setData] = useState<DailyRewards | null>(null);
  const [failed, setFailed] = useState(false);
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);

  const load = useCallback(() => {
    fetchDailyRewards()
      .then((d) => {
        setData(d);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(DAILY_REWARDS_CHANGED, load);
    return () => window.removeEventListener(DAILY_REWARDS_CHANGED, load);
  }, [load]);

  if (failed) return <section className="prg dr-panel" dir={dir} lang={lang}><p className="prg-error">{t("dr_load_failed")}</p></section>;
  if (!data) return <section className="prg dr-panel" dir={dir} lang={lang} aria-busy="true"><p className="prg-muted">{t("loading")}</p></section>;

  const nextCap = data.next_capital;
  // A track from the last capital day to the next: one segment per day.
  const daysLeft = nextCap ? nextCap.day - data.streak : 0;
  const trackLength = nextCap ? Math.max(nextCap.day - nextCap.from_day, 1) : 0;
  const filled = nextCap ? data.streak - nextCap.from_day : 0;
  const capAccent = nextCap ? TIER_ACCENT[nextCap.tier] ?? TIER_ACCENT.weekly : TIER_ACCENT.weekly;

  return (
    <section className={`prg dr-panel${compact ? " is-compact" : ""}`} dir={dir} lang={lang} aria-labelledby="dr-panel-title">
      <header className="dr-panel-head">
        <span className="prg-eyebrow" id="dr-panel-title">{t("dr_daily_rewards")}</span>
        {compact && (
          <Link className="dr-link" to="/player/rewards">
            {t("dr_history_link")}
          </Link>
        )}
      </header>

      <div className="dr-panel-grid">
        <div className="dr-streak">
          <span className="dr-streak-value prg-serif"><bdi dir="ltr">{n(data.streak)}</bdi></span>
          <span className="dr-streak-label">{t(data.streak === 1 ? "dr_streak_one" : "dr_streak_label")}</span>
        </div>

        <dl className="dr-facts">
          <div>
            <dt>{t("dr_today")}</dt>
            <dd>
              {data.today ? (
                <bdi dir="ltr">+{n(data.today.xp)} XP</bdi>
              ) : (
                <span className="prg-muted">{t("dr_not_yet_today")}</span>
              )}
            </dd>
          </div>
          {data.next_xp && (
            <div>
              <dt>{t("dr_next_xp")}</dt>
              <dd>
                {fill(t("dr_day_n"), { n: n(data.next_xp.day) })} · <bdi dir="ltr">{n(data.next_xp.xp)} XP</bdi>
              </dd>
            </div>
          )}
          {nextCap && (
            <div style={{ "--accent": capAccent } as CSSProperties}>
              <dt>{t("dr_next_capital")}</dt>
              <dd>
                {fill(t("dr_day_n"), { n: n(nextCap.day) })} · <bdi dir="ltr" className="dr-accent">+{n(nextCap.pct)}%</bdi>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {nextCap && (
        <div className="dr-track-wrap" style={{ "--accent": capAccent } as CSSProperties}>
          <ol className="dr-track" aria-hidden="true">
            {Array.from({ length: trackLength }, (_, i) => (
              <li key={i} className={i < filled ? "is-done" : i === trackLength - 1 ? "is-goal" : ""} />
            ))}
          </ol>
          <span className="prg-muted prg-small">
            {daysLeft === 1 ? t("dr_boost_tomorrow") : fill(t("dr_boost_in_days"), { n: n(daysLeft) })}
          </span>
        </div>
      )}

      <div className="dr-pending">
        <h3 className="dr-subhead">{t("dr_pending_title")}</h3>
        {data.pending.length === 0 ? (
          <p className="prg-muted prg-small">{t("dr_pending_none")}</p>
        ) : (
          <ul className="dr-pending-list">
            {data.pending.map((r) => (
              <li key={r.id} className="dr-pending-row" style={{ "--accent": TIER_ACCENT[r.tier] ?? TIER_ACCENT.weekly } as CSSProperties}>
                <span className="dr-pending-icon" aria-hidden="true">
                  <Emblem name={r.tier === "quarterly" ? "mogul_crown" : r.tier === "monthly" ? "institution" : "flag"} />
                </span>
                <span className="dr-pending-text">
                  <bdi dir="ltr" className="dr-accent dr-pending-pct">+{n(r.percentage)}%</bdi>
                  <span className="prg-muted prg-small">
                    {t(TIER_LABEL[r.tier] ?? "dr_tier_weekly")} · {fill(t("dr_earned_on_day"), { day: n(r.streak_day) })}
                  </span>
                </span>
                <button type="button" className="dr-btn is-small" onClick={() => openCapitalBoost(r)}>
                  {t("dr_apply_short")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
