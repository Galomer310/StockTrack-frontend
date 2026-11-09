import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchProfessional,
  MAX_DISPLAYED_MEDALS,
  MedalRef,
  MedalView,
  ProAchievement,
  ProfessionalView,
  ProRecord,
  saveMedalDisplay,
} from "../api/professional";
import { Medal } from "../components/medals/Medal";
import { figureText, MedalFacts, subtitleText, tierName } from "../components/medals/format";
import "../components/medals/professional.css";
import { fill, ltr } from "../i18n/fill";
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";

/* ===========================================================================
   Professional Medals & Achievements (spec v1.0, sections 6.2-6.3, 36).
   ---------------------------------------------------------------------------
   The medal collection - current tier, figures, streaks, which portfolio,
   unlock and upgrade history - and the choice of which medals the Player
   Card shows (automatic, or up to four in the player's order). Then what is
   in progress (30-day return windows, live streaks) and every achievement
   record by category, with the portfolio and period that earned it.
   Every figure is the server's; nothing is evaluated here.
   =========================================================================== */

const refKey = (m: MedalRef) => `${m.medal_id}|${m.period_key}`;
const pct = (x: number, d = 1) => `${x >= 0 ? "+" : ""}${(x * 100).toFixed(d)}%`;

const factsOf = (m: MedalView): MedalFacts => ({
  medal_id: m.medal_id,
  tier: m.tier,
  decoration: m.decoration,
  subtitle: m.subtitle,
  figure:
    m.medal_id === "phoenix_recovery"
      ? null
      : m.medal_id === "btm_monthly_combo" || m.medal_id === "green_months" || m.medal_id === "capital_protector"
        ? m.highest_streak
        : m.qualifying_value,
  figure_kind:
    m.medal_id === "portfolio_performance"
      ? "return"
      : m.medal_id === "btm_monthly_combo" || m.medal_id === "green_months"
        ? "months"
        : m.medal_id === "capital_protector"
          ? "quarters"
          : "outperformance",
  current_streak: m.current_streak,
});

const MedalCard = ({ m }: { m: MedalView }) => {
  const { t, lang, locale } = useLanguage();
  const f = factsOf(m);
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const period = m.medal_id === "btm_annual" ? m.period_key : m.relevant_period_label?.[lang] ?? null;
  const streaky = m.medal_id === "btm_monthly_combo" || m.medal_id === "green_months";
  return (
    <li className={`pro-medal tier-${m.tier}`}>
      <Medal icon={m.icon} tier={m.tier} decoration={m.decoration} size={104} label={`${m.name[lang]}, ${tierName(t, m.tier, m.decoration, m.medal_id)}`} />
      <div className="pro-medal-text">
        <h3 dir="auto">{m.name[lang]}</h3>
        <span className="pro-tier">{tierName(t, m.tier, m.decoration, m.medal_id)}</span>
        {period && <bdi className="pro-period">{period}</bdi>}
        {m.medal_id.startsWith("special_") && (
          <span className="pro-period">{fill(t("pro_earned_on"), { date: new Date(`${m.as_of}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) })}</span>
        )}
        {/* "+6.8%" reads left to right; "15 months" / "15 חודשים" follows the page. */}
        {figureText(t, f) && (
          <bdi dir={f.figure_kind === "months" || f.figure_kind === "quarters" ? undefined : "ltr"} className="pro-figure">
            {figureText(t, f)}
          </bdi>
        )}
        {subtitleText(t, lang, f) && <span className="pro-subtitle">{subtitleText(t, lang, f)}</span>}
        <dl className="pro-facts">
          {streaky && (
            <>
              <div><dt>{t("pro_highest")}</dt><dd>{fill(t("pro_months"), { n: m.highest_streak ?? 0 })}</dd></div>
              <div><dt>{t("pro_current")}</dt><dd>{fill(t("pro_months"), { n: m.current_streak ?? 0 })}</dd></div>
            </>
          )}
          {m.medal_id === "btm_quarterly" && (
            <div><dt>{t("pro_streak_quarter")}</dt><dd>{fill(t("pro_quarters_won"), { n: m.highest_streak ?? 0 })}</dd></div>
          )}
          {m.portfolio && (
            <div><dt>{t("pro_portfolio")}</dt><dd dir="auto">{m.portfolio.name}</dd></div>
          )}
        </dl>
        <details className="pro-history">
          <summary>{t("pro_history")}</summary>
          <ol>
            {m.history.map((h, i) => (
              <li key={i}>
                {tierName(t, h.tier, h.decoration, m.medal_id)} · {date(h.at)}
              </li>
            ))}
          </ol>
        </details>
      </div>
    </li>
  );
};

const LockedMedal = ({ c }: { c: ProfessionalView["medal_catalog"][number] }) => {
  const { t, lang } = useLanguage();
  return (
    <li className="pro-medal is-locked">
      <Medal icon={c.icon} tier={3} aura={false} size={104} className="is-locked" />
      <div className="pro-medal-text">
        <h3 dir="auto">{c.name[lang]}</h3>
        <span className="pro-locked">{t("pro_locked")}</span>
        <p className="pro-how">{c.description[lang]}</p>
      </div>
    </li>
  );
};

const DisplayEditor = ({ data, onSaved }: { data: ProfessionalView; onSaved: () => void }) => {
  const { t, lang } = useLanguage();
  const [automatic, setAutomatic] = useState(data.display.automatic);
  const [chosen, setChosen] = useState<MedalRef[]>(data.display.shown);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const byKey = useMemo(() => new Map(data.medals.map((m) => [refKey(m), m])), [data.medals]);
  const label = (r: MedalRef) => {
    const m = byKey.get(refKey(r))!;
    return `${m.name[lang]}${m.medal_id === "btm_annual" ? ` ${m.period_key}` : ""} · ${tierName(t, m.tier, m.decoration, m.medal_id)}`;
  };
  const move = (i: number, d: number) =>
    setChosen((c) => {
      const next = [...c];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
  const save = async (body: Parameters<typeof saveMedalDisplay>[0]) => {
    setState("saving");
    try {
      const r = await saveMedalDisplay(body);
      setAutomatic(r.automatic);
      setChosen(r.shown);
      setState("saved");
      onSaved();
    } catch {
      setState("failed");
    }
  };
  const rest = data.medals.filter((m) => !chosen.some((c) => refKey(c) === refKey(m)));

  return (
    <section className="pro-section pro-display" aria-labelledby="pro-display-title">
      <h2 id="pro-display-title">{t("pro_display")}</h2>
      <p className="pro-note">{t("pro_display_note")}</p>
      <div className="pro-mode" role="radiogroup" aria-label={t("pro_display")}>
        <label>
          <input type="radio" name="pro-mode" checked={automatic} onChange={() => setAutomatic(true)} /> {t("pro_auto")}
        </label>
        <label>
          <input type="radio" name="pro-mode" checked={!automatic} onChange={() => setAutomatic(false)} /> {t("pro_manual")}
        </label>
      </div>
      {!automatic && (
        <>
          <ol className="pro-chosen">
            {chosen.map((r, i) => (
              <li key={refKey(r)}>
                <span dir="auto">{label(r)}</span>
                <span className="pro-row-actions">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${t("pro_up")}: ${label(r)}`}>↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === chosen.length - 1} aria-label={`${t("pro_down")}: ${label(r)}`}>↓</button>
                  <button type="button" onClick={() => setChosen((c) => c.filter((x) => refKey(x) !== refKey(r)))}>{t("pro_remove")}</button>
                </span>
              </li>
            ))}
          </ol>
          {chosen.length === 0 && <p className="pro-note">{t("pro_none_chosen")}</p>}
          {rest.length > 0 && (
            <ul className="pro-available">
              {rest.map((m) => (
                <li key={refKey(m)}>
                  <span dir="auto">{label(m)}</span>
                  <button
                    type="button"
                    disabled={chosen.length >= MAX_DISPLAYED_MEDALS}
                    title={chosen.length >= MAX_DISPLAYED_MEDALS ? t("pro_max_four") : undefined}
                    onClick={() => setChosen((c) => [...c, { medal_id: m.medal_id, period_key: m.period_key }])}
                  >
                    {t("pro_add")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <div className="pro-display-actions">
        <button
          type="button"
          className="pro-primary"
          disabled={state === "saving"}
          onClick={() => save(automatic ? { automatic: true } : { automatic: false, selected: chosen })}
        >
          {t("pro_save")}
        </button>
        {!data.display.automatic && (
          <button type="button" disabled={state === "saving"} onClick={() => save({ automatic: true })}>
            {t("pro_restore")}
          </button>
        )}
        <span role="status" className={`pro-save-state is-${state}`}>
          {state === "saved" ? t("pro_saved") : state === "failed" ? t("pro_save_failed") : ""}
        </span>
      </div>
    </section>
  );
};

const RecordRow = ({ a, r, medalName }: { a: ProAchievement; r: ProRecord; medalName: string | null }) => {
  const { t, lang, locale } = useLanguage();
  const day = new Date(`${r.earned_on}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const versus = r.benchmark_value !== null && r.qualifying_value !== null;
  return (
    <li className="pro-record">
      <div className="pro-record-head">
        <strong dir="auto">{r.name[lang]}</strong>
        <span className="pro-xp">{r.xp_awarded > 0 ? fill(t("pro_xp"), { n: r.xp_awarded }) : t("pro_xp_undecided")}</span>
      </div>
      <p className="pro-record-meta">
        {r.portfolio && <bdi>{fill(t("pro_via"), { name: r.portfolio.name ?? "" })}</bdi>}
        <span>{fill(t("pro_earned_on"), { date: day })}</span>
        {r.details.partial && <span className="pro-tag">{t("pro_partial")}</span>}
        {r.details.via_grace && <span className="pro-tag">{t("pro_via_grace")}</span>}
      </p>
      {versus && (
        <p className="pro-record-result">
          {/* A sentence in the page's language; only the numbers are isolated. */}
          <span>{fill(t("pro_vs_benchmark"), { p: ltr(pct(r.qualifying_value!, 2)), b: ltr(pct(r.benchmark_value!, 2)) })}</span>
          {r.outperformance !== null && <span> · {fill(t("pro_points_above"), { v: ltr((r.outperformance * 100).toFixed(2)) })}</span>}
        </p>
      )}
      {r.details.portfolio_downside !== undefined && r.details.benchmark_downside !== undefined && (
        <p className="pro-record-result">
          {fill(t("pro_downside"), { p: ltr(pct(r.details.portfolio_downside, 2)), b: ltr(pct(r.details.benchmark_downside, 2)) })}
        </p>
      )}
      {r.details.low !== undefined && <p className="pro-note">{fill(t("pro_recovered"), { low: ltr(pct(r.details.low, 1)) })}</p>}
      {(a.id === "btm_quarter" || a.id === "capital_protector") && r.details.medal_eligible === false && <p className="pro-note">{t("pro_partial_quarter")}</p>}
      {medalName && <p className="pro-note">{fill(t("pro_contributes"), { medal: medalName })}</p>}
    </li>
  );
};

const ProfessionalPage = () => {
  const { t, dir, lang, locale } = useLanguage();
  const [data, setData] = useState<ProfessionalView | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    fetchProfessional()
      .then((d) => {
        setData(d);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, []);
  useEffect(load, [load]);

  const day = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const medalNames = useMemo(() => new Map((data?.medal_catalog ?? []).map((m) => [m.id, m.name[lang]])), [data, lang]);
  const totalRecords = data?.achievements.reduce((s, a) => s + a.records.length, 0) ?? 0;

  return (
    <div className="pro-page" dir={dir} lang={lang}>
      <Link className="pro-back" to="/player">{t("ach_back")}</Link>
      <h1>{t("pro_title")}</h1>
      <p className="pro-intro">{t("pro_intro")}</p>
      {failed && <p className="error">{t("pro_load_failed")}</p>}
      {!data && !failed && <p className="stock-panel-loading">{t("loading")}</p>}
      {data && (
        <>
          <section className="pro-section" aria-labelledby="pro-medals-title">
            <h2 id="pro-medals-title">{t("pro_medals")}</h2>
            <ul className="pro-medals">
              {data.medal_catalog.filter((c) => !c.is_special).flatMap((c) => {
                const owned = data.medals.filter((m) => m.medal_id === c.id);
                return owned.length ? owned.map((m) => <MedalCard key={refKey(m)} m={m} />) : [<LockedMedal key={c.id} c={c} />];
              })}
            </ul>
          </section>

          <section className="pro-section" aria-labelledby="pro-special-title">
            <h2 id="pro-special-title">{t("pro_special_medals")}</h2>
            <p className="pro-note">{t("pro_special_note")}</p>
            <ul className="pro-medals">
              {data.medal_catalog.filter((c) => c.is_special).map((c) => {
                const owned = data.medals.find((m) => m.medal_id === c.id);
                return owned ? <MedalCard key={c.id} m={owned} /> : <LockedMedal key={c.id} c={c} />;
              })}
            </ul>
          </section>

          {data.medals.length > 0 && <DisplayEditor key={data.medals.map(refKey).join()} data={data} onSaved={load} />}

          {(data.progress.windows.length > 0 || data.progress.portfolios.length > 0) && (
            <section className="pro-section" aria-labelledby="pro-progress-title">
              <h2 id="pro-progress-title">{t("pro_in_progress")}</h2>
              {data.progress.windows.length > 0 && (
                <ul className="pro-windows">
                  {data.progress.windows.map((w) => (
                    <li key={`${w.portfolio.id}-${w.threshold}`}>
                      <strong>{fill(t("pro_window_title"), { pct: Math.round(w.threshold * 100) })}</strong>
                      <bdi className="pro-record-meta">{fill(t("pro_via"), { name: w.portfolio.name })}</bdi>
                      <span>{fill(t("pro_window_started"), { date: day(w.start) })}</span>
                      <span>{w.seven_met ? t("pro_window_seven") : fill(t("pro_window_streak"), { n: w.best_streak })}</span>
                      <span>{w.day30_result === "below" ? fill(t("pro_window_grace"), { date: day(w.grace_until) }) : fill(t("pro_window_day30"), { date: day(w.day30) })}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pro-scroll">
              <table className="pro-streaks">
                <caption>{t("pro_streaks")}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t("pro_portfolio")}</th>
                    <th scope="col">{t("pro_streak_btm")}</th>
                    <th scope="col">{t("pro_streak_green")}</th>
                    <th scope="col">{t("pro_streak_quarter")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.progress.portfolios.map((p) => (
                    <tr key={p.portfolio.id}>
                      <th scope="row">
                        <bdi>{p.portfolio.name}</bdi>
                        {p.final_through && <span className="pro-record-meta"> · {fill(t("pro_evaluated_through"), { date: day(p.final_through) })}</span>}
                      </th>
                      <td>{p.btm_month_streak}</td>
                      <td>{p.green_streak}</td>
                      <td>{p.btm_quarter_streak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </section>
          )}

          <section className="pro-section" aria-labelledby="pro-ach-title">
            <h2 id="pro-ach-title">{t("pro_achievements")}</h2>
            {totalRecords === 0 && <p className="pro-note">{t("pro_nothing_yet")}</p>}
            {data.categories.map((c) => {
              const types = data.achievements.filter((a) => a.category_id === c.id);
              return (
                <div key={c.id} className="pro-category">
                  <h3>
                    {c.name[lang]}
                    {c.status === "coming_soon" && <span className="pro-tag">{t("pro_coming_soon")}</span>}
                  </h3>
                  {types.map((a) => (
                    <details key={a.id} className="pro-type" open={a.records.length > 0 && a.records.length <= 3}>
                      <summary>
                        <span>{t(`pro_type_${a.id}` as MessageKey)}</span>
                        <span className="pro-count">{a.records.length || t("pro_no_records")}</span>
                      </summary>
                      <ul>
                        {a.records.map((r) => (
                          <RecordRow key={r.id} a={a} r={r} medalName={a.contributes_to_medal ? medalNames.get(a.contributes_to_medal) ?? null : null} />
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
};

export default ProfessionalPage;
