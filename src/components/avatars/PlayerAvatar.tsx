import { findAvatar } from "./avatars";

/* ===========================================================================
   A player's picture in a list: the feed, its replies, the leaderboard, the
   follow lists and the portfolio page.
   ---------------------------------------------------------------------------
   Shows the gallery avatar the player chose (users.avatar_id). A player who
   has not chosen one, or whose id this build has no artwork for, gets the
   first letter of their name in a gold ring, as every list showed before.

   Decorative: the name always sits right next to it, so screen readers skip
   the picture rather than reading the name twice.
   =========================================================================== */

interface Props {
  name: string;
  avatarId?: string | null;
  /** Sizing and placement class from the page it sits in. */
  className?: string;
}

export default function PlayerAvatar({ name, avatarId, className = "" }: Props) {
  const avatar = findAvatar(avatarId);
  return (
    <span
      className={`player-avatar${avatar ? " has-art" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      {avatar ? <img src={avatar.src} alt="" loading="lazy" decoding="async" /> : name.charAt(0).toUpperCase()}
    </span>
  );
}
