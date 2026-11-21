import { useId } from "react";

/* ===========================================================================
   A game achievement badge, design B: the patch.
   ---------------------------------------------------------------------------
   A cloth patch with a notched bottom. Three things, each with one job:
     colour   = rarity (basic, advanced, rare, epic, exceptional), never the
                category, so how hard a badge was reads at a glance;
     emblem   = meaning (a briefcase for portfolios, an hourglass for time);
     engraved = the step in its series ("5", "90", "1K"), so badges of the
                same series tell apart without reading their names.
   Not earned yet: a dashed outline and a faint emblem.

   The server sends no emblem or series value for most achievements, so both
   come from BADGES below, by achievement id; an unknown id falls back to its
   category's emblem with nothing engraved.
   =========================================================================== */

// 24-unit line emblems, one family.
const ICONS: Record<string, string> = {
  door: "M6 21V3.5h11V21M3.5 21h17M14 12.5h.01",
  signature: "M3 17c3-6 5-9 6-9 2 0-2 9 0 9s3-5 4.5-5 1 3 2.5 3 2-1 3-2M3 21h18",
  pen: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  bell: "M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 1.8H4.2zM10 20.5a2 2 0 0 0 4 0M12 3v2",
  handshake: "M3 12l4-4 4 2 3-2 7 5-3 3-3-2-3 3-3-1zM7 8l-4 4",
  mortarboard: "M2.5 9.2 12 5l9.5 4.2L12 13.4zM6.5 11v4.6c0 1.4 2.5 2.9 5.5 2.9s5.5-1.5 5.5-2.9V11M21.5 9.2v5.3",
  flag: "M5.5 21V3.5M5.5 4.5c4-2 6.5 2 10.5 0 1-.5 2-.7 2.5-.8v8.6c-.5.1-1.5.3-2.5.8-4 2-6.5-2-10.5 0",
  briefcase: "M3 7.5h18v12H3zM9 7.5V5.6c0-.6.5-1.1 1.1-1.1h3.8c.6 0 1.1.5 1.1 1.1v1.9M3 12.5h18M10.5 12.5v1.6h3v-1.6",
  compass: "M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6zM15.6 8.4l-2.2 5-5 2.2 2.2-5z",
  ticket: "M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM15 7.5v1.5M15 11v2M15 15v1.5",
  users: "M9 11.7a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM3 19.5c.4-3.3 2.8-5.4 6-5.4s5.6 2.1 6 5.4M15.5 5.6a3 3 0 0 1 0 5.8M17.2 14.4c2.2.6 3.6 2.4 3.8 5.1",
  star: "M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.8L12 16.5l-5.1 2.8 1.1-5.8-4.3-4 5.8-.7z",
  institution: "M3 9.5 12 4l9 5.5zM5 9.5v8M9.7 9.5v8M14.3 9.5v8M19 9.5v8M3.5 17.5h17M2.5 20.5h19",
  mogul: "M4 16.5 3 7l5 3.5L12 4.5l4 6L21 7l-1 9.5zM4 19.5h16",
  swords: "M4 4h3.5l9 9M4 4v3.5l9 9M20 4h-3.5l-4 4M20 4v3.5l-4 4M14.5 15.5l4.5 4.5M17 13l-4 4M9.5 15.5 5 20M7 13l4 4",
  hourglass: "M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 4 4.5 5.3 4.5 8.5s-4.5 4.5-4.5 8.5M16.5 3.5c0 4-4.5 5.3-4.5 8.5s4.5 4.5 4.5 8.5",
  anchor: "M12 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 7.5V21M8 11h8M4.5 14c.5 4 3.5 7 7.5 7s7-3 7.5-7",
  key: "M15 3a6 6 0 1 1-5.2 9L3 18.8V21h2.2l1-1v-1.5h1.5L9 17v-1.5h1.5l1.2-1.2M16.5 7.5h.01",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 6h3v2a3 3 0 0 1-3 3M7 6H4v2a3 3 0 0 0 3 3",
  triad: "M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM10.8 7.6 7.2 15M13.2 7.6l3.6 7.4M8.5 17.5h7",
  sides: "M4 8h15l-3.5-3.5M20 16H5l3.5 3.5",
};

// The server's category / prestige icon names, mapped onto this family.
const ICON_ALIAS: Record<string, string> = {
  crossed_swords: "swords",
  mogul_crown: "mogul",
  crown: "mogul",
  flame: "star",
};

/** Achievement id -> [emblem, engraved series value]. */
const BADGES: Record<string, [string, string?]> = {
  // First steps
  welcome_to_the_market: ["door"],
  make_your_mark: ["signature"],
  the_introduction: ["pen"],
  the_opening_bell: ["bell"],
  first_connection: ["handshake"],
  a_title_to_remember: ["mortarboard"],
  ready_set_invest: ["flag"],
  // Portfolios
  the_second_act: ["briefcase", "2"],
  three_of_a_kind: ["briefcase", "3"],
  high_five: ["briefcase", "5"],
  the_portfolio_vault: ["briefcase", "8"],
  the_portfolio_baron: ["briefcase", "12"],
  the_portfolio_empire: ["briefcase", "20"],
  // Discovery
  market_scout: ["compass", "3"],
  talent_spotter: ["compass", "5"],
  eyes_on_the_street: ["compass", "10"],
  network_hunter: ["compass", "25"],
  the_insider_network: ["compass", "50"],
  golden_ticket: ["ticket", "1"],
  the_private_list: ["ticket", "3"],
  members_only: ["ticket", "5"],
  from_fan_to_insider: ["ticket"],
  // Community
  the_first_fan: ["users", "1"],
  small_but_mighty: ["users", "5"],
  the_buzz: ["users", "10"],
  rising_signal: ["users", "25"],
  word_on_the_street: ["users", "50"],
  market_voice: ["users", "100"],
  crowd_favorite: ["users", "250"],
  market_icon: ["users", "1K"],
  first_believer: ["star", "1"],
  backed_by_five: ["star", "5"],
  the_trusted_ten: ["star", "10"],
  the_inner_circle: ["star", "25"],
  the_syndicate: ["star", "50"],
  the_institution: ["star", "100"],
  the_powerhouse: ["institution"],
  the_market_mogul: ["mogul"],
  // Competitions
  enter_the_arena: ["swords", "1"],
  finish_what_you_started: ["flag"],
  back_for_more: ["swords"],
  the_challenger: ["swords", "3"],
  arena_regular: ["swords", "5"],
  the_contender: ["swords", "10"],
  the_circuit: ["swords", "25"],
  arena_legend: ["swords", "50"],
  across_the_seasons: ["swords", "3M"],
  // Dedication
  still_in_the_game: ["hourglass", "30"],
  playing_the_long_game: ["hourglass", "90"],
  the_half_year_mark: ["hourglass", "180"],
  one_year_veteran: ["hourglass", "365"],
  the_two_year_club: ["hourglass", "730"],
  double_anchor: ["anchor", "2"],
  inner_circle_regular: ["ticket", "3M"],
  the_annual_pass: ["ticket", "12M"],
  // Legacy
  founding_member: ["key"],
  the_first_five: ["trophy", "5"],
  the_trophy_case: ["trophy", "15"],
  hall_of_fame: ["trophy", "30"],
  the_full_experience: ["triad"],
  both_sides_of_the_market: ["sides"],
  the_grand_tour: ["compass"],
};

const emblemOf = (id: string, fallback?: string | null) => {
  const known = BADGES[id]?.[0];
  if (known) return known;
  const f = fallback ? ICON_ALIAS[fallback] ?? fallback : "trophy";
  return ICONS[f] ? f : "trophy";
};

/** A category's emblem in the badges' family (for headings). */
export const BadgeIcon = ({ name, className }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={ICONS[ICON_ALIAS[name] ?? name] ?? ICONS.trophy} />
  </svg>
);

const OUTER = "M16 6 H84 V100 L50 85 L16 100 Z";
const INNER = "M23 13 H77 V89 L50 77 L23 89 Z";
const sparkle = (x: number, y: number) =>
  `M${x} ${y - 4} L${x + 1} ${y - 1} L${x + 4} ${y} L${x + 1} ${y + 1} L${x} ${y + 4} L${x - 1} ${y + 1} L${x - 4} ${y} L${x - 1} ${y - 1}Z`;

export type Rarity = "basic" | "advanced" | "rare" | "epic" | "exceptional";

export const Badge = ({
  id,
  rarity,
  earned,
  fallbackIcon,
  className = "",
}: {
  /** The achievement's id. */
  id: string;
  rarity: Rarity | string | undefined;
  earned: boolean;
  /** The server's icon, used when the id is not in the table. */
  fallbackIcon?: string | null;
  className?: string;
}) => {
  const gid = `bg${useId().replace(/:/g, "")}`;
  const gold = `url(#${gid})`;
  const icon = ICONS[emblemOf(id, fallbackIcon)];
  const value = BADGES[id]?.[1];
  const cy = value ? 40 : 47;

  let shape: JSX.Element;
  let ink: string;
  let w = 1.6;
  let extra: JSX.Element | null = null;
  if (!earned) {
    shape = <path d={OUTER} fill="#141417" stroke="rgba(236,227,208,.22)" strokeWidth="1.4" strokeDasharray="4 4" strokeLinejoin="round" />;
    ink = "rgba(236,227,208,.32)";
  } else if (rarity === "advanced") {
    shape = <path d={OUTER} fill="#1C1C21" stroke="rgba(236,227,208,.55)" strokeWidth="1.8" strokeLinejoin="round" />;
    ink = "#ECE3D0";
  } else if (rarity === "rare") {
    shape = (
      <>
        <path d={OUTER} fill="#1C1C21" stroke="#CFAE6E" strokeWidth="2" strokeLinejoin="round" />
        <path d={INNER} fill="none" stroke="#CFAE6E" strokeWidth=".9" opacity=".45" strokeLinejoin="round" />
      </>
    );
    ink = "#CFAE6E";
  } else if (rarity === "epic") {
    shape = (
      <>
        <path d={OUTER} fill="#211D16" stroke={gold} strokeWidth="4" strokeLinejoin="round" />
        <path d={INNER} fill="none" stroke="#EBCB86" strokeWidth="1" opacity=".6" strokeLinejoin="round" />
      </>
    );
    ink = "#EBCB86";
    w = 1.8;
    extra = (
      <>
        <path d={sparkle(84, 6)} fill="#F6DC9C" />
        <path d={sparkle(16, 6)} fill="#F6DC9C" />
      </>
    );
  } else if (rarity === "exceptional") {
    shape = (
      <>
        <path d={OUTER} fill={gold} stroke="#F6DC9C" strokeWidth="1.2" strokeLinejoin="round" />
        <path d={INNER} fill="none" stroke="#3A2C14" strokeWidth="1" opacity=".55" strokeLinejoin="round" />
      </>
    );
    ink = "#2A2010";
    w = 2;
    extra = (
      <>
        <path className="badge-spark" d={sparkle(16, 4)} fill="#F6DC9C" />
        <path className="badge-spark" d={sparkle(84, 4)} fill="#F6DC9C" />
        <path className="badge-spark" d={sparkle(50, 100)} fill="#F6DC9C" />
      </>
    );
  } else {
    shape = <path d={OUTER} fill="#1C1C21" stroke="rgba(236,227,208,.22)" strokeWidth="1.6" strokeLinejoin="round" />;
    ink = "#A9A293";
  }

  const sc = 1.5;
  return (
    <svg className={`prg-badge ${className}`} viewBox="0 0 100 106" aria-hidden="true" focusable="false">
      {(rarity === "epic" || rarity === "exceptional") && earned && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F6DFA6" />
            <stop offset=".5" stopColor="#A7843F" />
            <stop offset="1" stopColor="#E7C680" />
          </linearGradient>
        </defs>
      )}
      {shape}
      <g transform={`translate(${50 - 12 * sc} ${cy - 12 * sc}) scale(${sc})`}>
        <path d={icon} fill="none" stroke={ink} strokeWidth={(w / sc) * 1.4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {value && (
        <text x="50" y="70" textAnchor="middle" fill={ink} fontSize={value.length > 2 ? 12 : 14} fontWeight="700" letterSpacing=".5" fontFamily="Heebo, sans-serif" direction="ltr">
          {value}
        </text>
      )}
      {extra}
    </svg>
  );
};
