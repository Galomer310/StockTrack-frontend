import { MessageKey } from "../../i18n/messages";
import businessperson from "./art/businessperson.svg";
import entrepreneur from "./art/entrepreneur.svg";
import freelancer from "./art/freelancer.svg";
import investor from "./art/investor.svg";
import warrior from "./art/warrior.svg";

/* ===========================================================================
   The avatar gallery (Player Card spec 3.1, "platform avatar gallery").
   ---------------------------------------------------------------------------
   The server stores only the chosen id (users.avatar_id) and accepts only
   the ids in its own AVATAR_IDS list (backend src/services/playerProfile.ts),
   so the two lists must match. New avatars go at the end; an id is never
   renamed or removed once players may have chosen it.

   Each picture is a standalone SVG: one style, a champagne-gold ring, and a
   ground colour of its own so players stay easy to tell apart in a list.
   =========================================================================== */

export interface Avatar {
  id: string;
  src: string;
  label: MessageKey;
}

export const AVATARS: Avatar[] = [
  { id: "businessperson", src: businessperson, label: "avatar_businessperson" },
  { id: "warrior", src: warrior, label: "avatar_warrior" },
  { id: "entrepreneur", src: entrepreneur, label: "avatar_entrepreneur" },
  { id: "investor", src: investor, label: "avatar_investor" },
  { id: "freelancer", src: freelancer, label: "avatar_freelancer" },
];

// An id the server sent but this build has no artwork for falls back to the
// default picture rather than a broken image.
export const findAvatar = (id: string | null | undefined): Avatar | undefined =>
  id ? AVATARS.find((a) => a.id === id) : undefined;
