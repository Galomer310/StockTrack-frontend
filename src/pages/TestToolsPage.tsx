import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { announceDailyRewardsChanged, requestDailyCheckIn } from "../api/dailyRewards";
import { announceProgressionChanged, requestProgressionCheck } from "../api/progression";
import { fetchTesterState, runTool, TesterState, ToolError } from "../api/testTools";
import { fill } from "../i18n/fill";
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";
import "../components/progression/progression.css";
import "./testTools.css";

/* ===========================================================================
   The test player's panel (decided by Gal 2026-11-09).
   ---------------------------------------------------------------------------
   For the one test account only: jump through streak days, add XP or raise
   the level, replay title ceremonies and achievement notices, lift the
   username lock, run the valuation job, and reset. After each tool the app
   checks for news exactly as it does for a player, so the daily notice, the
   capital boost dialog, achievement notices and the title ceremony appear
   the way a player would see them. Resets ask twice.
   =========================================================================== */

type Status = { kind: "ok" | "error"; text: string } | null;

export default function TestToolsPage() {
  const { t, dir, lang } = useLanguage();
  const [state, setState] = useState<TesterState | null | undefined>(undefined);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [day, setDay] = useState("7");
  const [amount, setAmount] = useState("100");
  const [level, setLevel] = useState("6");
  const [confirm, setConfirm] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchTesterState()
      .then(setState)
      .catch(() => setState(null));
  }, []);
  useEffect(load, [load]);

  const run = async (id: string, path: string, body: object, done: MessageKey, after: "daily" | "progress" | "none") => {
    setBusy(id);
    setStatus(null);
    setConfirm(null);
    try {
      await runTool(path, body);
      setStatus({ kind: "ok", text: t(done) });
      if (after === "daily") {
        requestDailyCheckIn();
        announceDailyRewardsChanged();
      }
      if (after !== "none") {
        requestProgressionCheck();
        announceProgressionChanged();
      }
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof ToolError ? err.message : t("tt_failed") });
    } finally {
      setBusy(null);
      load();
    }
  };

  // Destructive tools: the first click arms, the second runs.
  const armed = (id: string, action: () => void) => () => {
    if (confirm === id) action();
    else setConfirm(id);
  };

  if (state === undefined) return <div className="prg prg-page tt-page" dir={dir} lang={lang}><p className="prg-muted prg-center">{t("loading")}</p></div>;
  if (state === null) {
    return (
      <div className="prg prg-page tt-page" dir={dir} lang={lang}>
        <div className="prg-page-wrap">
          <p className="prg-muted prg-center tt-denied">{t("tt_not_tester")}</p>
        </div>
      </div>
    );
  }

  const d = state.daily;
  const btn = (id: string, label: string, onClick: () => void, extra = "") => (
    <button type="button" className={`tt-btn ${extra}`} onClick={onClick} disabled={busy !== null}>
      {busy === id ? t("tt_working") : label}
    </button>
  );

  return (
    <div className="prg prg-page tt-page" dir={dir} lang={lang}>
      <div className="prg-page-wrap">
        <Link className="prg-back" to="/player">{t("ach_back")}</Link>
        <header className="prg-page-head">
          <span className="prg-eyebrow">{t("tt_eyebrow")}</span>
          <h1 className="prg-serif">{t("tt_title")}</h1>
          <p className="prg-muted">{t("tt_intro")}</p>
          <p className="prg-small tt-account"><bdi dir="ltr">{state.email}</bdi></p>
        </header>

        <section className="tt-state" aria-label={t("tt_state")}>
          <div><span>{t("tt_streak")}</span><strong>{d.streak}</strong></div>
          <div><span>{t("tt_today")}</span><strong><bdi dir="ltr">{d.today ? `+${d.today.xp} XP` : "—"}</bdi></strong></div>
          <div><span>{t("tt_level")}</span><strong>{state.level ?? "—"}</strong></div>
          <div><span>{t("tt_xp")}</span><strong><bdi dir="ltr">{state.xp.total}</bdi></strong><em>{fill(t("tt_xp_tests"), { n: state.xp.from_tests })}</em></div>
          <div><span>{t("tt_achievements")}</span><strong>{state.achievements.unlocked}</strong></div>
          <div><span>{t("tt_pending_capital")}</span><strong>{d.pending.length}</strong></div>
          <div><span>{t("tt_username")}</span><strong><bdi dir="auto">{state.nickname ? `@${state.nickname}` : "—"}</bdi></strong><em>{state.nickname_locked ? t("tt_locked") : t("tt_unlocked")}</em></div>
          <div><span>{t("tt_portfolios")}</span><strong>{state.portfolios}</strong></div>
        </section>

        <p className={`tt-status ${status ? `is-${status.kind}` : ""}`} role="status" aria-live="polite">{status?.text ?? " "}</p>

        <div className="tt-grid">
          <section className="tt-card">
            <h2>{t("tt_daily")}</h2>
            <p className="prg-muted prg-small">{t("tt_daily_help")}</p>
            <div className="tt-row">
              {btn("next", t("tt_next_day"), () => run("next", "/daily/next-day", {}, "tt_done_day", "daily"))}
              {btn("miss", t("tt_miss_day"), () => run("miss", "/daily/miss-day", {}, "tt_done_day", "daily"))}
            </div>
            <div className="tt-row">
              <label className="tt-field">
                <span>{t("tt_jump_to")}</span>
                <input type="number" min={1} max={1000} value={day} onChange={(e) => setDay(e.target.value)} />
              </label>
              {btn("jump", t("tt_go"), () => run("jump", "/daily/jump", { day: Number(day) }, "tt_done_day", "daily"), "is-primary")}
            </div>
            <div className="tt-row tt-quick">
              {[7, 14, 30, 90, 150, 210].map((n) => (
                <button key={n} type="button" className="tt-chip" disabled={busy !== null} onClick={() => run(`jump${n}`, "/daily/jump", { day: n }, "tt_done_day", "daily")}>
                  {fill(t("tt_day_n"), { n })}
                </button>
              ))}
            </div>
          </section>

          <section className="tt-card">
            <h2>{t("tt_progress")}</h2>
            <p className="prg-muted prg-small">{state.thresholds_configured ? t("tt_progress_help") : t("tt_no_thresholds")}</p>
            <div className="tt-row">
              <label className="tt-field">
                <span>{t("tt_add_xp")}</span>
                <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </label>
              {btn("xp", t("tt_add"), () => run("xp", "/xp/add", { amount: Number(amount) }, "tt_done_xp", "progress"), "is-primary")}
            </div>
            <div className="tt-row">
              <label className="tt-field">
                <span>{t("tt_raise_level")}</span>
                <input type="number" min={2} max={100} value={level} onChange={(e) => setLevel(e.target.value)} />
              </label>
              {btn("level", t("tt_go"), () => run("level", "/xp/level", { level: Number(level) }, "tt_done_level", "progress"), "is-primary")}
            </div>
            <div className="tt-row">
              {btn("cer", fill(t("tt_replay_ceremonies"), { n: state.ceremonies_pending }), () => run("cer", "/titles/replay-ceremonies", {}, "tt_done_replay", "progress"))}
            </div>
          </section>

          <section className="tt-card">
            <h2>{t("tt_achievements")}</h2>
            <p className="prg-muted prg-small">{t("tt_achievements_help")}</p>
            <div className="tt-row">
              {btn("notices", t("tt_replay_notices"), () => run("notices", "/achievements/replay-notices", {}, "tt_done_replay", "progress"))}
              {btn("achreset", t("tt_reset_achievements"), () => run("achreset", "/achievements/reset", {}, "tt_done_ach_reset", "progress"))}
            </div>
          </section>

          <section className="tt-card">
            <h2>{t("tt_limits")}</h2>
            <p className="prg-muted prg-small">{t("tt_limits_help")}</p>
            <div className="tt-row">
              {btn("lock", t("tt_reset_lock"), () => run("lock", "/limits/reset-username-lock", {}, "tt_done_lock", "none"))}
              {btn("val", t("tt_run_valuation"), () => run("val", "/limits/run-valuation", {}, "tt_done_valuation", "none"))}
            </div>
            <div className="tt-row tt-danger">
              {btn("rp", confirm === "rp" ? t("tt_confirm") : t("tt_reset_progress"), armed("rp", () => run("rp", "/reset/progress", {}, "tt_done_reset", "progress")), "is-danger")}
              {btn("rn", confirm === "rn" ? t("tt_confirm") : t("tt_reset_new"), armed("rn", () => run("rn", "/reset/new-player", {}, "tt_done_reset", "progress")), "is-danger")}
            </div>
            <p className="prg-muted prg-small">{t("tt_reset_help")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
