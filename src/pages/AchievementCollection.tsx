import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Achievement,
  AchievementCollection as Collection,
  fetchAchievements,
  PROGRESSION_CHANGED,
} from "../api/progression";
import { RARITY_TEXT, WAITS_FOR } from "../components/progression/categories";
import { Badge, BadgeIcon, Rarity } from "../components/progression/Badge";
import "../components/progression/achievements.css";
import { fill } from "../i18n/fill";
import { useLanguage } from "../i18n/LanguageContext";

/* ===========================================================================
   Game Achievement Collection, design B (patch badges).
   ---------------------------------------------------------------------------
   One line of totals, the rarity legend (colour = rarity, never category),
   then every category as a grid of badges. A badge not earned yet is dashed;
   one under way shows its progress bar. Every state, progress figure and XP
   value comes from the server; nothing is evaluated here. Achievements that
   wait for a system the platform does not have yet say so instead of 0.

   Reached from the Player Card. ?demo=1 or ?demo=new shows demo data.
   =========================================================================== */

const RARITIES: Rarity[] = ["basic", "advanced", "rare", "epic", "exceptional"];
// A sample badge for each rarity in the legend.
const SAMPLES: Record<Rarity, string> = {
  basic: "welcome_to_the_market",
  advanced: "three_of_a_kind",
  rare: "word_on_the_street",
  epic: "the_circuit",
  exceptional: "the_market_mogul",
};

const AchievementCollection = () => {
  const { t, dir, lang, locale } = useLanguage();
  const [params] = useSearchParams();
  const demoParam = params.get("demo");
  const scenario = demoParam === null ? undefined : demoParam === "new" ? "newcomer" : "established";

  const [data, setData] = useState<Collection | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    const load = () =>
      fetchAchievements(scenario)
        .then((d) => {
          if (!live) return;
          setData(d);
          setFailed(false);
        })
        .catch(() => live && setFailed(true));
    load();
    // A notice elsewhere means something unlocked: show it here too.
    window.addEventListener(PROGRESSION_CHANGED, load);
    return () => {
      live = false;
      window.removeEventListener(PROGRESSION_CHANGED, load);
    };
  }, [scenario]);

  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const byCategory = useMemo(() => {
    const map = new Map<string, Achievement[]>();
    for (const a of data?.achievements ?? []) map.set(a.category_id, [...(map.get(a.category_id) ?? []), a]);
    return map;
  }, [data]);

  // The XP range of each rarity, from the catalog itself.
  const xpOf = (r: Rarity) => {
    const xs = (data?.achievements ?? []).filter((a) => a.rarity === r).map((a) => a.xp_reward);
    if (!xs.length) return null;
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    return lo === hi ? `${n(lo)} XP` : `${n(lo)}–${n(hi)} XP`;
  };

  return (
    <div className="ach-page" dir={dir} lang={lang}>
      <header className="ach-head">
        <Link className="ach-back" to={`/player${demoParam !== null ? `?demo=${demoParam}` : ""}`}>
          {t("ach_back")}
        </Link>
        <h1>{t("achievements_title")}</h1>
        {data && (
          <p className="ach-sub">
            {fill(t("ach_sub"), { got: n(data.totals.unlocked), total: n(data.totals.total) })}
          </p>
        )}
      </header>

      {failed && <p className="ach-error" role="alert">{t("load_failed")}</p>}
      {!data && !failed && <p className="ach-muted ach-center" role="status">{t("loading")}</p>}
      {scenario && <p className="ach-muted ach-center">{t("demo_notice")}</p>}

      {data && (
        <>
          <section className="ach-panel" aria-labelledby="ach-rar-title">
            <div className="ach-panel-head">
              <h2 id="ach-rar-title">{t("ach_rarity_title")}</h2>
              <span className="ach-hint">{t("ach_rarity_hint")}</span>
            </div>
            <ul className="ach-rar">
              {RARITIES.map((r) => (
                <li key={r}>
                  <Badge id={SAMPLES[r]} rarity={r} earned />
                  <b>{t(RARITY_TEXT[r])}</b>
                  {xpOf(r) && (
                    <small className="ach-num">
                      <bdi dir="ltr">{xpOf(r)}</bdi>
                    </small>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {data.categories.map((c) => {
            const items = byCategory.get(c.id) ?? [];
            return (
              <section className="ach-panel" key={c.id} aria-labelledby={`ach-cat-${c.id}`}>
                <div className="ach-panel-head">
                  <h2 id={`ach-cat-${c.id}`}>
                    <BadgeIcon name={c.icon} className="ach-cat-icon" />
                    {c.name[lang]}
                  </h2>
                  <span className="ach-count">
                    {fill(t("ach_of"), { n: n(c.unlocked), total: n(c.total) })}
                  </span>
                </div>
                <ul className="ach-grid">
                  {items.map((a) => (
                    <AchievementCell key={a.id} a={a} />
                  ))}
                </ul>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
};

const AchievementCell = ({ a }: { a: Achievement }) => {
  const { t, lang, locale } = useLanguage();
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const unlocked = a.state === "unlocked";
  const waiting = !unlocked && a.blocked_by.length > 0;
  const showProgress = !unlocked && !waiting && a.progress && a.progress.current > 0;
  const pct = a.progress ? Math.min(100, (a.progress.current / a.progress.target) * 100) : 0;
  const rarity = t(RARITY_TEXT[a.rarity] ?? "rarity_basic");
  const when =
    unlocked && a.unlocked_at
      ? fill(t("ach_unlocked_on"), {
          date: new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(a.unlocked_at)),
        })
      : null;
  return (
    <li
      className={`ach-cell${unlocked ? "" : " is-locked"}`}
      title={[a.description[lang], rarity, `+${n(a.xp_reward)} XP`, when].filter(Boolean).join(" · ")}
    >
      <Badge id={a.id} rarity={a.rarity} earned={unlocked} fallbackIcon={a.icon} />
      <b>{a.name[lang]}</b>
      {showProgress && a.progress ? (
        <>
          <span className="ach-pg" role="progressbar" aria-valuemin={0} aria-valuemax={a.progress.target} aria-valuenow={a.progress.current} aria-label={a.name[lang]}>
            <i style={{ inlineSize: `${pct}%` }} />
          </span>
          <small className="ach-num">
            <bdi dir="ltr">{n(a.progress.current)}/{n(a.progress.target)}</bdi>
          </small>
        </>
      ) : waiting ? (
        <small>{t(WAITS_FOR[a.blocked_by[0]])}</small>
      ) : (
        <small>{a.description[lang]}</small>
      )}
    </li>
  );
};

export default AchievementCollection;
