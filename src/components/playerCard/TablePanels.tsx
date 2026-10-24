import { ReactNode } from "react";
import type { PlayerCardData } from "../../api/playerCard";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";
import { LevelEmblem } from "./art";
import { formatNumber } from "./format";
import { Icon, IconName } from "./icons";
import { InfoTip } from "./InfoTip";
import { Gated, NotShown, Percent } from "./values";

/* ===========================================================================
   Areas 5, 6 and 7 - competitions, player performance, game progress.
   ---------------------------------------------------------------------------
   All three are compact label/value tables in the reference image. Every
   row stays in place when its value is locked (spec 9).
   =========================================================================== */

const Row = ({ icon, label, tip, children }: { icon: IconName; label: MessageKey; tip?: MessageKey; children: ReactNode }) => {
  const { t } = useLanguage();
  return (
    <div className="pc-row">
      <Icon name={icon} />
      <span className="pc-row-label">
        {t(label)}
        {tip && <InfoTip text={t(tip)} inline />}
      </span>
      <span className="pc-row-value">{children}</span>
    </div>
  );
};

// Spec 8. The fourth row counts first-place finishes; the image's "highest
// rank" is replaced, as the spec instructs.
export const CompetitionsPanel = ({ competitions }: { competitions: PlayerCardData["competitions"] }) => {
  const { t, locale } = useLanguage();
  const n = (v: number) => <bdi>{formatNumber(v, locale)}</bdi>;
  return (
    <section className="pc-card pc-panel">
      <h2 className="pc-panel-title">
        <Icon name="trophy" />
        {t("competitions_title")}
      </h2>
      <div className="pc-table">
        <Row icon="crown" label="c_entered" tip="tc_entered">{n(competitions.participations)}</Row>
        <Row icon="trophy" label="c_prizes" tip="tc_prizes">{n(competitions.prize_wins)}</Row>
        <Row icon="podium" label="c_top3" tip="tc_top3">{n(competitions.top_3)}</Row>
        <Row icon="first" label="c_first" tip="tc_first">{n(competitions.first_place)}</Row>
      </div>
    </section>
  );
};

// Spec 9: six rows. Average return is the same figure as the first stat
// card, from the same field. The top portfolio's name and return come from
// one value, so they always lock and unlock together.
export const PerformancePanel = ({ stats }: { stats: PlayerCardData["stats"] }) => {
  const { t, locale } = useLanguage();
  return (
    <section className="pc-card pc-panel pc-performance">
      <h2 className="pc-panel-title">
        <Icon name="bars" />
        {t("performance_title")}
      </h2>
      <div className="pc-table">
        <Row icon="folders" label="p_total" tip="tp_total"><bdi>{formatNumber(stats.portfolios_total, locale)}</bdi></Row>
        <Row icon="folder_check" label="p_active" tip="tp_active"><bdi>{formatNumber(stats.portfolios_active, locale)}</bdi></Row>
        <Row icon="bars" label="p_avg" tip="t_avg">
          <Gated value={stats.average_active_return} compact render={(v) => <Percent value={v} />} />
        </Row>
        <Row icon="calendar" label="p_month" tip="tp_month">
          <Gated value={stats.average_month_to_date_return} compact render={(v) => <Percent value={v} />} />
        </Row>
        <Row icon="star" label="p_top_name" tip="tp_top">
          <Gated value={stats.top_portfolio} compact render={(p) => <bdi>{p.name}</bdi>} />
        </Row>
        <Row icon="trend" label="p_top_return" tip="tp_top">
          <Gated value={stats.top_portfolio} compact render={(p) => <Percent value={p.cumulative_return} />} />
        </Row>
      </div>
    </section>
  );
};

// Spec 10. The level here and in the header come from the same value. XP per
// level is not decided yet: until the server has thresholds, the bar stays
// empty and says so, rather than fill towards an invented target. The bar
// measures progress within the current level.
export const ProgressionPanel = ({ progression }: { progression: PlayerCardData["progression"] }) => {
  const { t, locale } = useLanguage();
  const p = progression.state === "available" ? progression.value : null;
  const span = p && p.next_level_xp !== null ? p.next_level_xp - p.current_level_xp : null;
  const pct = p && span ? Math.max(0, Math.min(100, ((p.xp - p.current_level_xp) / span) * 100)) : 0;
  const note = !p
    ? null
    : !p.thresholds_configured
      ? t("prg_thresholds_unset")
      : p.next_level === null
        ? t("prg_top_level")
        : p.thresholds_provisional
          ? t("prg_thresholds_provisional")
          : null;
  return (
    <section className="pc-card pc-panel">
      <h2 className="pc-panel-title">
        <Icon name="star" />
        {t("progress_title")}
        <InfoTip text={t("t_progress")} inline />
      </h2>
      <div className="pc-progress">
        <LevelEmblem level={p ? formatNumber(p.level, locale) : "—"} />
        <div className="pc-progress-main">
          <p className="pc-xp">
            {p ? (
              <bdi dir="ltr">
                <span className="pc-xp-label">XP</span> <span className="pc-xp-now">{formatNumber(p.xp, locale)}</span>
                {p.next_level_xp !== null && <span className="pc-xp-of"> / {formatNumber(p.next_level_xp, locale)}</span>}
              </bdi>
            ) : (
              <>
                <span className="pc-xp-label">XP</span> <NotShown value={progression} compact />
              </>
            )}
          </p>
          <div
            className="pc-bar"
            role="progressbar"
            aria-label="XP"
            aria-valuemin={p?.current_level_xp ?? 0}
            aria-valuemax={p?.next_level_xp ?? undefined}
            aria-valuenow={p && p.next_level_xp !== null ? p.xp : undefined}
            aria-valuetext={note ?? undefined}
          >
            <div style={{ inlineSize: `${pct.toFixed(1)}%` }} />
          </div>
          {note && <p className="pc-progress-note">{note}</p>}
          <div className="pc-table">
            <Row icon="crown" label="next_goal">
              <Gated
                value={progression}
                compact
                render={(v) =>
                  v.next_level !== null ? (
                    <bdi>{fill(t("prg_level_n"), { n: formatNumber(v.next_level, locale) })}</bdi>
                  ) : (
                    <span className="pc-muted-value">{t(v.thresholds_configured ? "prg_top_level" : "prg_not_set")}</span>
                  )
                }
              />
            </Row>
            <Row icon="gem" label="next_title">
              <Gated
                value={progression}
                compact
                render={(v) =>
                  v.next_title_level !== null ? (
                    <bdi>{fill(t("prg_level_n"), { n: formatNumber(v.next_title_level, locale) })}</bdi>
                  ) : (
                    <span className="pc-muted-value">{t("prg_all_titles")}</span>
                  )
                }
              />
            </Row>
          </div>
        </div>
      </div>
    </section>
  );
};
