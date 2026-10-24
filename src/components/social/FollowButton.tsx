import { useEffect, useState } from "react";
import { fetchFollowState, followPlayer, FollowState, unfollowPlayer } from "../../api/follows";
import { requestProgressionCheck } from "../../api/progression";
import { fill } from "../../i18n/fill";
import { useLanguage } from "../../i18n/LanguageContext";
import { useToast } from "../ui/ToastProvider";

/* ===========================================================================
   Follow / Following, with the player's public follower count beside it.
   ---------------------------------------------------------------------------
   Shows nothing on your own pages. The count and state shown are always the
   server's answer, so two quick taps cannot leave them out of step.
   =========================================================================== */

export const FollowButton = ({ playerId }: { playerId: number }) => {
  const { t, dir, lang, locale } = useLanguage();
  const toast = useToast();
  const [state, setState] = useState<FollowState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    setState(null);
    fetchFollowState(playerId)
      .then((s) => live && setState(s))
      .catch(() => undefined); // no button rather than a broken one
    return () => {
      live = false;
    };
  }, [playerId]);

  if (!state || state.is_self) return null;

  const toggle = async () => {
    setBusy(true);
    try {
      setState(await (state.following ? unfollowPlayer(playerId) : followPlayer(playerId)));
      requestProgressionCheck(); // follow milestones
    } catch {
      toast.error(t("follow_failed"));
    } finally {
      setBusy(false);
    }
  };

  const count = new Intl.NumberFormat(locale).format(state.followers);
  return (
    <span className="follow-control" dir={dir} lang={lang}>
      <button
        type="button"
        className={`follow-btn${state.following ? " is-following" : ""}`}
        onClick={toggle}
        disabled={busy}
        aria-pressed={state.following}
        title={state.following ? t("follow_unfollow") : undefined}
      >
        {state.following ? t("follow_following") : t("follow_follow")}
      </button>
      <span className="follow-count">
        {state.followers === 1 ? t("follow_followers_one") : fill(t("follow_followers_n"), { n: count })}
      </span>
    </span>
  );
};
