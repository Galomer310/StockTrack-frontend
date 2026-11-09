import { CSSProperties, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DAILY_REWARDS_CHANGED, fetchRewardsHistory, RewardsHistory, TIER_ACCENT, TIER_LABEL } from "../api/dailyRewards";
import { money } from "../api/social";
import { DailyRewardsPanel } from "../components/dailyRewards/DailyRewardsPanel";
import { fill } from "../i18n/fill";
import { useLanguage } from "../i18n/LanguageContext";
import "../components/progression/progression.css";
import "../components/dailyRewards/dailyRewards.css";

/* ===========================================================================
   Daily rewards: the dashboard and the full history (spec sections 11, 15).
   Capital rewards first - each with its message and, once applied, the
   portfolio, its value and capital base before and after, and the amount
   added - then every counted login day with its streak day and XP.
   =========================================================================== */

const LOGINS_SHOWN = 60;

export default function DailyRewardsPage() {
  const { t, dir, lang, locale } = useLanguage();
  const [history, setHistory] = useState<RewardsHistory | null>(null);
  const [failed, setFailed] = useState(false);
  const [allLogins, setAllLogins] = useState(false);
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const date = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(locale);

  const load = useCallback(() => {
    fetchRewardsHistory()
      .then(setHistory)
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(DAILY_REWARDS_CHANGED, load);
    return () => window.removeEventListener(DAILY_REWARDS_CHANGED, load);
  }, [load]);

  const logins = history ? (allLogins ? history.logins : history.logins.slice(0, LOGINS_SHOWN)) : [];

  return (
    <div className="prg prg-page" dir={dir} lang={lang}>
      <div className="prg-page-wrap dr-page">
        <Link className="prg-back" to="/player">
          {t("ach_back")}
        </Link>
        <header className="prg-page-head">
          <span className="prg-eyebrow">{t("dr_tagline")}</span>
          <h1 className="prg-serif">{t("dr_daily_rewards_title")}</h1>
          <p className="prg-muted">{t("dr_intro")}</p>
        </header>

        <DailyRewardsPanel />

        <section className="dr-history" aria-labelledby="dr-cap-history">
          <h2 id="dr-cap-history" className="dr-subhead">{t("dr_capital_history")}</h2>
          {failed && <p className="prg-error" role="alert">{t("dr_load_failed")}</p>}
          {!history && !failed && <p className="prg-muted" role="status">{t("loading")}</p>}
          {history && history.capital_rewards.length === 0 && <p className="prg-muted prg-small">{t("dr_capital_history_none")}</p>}
          {history && history.capital_rewards.length > 0 && (
            <ul className="dr-history-list">
              {history.capital_rewards.map((r) => (
                <li key={r.id} className="dr-history-row" style={{ "--accent": TIER_ACCENT[r.tier] ?? TIER_ACCENT.weekly } as CSSProperties}>
                  <div className="dr-history-top">
                    <bdi dir="ltr" className="dr-accent dr-pending-pct">+{n(r.percentage)}%</bdi>
                    <span className="prg-small">{t(TIER_LABEL[r.tier] ?? "dr_tier_weekly")}</span>
                    <span className="prg-muted prg-small">
                      {date(r.login_date)} · {fill(t("dr_day_n"), { n: n(r.streak_day) })}
                    </span>
                    <span className={`prg-chip dr-status is-${r.status}`}>{t(r.status === "pending" ? "dr_status_pending" : "dr_status_redeemed")}</span>
                  </div>
                  {r.message && <p className="dr-message prg-serif">{r.message[lang]}</p>}
                  {r.status === "redeemed" && r.value_before !== null && (
                    <dl className="dr-figures dr-figures-history">
                      <div>
                        <dt>{t("dr_portfolio")}</dt>
                        <dd><bdi>{r.portfolio?.name ?? "—"}</bdi></dd>
                      </div>
                      <div>
                        <dt>{t("dr_value_before_after")}</dt>
                        <dd><bdi dir="ltr">{money(r.value_before)} → {money(r.value_after ?? 0)}</bdi></dd>
                      </div>
                      <div>
                        <dt>{t("dr_base_before_after")}</dt>
                        <dd><bdi dir="ltr">{money(r.base_before ?? 0)} → {money(r.base_after ?? 0)}</bdi></dd>
                      </div>
                      <div>
                        <dt>{t("dr_capital_added")}</dt>
                        <dd className="dr-accent"><bdi dir="ltr">+{money(r.capital_added ?? 0)}</bdi></dd>
                      </div>
                    </dl>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dr-history" aria-labelledby="dr-xp-history">
          <h2 id="dr-xp-history" className="dr-subhead">{t("dr_xp_history")}</h2>
          {history && history.logins.length === 0 && <p className="prg-muted prg-small">{t("dr_xp_history_none")}</p>}
          {history && history.logins.length > 0 && (
            <>
              <table className="dr-table">
                <thead>
                  <tr>
                    <th scope="col">{t("dr_date")}</th>
                    <th scope="col">{t("dr_streak_col")}</th>
                    <th scope="col">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.map((l) => (
                    <tr key={l.date}>
                      <td>{date(l.date)}</td>
                      <td><bdi dir="ltr">{n(l.streak_day)}</bdi></td>
                      <td><bdi dir="ltr">+{n(l.xp)}</bdi></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!allLogins && history.logins.length > LOGINS_SHOWN && (
                <button type="button" className="prg-quiet" onClick={() => setAllLogins(true)}>
                  {t("dr_show_all")}
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
