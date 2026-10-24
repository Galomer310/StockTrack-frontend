import { MessageKey } from "../../i18n/messages";
import astronaut from "./art/astronaut.svg";
import bb8 from "./art/bb-8.svg";
import businessperson from "./art/businessperson.svg";
import captainAmerica from "./art/captain-america.svg";
import darthVader from "./art/darth-vader.svg";
import einstein from "./art/einstein.svg";
import entrepreneur from "./art/entrepreneur.svg";
import freelancer from "./art/freelancer.svg";
import gandalf from "./art/gandalf.svg";
import genghisKhan from "./art/genghis-khan.svg";
import groot from "./art/groot.svg";
import hagrid from "./art/hagrid.svg";
import harryPotter from "./art/harry-potter.svg";
import hermione from "./art/hermione.svg";
import investor from "./art/investor.svg";
import jedi from "./art/jedi.svg";
import kimJongUn from "./art/kim-jong-un.svg";
import king from "./art/king.svg";
import mario from "./art/mario.svg";
import princess from "./art/princess.svg";
import r2D2 from "./art/r2-d2.svg";
import samurai from "./art/samurai.svg";
import spaceWarrior from "./art/space-warrior.svg";
import student from "./art/student.svg";
import tesla from "./art/tesla.svg";
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
  { id: "astronaut", src: astronaut, label: "avatar_astronaut" },
  { id: "student", src: student, label: "avatar_student" },
  { id: "princess", src: princess, label: "avatar_princess" },
  { id: "king", src: king, label: "avatar_king" },
  { id: "space-warrior", src: spaceWarrior, label: "avatar_space_warrior" },
  { id: "groot", src: groot, label: "avatar_groot" },
  { id: "darth-vader", src: darthVader, label: "avatar_darth_vader" },
  { id: "jedi", src: jedi, label: "avatar_jedi" },
  { id: "captain-america", src: captainAmerica, label: "avatar_captain_america" },
  { id: "kim-jong-un", src: kimJongUn, label: "avatar_kim_jong_un" },
  { id: "genghis-khan", src: genghisKhan, label: "avatar_genghis_khan" },
  { id: "samurai", src: samurai, label: "avatar_samurai" },
  { id: "mario", src: mario, label: "avatar_mario" },
  { id: "harry-potter", src: harryPotter, label: "avatar_harry_potter" },
  { id: "hermione", src: hermione, label: "avatar_hermione" },
  { id: "r2-d2", src: r2D2, label: "avatar_r2_d2" },
  { id: "bb-8", src: bb8, label: "avatar_bb_8" },
  { id: "hagrid", src: hagrid, label: "avatar_hagrid" },
  { id: "gandalf", src: gandalf, label: "avatar_gandalf" },
  { id: "einstein", src: einstein, label: "avatar_einstein" },
  { id: "tesla", src: tesla, label: "avatar_tesla" },
];

// An id the server sent but this build has no artwork for falls back to the
// default picture rather than a broken image.
export const findAvatar = (id: string | null | undefined): Avatar | undefined =>
  id ? AVATARS.find((a) => a.id === id) : undefined;
