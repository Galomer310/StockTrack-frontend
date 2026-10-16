import { ReactNode } from "react";
import type { PlayerCardData } from "../../api/playerCard";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";
import { LevelEmblem } from "./art";
import { formatNumber } from "./format";
import { Icon, IconName } from "./icons";
import { InfoTip } from "./InfoTip";
import { Gated, Percent } from "./values";

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

// Spec 10. The level here and in the header come from the same field.
export const ProgressionPanel = ({ player }: { player: PlayerCardData["player"] }) => {
  const { t, locale } = useLanguage();
  const pct = Math.max(0, Math.min(100, (player.xp / player.next_level_xp) * 100));
  return (
    <section className="pc-card pc-panel">
      <h2 className="pc-panel-title">
        <Icon name="star" />
        {t("progress_title")}
        <InfoTip text={t("t_progress")} inline />
      </h2>
      <div className="pc-progress">
        <LevelEmblem level={formatNumber(player.level, locale)} />
        <div className="pc-progress-main">
          <p className="pc-xp">
            <bdi dir="ltr">
              <span className="pc-xp-label">XP</span> <span className="pc-xp-now">{formatNumber(player.xp, locale)}</span>{" "}
              <span className="pc-xp-of">/ {formatNumber(player.next_level_xp, locale)}</span>
            </bdi>
          </p>
          <div
            className="pc-bar"
            role="progressbar"
            aria-label="XP"
            aria-valuemin={0}
            aria-valuemax={player.next_level_xp}
            aria-valuenow={player.xp}
          >
            <div style={{ inlineSize: `${pct.toFixed(1)}%` }} />
          </div>
          <div className="pc-table">
            <Row icon="crown" label="next_goal">
              <bdi dir="ltr">{t("level")} {formatNumber(player.next_level, locale)}</bdi>
            </Row>
            <Row icon="gem" label="next_title">
              <bdi dir="ltr">{player.next_title}</bdi>
            </Row>
          </div>
        </div>
      </div>
    </section>
  );
};
