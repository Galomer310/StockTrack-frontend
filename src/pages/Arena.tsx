import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArenaBoard, ArenaGroupRow, ArenaMine, ArenaOwner, ArenaView, BoardKey, fetchArena, LEAGUE_NAMES } from "../api/arena";
import PlayerAvatar from "../components/avatars/PlayerAvatar";
import { FollowButton } from "../components/social/FollowButton";
import { fill } from "../i18n/fill";
import { useLanguage } from "../i18n/LanguageContext";
import { MessageKey } from "../i18n/messages";
import "./arena.css";

/* ===========================================================================
   The Arena (approved design, 2026-11). Monthly leagues for portfolios.
   ---------------------------------------------------------------------------
   From the top: last season's Hall of Fame; the viewer's portfolios to pick
   from; the picked one's place in its group beside the league ladder; the
   group (around you, or all of it) beside the boards, "many ways to win";
   and Discover, three portfolios a day chosen for reasons other than return.

   Every figure comes from the server (src/arena) and is a percentage.
   =========================================================================== */

const BOARDS: BoardKey[] = ["beat_market", "capital_shield", "consistency", "rising_stars", "climbers"];

const signed = (v: number | null, unit = "%") => {
  if (v === null || v === undefined) return "—";
  const s = Math.abs(v).toFixed(unit === "%" ? 1 : 0);
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${s}${unit}`;
};
const tone = (v: number | null) => (v === null ? "" : v > 0 ? "is-up" : v < 0 ? "is-down" : "");
const handle = (o: ArenaOwner | null) => (o ? (o.nickname ? `@${o.nickname}` : o.name) : "");

/** League mark: five rising bars, those up to the league lit. */
const League = ({ league }: { league: number | null }) => (
  <span className="ar-lg">
    <svg viewBox="0 0 17 13" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const h = 3 + i * 2.5;
        return <rect key={i} x={i * 3.5} y={13 - h} width="2.4" height={h} rx=".6" fill="currentColor" opacity={league !== null && i < league ? 1 : 0.22} />;
      })}
    </svg>
    {league ? LEAGUE_NAMES[league] : "—"}
  </span>
);

const Crown = () => (
  <svg className="ar-crown" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 18l2-10 5 5 2-7 2 7 5-5 2 10z" />
  </svg>
);

const Row = ({ r, place, cls = "" }: { r: { name: string; owner: ArenaOwner; mine?: boolean }; place: number | null; cls?: string }) => (
  <>
    <span className="ar-rk">{place ?? "—"}</span>
    <PlayerAvatar className="ar-av" name={r.owner.name} avatarId={r.owner.avatar_id} />
    <span className="ar-nm">
      <bdi dir="auto" className="ar-nm-b">{r.name}</bdi>
      <small>
        <bdi dir="auto">{handle(r.owner)}</bdi>
        {cls}
      </small>
    </span>
  </>
);

const Position = ({ p, view }: { p: ArenaMine; view: ArenaView }) => {
  const { t, locale } = useLanguage();
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const season = view.season!;
  const progress = Math.min(100, Math.round(((season.days_total - season.days_left) / season.days_total) * 100));
  if (p.state === "waiting") {
    const why: Record<typeof p.reason, string> = {
      too_young: fill(t("ar_wait_too_young"), { min: n(view.rules.minAgeDays), n: n(p.days_to_eligible) }),
      few_holdings: fill(t("ar_wait_few_holdings"), { min: n(view.rules.minHoldings), n: n(p.holdings) }),
      next_season: t("ar_wait_next_season"),
      tester: t("ar_wait_tester"),
    };
    return (
      <div className="ar-panel ar-pos">
        <span className="ar-cap">{t("ar_waiting")}</span>
        <div className="ar-who"><bdi dir="auto">{p.name}</bdi></div>
        <League league={p.league} />
        <p className="ar-wait">{why[p.reason]}</p>
      </div>
    );
  }
  const toUp = p.rank !== null ? p.rank - p.promote_through : 0;
  const toSafe = p.rank !== null && p.relegate_from !== null ? p.rank - p.relegate_from + 1 : 0;
  const zone =
    p.zone === "promote" ? (
      <span className="ar-zone is-up">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        {fill(t("ar_zone_up"), { league: LEAGUE_NAMES[p.league + 1] })}
      </span>
    ) : p.zone === "relegate" ? (
      <span className="ar-zone is-down">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
        {fill(t("ar_zone_down"), { n: n(toSafe) })}
      </span>
    ) : p.zone === "unranked" ? (
      <span className="ar-zone">{t("ar_zone_unranked")}</span>
    ) : (
      <span className="ar-zone">{p.league === 5 ? t("ar_zone_safe_top") : fill(t("ar_zone_safe"), { n: n(toUp) })}</span>
    );
  return (
    <div className="ar-panel ar-pos">
      <span className="ar-cap">{t("ar_place")}</span>
      <div className="ar-big">
        <bdi dir="ltr">
          {p.rank ?? "—"} <small>/ {p.group_size}</small>
        </bdi>
      </div>
      <div className="ar-who"><bdi dir="auto">{p.name}</bdi></div>
      <div>
        <League league={p.league} /> <span className="ar-quiet">· {fill(t("ar_group_n"), { n: n(p.group_no) })}</span>
      </div>
      <div className="ar-vs">
        <bdi dir="ltr" className={tone(p.excess_pct)}>{signed(p.excess_pct)}</bdi>{" "}
        <small>{fill(t("ar_vs_bench"), { bench: season.benchmark })}</small>
      </div>
      {zone}
      <div className="ar-season">
        <div className="ar-bar" aria-hidden="true"><i style={{ inlineSize: `${progress}%` }} /></div>
        <span>{season.days_left > 0 ? fill(t("ar_days_left"), { n: n(season.days_left) }) : t("ar_last_day")}</span>
      </div>
    </div>
  );
};

const Group = ({ p }: { p: Extract<ArenaMine, { state: "competing" }> }) => {
  const { t, locale } = useLanguage();
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const [all, setAll] = useState(false);
  const size = p.group.length;
  const me = p.rank ?? 1;
  const want = new Set<number>(all ? p.group.map((_, i) => i + 1) : [1, 2, 3, me - 2, me - 1, me, me + 1, me + 2, size - 1, size]);
  let prev = 0;
  return (
    <div className="ar-panel">
      <div className="ar-h">
        <h2>{fill(t("ar_group_title"), { n: n(p.group_no), league: LEAGUE_NAMES[p.league] })}</h2>
        {size > 10 && (
          <button type="button" className="ar-linkbtn" onClick={() => setAll((v) => !v)}>
            {all ? t("ar_show_less") : fill(t("ar_show_all"), { n: n(size) })}
          </button>
        )}
      </div>
      <div className="ar-list">
        {p.group.map((r: ArenaGroupRow, i) => {
          const rank = i + 1;
          if (!want.has(rank)) return null;
          const gap = prev && rank - prev > 1;
          const lineUp = p.promote_through > 0 && prev === p.promote_through && rank === p.promote_through + 1;
          const lineDown = p.relegate_from !== null && prev === p.relegate_from - 1 && rank === p.relegate_from;
          prev = rank;
          const cls = `ar-row${r.mine ? " is-me" : ""}${rank <= p.promote_through ? " is-pz" : ""}${p.relegate_from !== null && rank >= p.relegate_from ? " is-rz" : ""}`;
          return (
            <Fragment key={r.portfolio_id}>
              {gap ? <div className="ar-gap" aria-hidden="true">···</div> : null}
              {lineUp && <div className="ar-line is-up">{t("ar_line_up")}</div>}
              {lineDown && <div className="ar-line is-down">{t("ar_line_down")}</div>}
              <Link className={cls} to={`/investor/${r.portfolio_id}`}>
                <Row r={r} place={r.rank} />
                <bdi dir="ltr" className={`ar-v ${tone(r.excess_pct)}`}>{signed(r.excess_pct)}</bdi>
              </Link>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

const Boards = ({ boards, mine }: { boards: ArenaBoard[]; mine: ArenaMine[] }) => {
  const { t, locale } = useLanguage();
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const [sel, setSel] = useState<BoardKey>("beat_market");
  const b = boards.find((x) => x.key === sel);
  const value = (key: BoardKey, v: number | null, age?: number) => {
    switch (key) {
      case "beat_market":
      case "rising_stars":
        return { text: signed(v), unit: key === "rising_stars" && age !== undefined ? fill(t("ar_unit_age"), { n: n(age) }) : t("ar_unit_vs"), cls: tone(v) };
      case "capital_shield":
        return { text: signed(v), unit: t("ar_unit_dd"), cls: "" };
      case "consistency":
        return { text: v === null ? "—" : n(v), unit: t("ar_unit_months"), cls: "" };
      case "climbers":
        return { text: signed(v, ""), unit: t("ar_unit_places"), cls: "" };
    }
  };
  const myName = (id: number) => mine.find((m) => m.portfolio_id === id)?.name ?? "";
  return (
    <div className="ar-panel">
      <div className="ar-h">
        <h2>{t("ar_boards")}</h2>
        <span className="ar-more">{t("ar_boards_all")}</span>
      </div>
      <div className="ar-tabs" role="tablist" aria-label={t("ar_boards")}>
        {BOARDS.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={k === sel} className={k === sel ? "is-on" : ""} onClick={() => setSel(k)}>
            {t(`ar_board_${k}` as MessageKey)}
          </button>
        ))}
      </div>
      <p className="ar-desc">{t(`ar_desc_${sel}` as MessageKey)}</p>
      <div className="ar-list" role="tabpanel">
        {b && b.rows.length ? (
          b.rows.map((r) => {
            const v = value(sel, r.value, r.age_days);
            return (
              <Link key={r.portfolio_id} className={`ar-row${r.mine ? " is-me" : ""}`} to={`/investor/${r.portfolio_id}`}>
                <span className="ar-rk">{r.place}</span>
                <PlayerAvatar className="ar-av" name={r.owner.name} avatarId={r.owner.avatar_id} />
                <span className="ar-nm">
                  <bdi dir="auto" className="ar-nm-b">{r.name}</bdi>
                  <small>
                    <bdi dir="auto">{handle(r.owner)}</bdi> · <League league={r.league} />
                  </small>
                </span>
                <span className={`ar-v ${v.cls}`}>
                  <bdi dir="ltr">{v.text}</bdi>
                  <small>{v.unit}</small>
                </span>
              </Link>
            );
          })
        ) : (
          <p className="ar-empty">{t("ar_board_empty")}</p>
        )}
      </div>
      {b && (
        <div className="ar-bd-me">
          {b.me ? (
            <>
              <span>
                {fill(t("ar_board_me"), { name: "" })}
                <b><bdi dir="auto">{myName(b.me.portfolio_id) || b.rows.find((r) => r.portfolio_id === b.me!.portfolio_id)?.name}</bdi></b>
              </span>
              <span>{fill(t("ar_board_me_place"), { n: n(b.me.place) })}</span>
            </>
          ) : (
            <span>{t("ar_board_me_none")}</span>
          )}
        </div>
      )}
    </div>
  );
};

const Arena = () => {
  const { t, dir, lang, locale } = useLanguage();
  const n = (v: number) => new Intl.NumberFormat(locale).format(v);
  const [view, setView] = useState<ArenaView | null>(null);
  const [failed, setFailed] = useState(false);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    fetchArena()
      .then((v) => {
        setView(v);
        // Open on the first portfolio that is competing.
        const first = v.mine.findIndex((m) => m.state === "competing");
        setSel(first < 0 ? 0 : first);
      })
      .catch(() => setFailed(true));
  }, []);

  const monthName = (key: string | null) =>
    key ? new Date(`${key}-01T12:00:00`).toLocaleDateString(locale, { month: "long", year: "numeric" }) : "";

  if (failed) return <div className="ar-page" dir={dir} lang={lang}><p className="ar-error" role="alert">{t("load_failed")}</p></div>;
  if (!view) return <div className="ar-page" dir={dir} lang={lang}><p className="ar-muted ar-center" role="status">{t("loading")}</p></div>;

  const season = view.season;
  const picked = view.mine[sel];
  const pct = (share: number) => n(Math.round(share * 100));

  return (
    <div className="ar-page" dir={dir} lang={lang}>
      <header className="ar-head">
        <h1>{t("lb_title")}</h1>
        {season ? (
          <p className="ar-muted">{fill(t("ar_sub"), { month: monthName(season.key), bench: season.benchmark })}</p>
        ) : (
          <p className="ar-muted">{t("ar_no_season")}</p>
        )}
      </header>

      <section className="ar-panel ar-hof-panel" aria-labelledby="ar-hof">
        <div className="ar-h">
          <h2 id="ar-hof">{t("ar_hof")}</h2>
          <span className="ar-more">
            {view.hall_of_fame.season ? fill(t("ar_hof_of"), { month: monthName(view.hall_of_fame.season) }) : t("ar_hof_first")}
          </span>
        </div>
        <div className="ar-hof">
          {view.hall_of_fame.champions.map((c) =>
            c.portfolio_id ? (
              <Link key={c.league} to={`/investor/${c.portfolio_id}`}>
                <Crown />
                <League league={c.league} />
                <b><bdi dir="auto">{c.name}</bdi></b>
                <small><bdi dir="auto">{handle(c.owner)}</bdi></small>
                <bdi dir="ltr" className={`ar-hof-v ${tone(c.excess_pct)}`}>{signed(c.excess_pct)}</bdi>
              </Link>
            ) : (
              <div key={c.league} className="is-empty">
                <Crown />
                <League league={c.league} />
                <small>{t("ar_hof_empty")}</small>
              </div>
            )
          )}
        </div>
      </section>

      {view.mine.length > 0 ? (
        <div className="ar-pick" role="group" aria-label={t("ar_mine_label")}>
          {view.mine.map((m, i) => (
            <button key={m.portfolio_id} type="button" className={i === sel ? "is-on" : ""} aria-pressed={i === sel} onClick={() => setSel(i)}>
              <bdi dir="auto">{m.name}</bdi>
              {m.state === "competing" ? <League league={m.league} /> : <span className="ar-quiet">{t("ar_waiting")}</span>}
            </button>
          ))}
        </div>
      ) : (
        <p className="ar-muted ar-center">{fill(t("ar_no_portfolios"), { min: n(view.rules.minAgeDays), holdings: n(view.rules.minHoldings) })}</p>
      )}

      {season && (
        <div className="ar-hero">
          {picked ? <Position p={picked} view={view} /> : <div />}
          <div className="ar-panel">
            <div className="ar-h">
              <h2>{t("ar_leagues")}</h2>
              <span className="ar-more">{t("ar_season_month")}</span>
            </div>
            <div className="ar-ladder">
              {view.leagues.map((l) => {
                const note = l.league === 1 ? t("ar_ladder_start") : l.league === 5 ? t("ar_ladder_top") : "";
                const cur = picked && picked.league === l.league;
                return (
                  <div key={l.league} className={cur ? "is-cur" : ""}>
                    <League league={l.league} />
                    <span className="ar-ladder-nm">
                      {note && <small>{note}</small>}
                      {l.mine > 0 && <small>{note ? " · " : ""}{fill(t("ar_ladder_mine"), { n: n(l.mine) })}</small>}
                    </span>
                    <span className="ar-ladder-cnt">{l.portfolios ? fill(t("ar_ladder_count"), { n: n(l.portfolios) }) : t("ar_ladder_none")}</span>
                  </div>
                );
              })}
            </div>
            <p className="ar-rules">
              {fill(t("ar_rules"), {
                up: pct(view.rules.promoteShare),
                down: pct(view.rules.relegateShare),
                age: n(view.rules.minAgeDays),
                holdings: n(view.rules.minHoldings),
              })}
            </p>
          </div>
        </div>
      )}

      {season && (
        <div className="ar-grid">
          {picked && picked.state === "competing" ? <Group key={picked.portfolio_id} p={picked} /> : <div />}
          <Boards boards={view.boards} mine={view.mine} />
        </div>
      )}

      {view.discover.length > 0 && season && (
        <section aria-labelledby="ar-disc-title">
          <div className="ar-h ar-h-out">
            <h2 id="ar-disc-title">{t("ar_discover")}</h2>
            <span className="ar-more">{fill(t("ar_discover_more"), { n: n(season.portfolios) })}</span>
          </div>
          <div className="ar-disc">
            {view.discover.map((d) => (
              <article className="ar-dc" key={d.portfolio_id}>
                <div className="ar-dc-top">
                  <League league={d.league} />
                  {d.mine && <span className="ar-tag">{t("ar_yours")}</span>}
                </div>
                <h3>
                  <Link to={`/investor/${d.portfolio_id}`}><bdi dir="auto">{d.name}</bdi></Link>
                </h3>
                <div className="ar-by"><bdi dir="auto">{handle(d.owner)}</bdi></div>
                <div className="ar-dc-stats">
                  <span>
                    <b><bdi dir="ltr" className={tone(d.excess_pct)}>{signed(d.excess_pct)}</bdi></b>
                    <small>{t("ar_discover_vs")}</small>
                  </span>
                  <span>
                    <b>{n(d.seasons_played + 1)}</b>
                    <small>{t("ar_discover_seasons")}</small>
                  </span>
                </div>
                <div className="ar-reason">{fill(t("ar_why"), { why: t(`ar_why_${d.reason}` as MessageKey) })}</div>
                {!d.mine && <FollowButton playerId={d.owner.id} />}
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="ar-disclaimer">{t("ar_disclaimer")}</p>
    </div>
  );
};

export default Arena;
