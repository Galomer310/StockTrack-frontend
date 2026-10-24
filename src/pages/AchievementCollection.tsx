import { CSSProperties, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Achievement,
  AchievementCollection as Collection,
  fetchAchievements,
  PROGRESSION_CHANGED,
} from "../api/progression";
import { RARITY_TEXT, WAITS_FOR } from "../components/progression/categories";
import { Emblem } from "../components/progression/emblems";
import "../components/progression/progression.css";
import { fill } from "../i18n/fill";
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";

/* ===========================================================================
   Game Achievement Collection (Game Achievements spec 9-10).
   ---------------------------------------------------------------------------
   Totals, the seven categories with their progress and next milestone, and
   the selected category's achievements with a simple filter. Every state,
   progress figure and XP value comes from the server; nothing is evaluated
   here. Achievements that wait for a system the platform does not have yet
   (following, subscriptions, competitions) say so instead of showing 0.

   Reached from the Player Card. ?demo=1 or ?demo=new shows demo data, as on
   the card.
   =========================================================================== */

type Filter = "all" | "in_progress" | "unlocked" | "locked";

const FILTERS: { id: Filter; label: MessageKey }[] = [
  { id: "all", label: "ach_filter_all" },
  { id: "in_progress", label: "ach_filter_in_progress" },
  { id: "unlocked", label: "ach_filter_unlocked" },
  { id: "locked", label: "ach_filter_locked" },
];

// The milestone to point at next, among those that can be worked on today:
// the first one under way, else the first not started, in catalog order.
const nextMilestone = (items: Achievement[]): Achievement | undefined => {
  const open = items.filter((a) => a.state !== "unlocked" && a.blocked_by.length === 0);
  return open.find((a) => a.state === "in_progress") ?? open[0];
};

const AchievementCollection = () => {
  const { t, dir, lang, locale } = useLanguage();
  const [params] = useSearchParams();
  const demoParam = params.get("demo");
  const scenario = demoParam === null ? undefined : demoParam === "new" ? "newcomer" : "established";

  const [data, setData] = useState<Collection | null>(null);
  const [failed, setFailed] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let live = true;
    const load = () =>
      fetchAchievements(scenario)
        .then((d) => {
          if (!live) return;
          setData(d);
          setFailed(false);
          setCategory((c) => c ?? d.categories[0]?.id ?? null);
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

  const selected = data?.categories.find((c) => c.id === category);
  const items = (category && byCategory.get(category)) || [];
  const shown = filter === "all" ? items : items.filter((a) => a.state === filter);
  const next = nextMilestone(items);
  const pct = data && data.totals.total ? Math.round((data.totals.unlocked / data.totals.total) * 100) : 0;

  return (
    <div className="prg prg-page" dir={dir} lang={lang}>
      <div className="prg-page-wrap">
        <Link className="prg-back" to={`/player${demoParam !== null ? `?demo=${demoParam}` : ""}`}>
          {t("ach_back")}
        </Link>
        <header className="prg-page-head">
          <span className="prg-eyebrow">{t("prg_play_progress")}</span>
          <h1 className="prg-serif">{t("achievements_title")}</h1>
          <p className="prg-muted">{t("ach_intro")}</p>
        </header>

        {failed && <p className="prg-error" role="alert">{t("load_failed")}</p>}
        {!data && !failed && <p className="prg-muted prg-center" role="status">{t("loading")}</p>}
        {scenario && <p className="prg-muted prg-center prg-small">{t("demo_notice")}</p>}

        {data && (
          <>
            <section className="prg-summary" aria-label={t("achievements_title")}>
              <div className="prg-summary-item">
                <span className="prg-summary-value prg-serif">
                  <bdi dir="ltr">
                    {n(data.totals.unlocked)}
                    <span className="prg-summary-of"> / {n(data.totals.total)}</span>
                  </bdi>
                </span>
                <span className="prg-summary-label">{t("ach_unlocked_label")}</span>
              </div>
              <div className="prg-summary-item">
                <span className="prg-summary-value prg-serif">
                  <bdi dir="ltr">{n(pct)}%</bdi>
                </span>
                <span className="prg-summary-label">{t("ach_completion")}</span>
                <span className="prg-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t("ach_completion")}>
                  <span style={{ inlineSize: `${pct}%` }} />
                </span>
              </div>
              <div className="prg-summary-item">
                <span className="prg-summary-value prg-serif">
                  <bdi dir="ltr">{n(data.totals.xp_earned)}</bdi>
                </span>
                <span className="prg-summary-label">{t("ach_xp_earned")}</span>
              </div>
            </section>

            <div className="prg-cat-grid" role="list">
              {data.categories.map((c) => {
                const catNext = nextMilestone(byCategory.get(c.id) ?? []);
                const share = c.total ? (c.unlocked / c.total) * 100 : 0;
                return (
                  <div role="listitem" key={c.id}>
                    <button
                      type="button"
                      className={`prg-cat${category === c.id ? " is-selected" : ""}`}
                      style={{ "--accent": c.accent_color } as CSSProperties}
                      aria-pressed={category === c.id}
                      onClick={() => {
                        setCategory(c.id);
                        setFilter("all");
                      }}
                    >
                      <span className="prg-cat-head">
                        <span className="prg-cat-icon" aria-hidden="true">
                          <Emblem name={c.icon} />
                        </span>
                        <span className="prg-cat-name">{c.name[lang]}</span>
                        <bdi className="prg-cat-count" dir="ltr">
                          {n(c.unlocked)}/{n(c.total)}
                        </bdi>
                      </span>
                      <span className="prg-meter" aria-hidden="true">
                        <span style={{ inlineSize: `${share}%` }} />
                      </span>
                      <span className="prg-cat-next">
                        {c.unlocked === c.total
                          ? t("ach_all_done")
                          : catNext
                            ? fill(t("ach_next_short"), { name: catNext.name[lang] })
                            : t("ach_waiting")}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {selected && (
              <section className="prg-cat-panel" style={{ "--accent": selected.accent_color } as CSSProperties}>
                <div className="prg-cat-panel-head">
                  <h2 className="prg-serif">
                    <Emblem name={selected.icon} />
                    {selected.name[lang]}
                  </h2>
                  <div className="prg-filters" role="group" aria-label={t("ach_filter_label")}>
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`prg-filter${filter === f.id ? " is-selected" : ""}`}
                        aria-pressed={filter === f.id}
                        onClick={() => setFilter(f.id)}
                      >
                        {t(f.label)}
                      </button>
                    ))}
                  </div>
                </div>

                {next && filter === "all" && (
                  <div className="prg-next">
                    <span className="prg-eyebrow">{t("ach_next")}</span>
                    <AchievementCard a={next} accent={selected.accent_color} categoryIcon={selected.icon} highlight />
                  </div>
                )}

                {shown.length ? (
                  <ul className="prg-ach-grid">
                    {shown.map((a) => (
                      <li key={a.id}>
                        <AchievementCard a={a} accent={selected.accent_color} categoryIcon={selected.icon} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="prg-muted prg-center">{t("ach_empty_filter")}</p>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const AchievementCard = ({
  a,
  accent,
  categoryIcon,
  highlight = false,
}: {
  a: Achievement;
  accent: string;
  categoryIcon: string;
  highlight?: boolean;
}) => {
  const { t, lang, locale } = useLanguage();
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const unlocked = a.state === "unlocked";
  const pct = a.progress ? (a.progress.current / a.progress.target) * 100 : 0;
  return (
    <article
      className={`prg-ach is-${a.state} is-${a.rarity}${highlight ? " is-highlight" : ""}`}
      style={{ "--accent": accent } as CSSProperties}
    >
      <span className="prg-ach-icon" aria-hidden="true">
        <Emblem name={a.icon ?? categoryIcon} />
        {unlocked && (
          <span className="prg-ach-check">
            <Emblem name="check" />
          </span>
        )}
      </span>
      <div className="prg-ach-body">
        <div className="prg-ach-top">
          <h3 className="prg-ach-name">{a.name[lang]}</h3>
          <bdi className="prg-ach-xp" dir="ltr">+{n(unlocked ? (a.xp_awarded ?? a.xp_reward) : a.xp_reward)} XP</bdi>
        </div>
        <p className="prg-ach-desc">{a.description[lang]}</p>
        {a.progress && !unlocked && (
          <div className="prg-ach-progress">
            <span className="prg-meter" role="progressbar" aria-valuemin={0} aria-valuemax={a.progress.target} aria-valuenow={a.progress.current} aria-label={a.name[lang]}>
              <span style={{ inlineSize: `${pct}%` }} />
            </span>
            <bdi dir="ltr">
              {n(a.progress.current)} / {n(a.progress.target)}
            </bdi>
          </div>
        )}
        <div className="prg-ach-meta">
          <span className="prg-rarity">{t(RARITY_TEXT[a.rarity] ?? "rarity_basic")}</span>
          {unlocked && a.unlocked_at && (
            <span>
              {fill(t("ach_unlocked_on"), {
                date: new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(a.unlocked_at)),
              })}
            </span>
          )}
          {!unlocked && a.blocked_by.length > 0 && <span className="prg-waits">{t(WAITS_FOR[a.blocked_by[0]])}</span>}
        </div>
      </div>
    </article>
  );
};

export default AchievementCollection;
