import { ReactNode } from "react";
import type { CardValue, PlayerCardData } from "../../api/playerCard";
import { useLanguage } from "../../i18n/LanguageContext";
import { MessageKey } from "../../i18n/messages";
import { formatNumber } from "./format";
import { Icon, IconName } from "./icons";
import { InfoTip } from "./InfoTip";
import { NotShown, Percent } from "./values";

/* ===========================================================================
   Area 2 - the six main statistics (spec 4).
   ---------------------------------------------------------------------------
   Always six cards in the spec's order, which in Hebrew runs right to left
   from average return to Best Portfolio Gain. A locked card keeps its place
   and size; only its value is replaced by the lock and its condition.
   =========================================================================== */

const StatCard = ({
  title,
  tip,
  icon,
  iconTone,
  value,
  action,
  children,
}: {
  title: MessageKey;
  tip: MessageKey;
  icon: IconName;
  iconTone?: "pos";
  value?: CardValue<unknown>;
  /** A small control under the value, such as opening the follower lists. */
  action?: ReactNode;
  children?: ReactNode;
}) => {
  const { t } = useLanguage();
  const withheld = value && value.state !== "available" ? value : null;
  return (
    <article className="pc-card pc-stat">
      <InfoTip text={t(tip)} />
      <h3 className="pc-stat-title">{t(title)}</h3>
      <Icon name={icon} className={`pc-stat-icon${iconTone ? ` pc-${iconTone}-icon` : ""}${withheld ? " is-dim" : ""}`} />
      <div className="pc-stat-value">{withheld ? <NotShown value={withheld} /> : children}</div>
      {action}
    </article>
  );
};

export const StatsRow = ({ data, onOpenFollows }: { data: PlayerCardData; onOpenFollows?: () => void }) => {
  const { t, locale } = useLanguage();
  const { stats, social, medals, achievements } = data;
  const count = (n: number) => <bdi>{formatNumber(n, locale)}</bdi>;

  return (
    <section className="pc-stats">
      <StatCard title="s_avg" tip="t_avg" icon="cycle_up" value={stats.average_active_return}>
        {stats.average_active_return.state === "available" && <Percent value={stats.average_active_return.value} />}
      </StatCard>
      <StatCard title="s_achievements" tip="t_achievements" icon="trophy">
        {count(achievements.total)}
      </StatCard>
      <StatCard title="s_medals" tip="t_medals" icon="medal">
        {count(medals.total)}
      </StatCard>
      <StatCard title="s_subscribers" tip="t_subscribers" icon="user">
        {count(social.subscribers)}
      </StatCard>
      <StatCard
        title="s_followers"
        tip="t_followers"
        icon="users"
        action={
          onOpenFollows && (
            <button type="button" className="pc-stat-action" onClick={onOpenFollows}>
              {t("follow_view_lists")}
            </button>
          )
        }
      >
        {count(social.followers)}
      </StatCard>
      <StatCard title="s_best" tip="t_best" icon="trend" iconTone="pos" value={stats.best_portfolio_gain}>
        {stats.best_portfolio_gain.state === "available" && <Percent value={stats.best_portfolio_gain.value} />}
      </StatCard>
    </section>
  );
};
