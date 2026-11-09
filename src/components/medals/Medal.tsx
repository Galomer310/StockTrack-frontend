import { useId } from "react";
import "./medals.css";

/* ===========================================================================
   A professional medal (spec 5): a classic circular medal on a short
   ribbon, in the metal of its tier, with the track's engraved symbol.
   ---------------------------------------------------------------------------
   Tiers: 1 Bronze, 2 Silver, 3 Gold, 4 Platinum, 5 Sovereign (champagne gold
   with royal detailing). `decoration` engraves small marks under the symbol
   for the evolutions of the fifth tier (Sovereign II / III, Green Months'
   years). The aura is CSS (medals.css): restrained, slower and richer as the
   tier rises, and still when the viewer asks for reduced motion.
   =========================================================================== */

type Metal = { hi: string; mid: string; lo: string; edge: string };

const METALS: Record<number, Metal> = {
  1: { hi: "#F0C29C", mid: "#B97A4C", lo: "#6A3E22", edge: "#4A2A16" },
  2: { hi: "#F7F9FB", mid: "#C3C9D0", lo: "#727982", edge: "#4D535A" },
  3: { hi: "#FCEAB0", mid: "#D9A94E", lo: "#8A6420", edge: "#5E4313" },
  4: { hi: "#F2F7FB", mid: "#C4D3DE", lo: "#76899A", edge: "#4A5C6B" },
  5: { hi: "#FFF4D6", mid: "#E7C886", lo: "#A07C3C", edge: "#6B5022" },
};

// Engraved symbols, drawn in a 40 x 40 box centred on the medal.
const Symbol = ({ icon }: { icon: string }) => {
  switch (icon) {
    case "line_over_benchmark":
      return (
        <>
          <path d="M4 28 H36" strokeDasharray="3 3" />
          <path d="M4 32 L14 24 L21 27 L36 9" />
          <path d="M29 9 H36 V16" />
        </>
      );
    case "calendar_over_benchmark":
      return (
        <>
          <rect x="6" y="9" width="28" height="24" rx="2" />
          <path d="M6 15 H34 M13 6 V11 M27 6 V11" />
          <path d="M10 29 L17 23 L22 25 L30 18" />
        </>
      );
    case "upward_chart":
      return (
        <>
          <path d="M5 34 H35" />
          <path d="M9 34 V27 M16 34 V22 M23 34 V16 M30 34 V10" strokeWidth="3.4" />
          <path d="M7 20 L30 5 M24 5 H30 V11" />
        </>
      );
    case "green_calendar":
      return (
        <>
          <rect x="6" y="9" width="28" height="24" rx="2" />
          <path d="M6 15 H34 M13 6 V11 M27 6 V11" />
          <path d="M11 20 h4 M18 20 h4 M25 20 h4 M11 26 h4 M18 26 h4" strokeWidth="3" />
          <path d="M25 27 l2.5 2.5 l5 -6" />
        </>
      );
    case "shield_growth":
      return (
        <>
          <path d="M20 4 L33 9 V19 C33 27 27 33 20 36 C13 33 7 27 7 19 V9 Z" />
          <path d="M13 24 L18 19 L22 22 L28 14" />
        </>
      );
    case "first_laurel":
      // A laurel around a numeral one: the first on the platform.
      return (
        <>
          <path d="M11 31 C6 26 5 18 9 11 M29 31 C34 26 35 18 31 11" />
          <path d="M8.5 25 l-3 -1.5 M7.5 19 l-3 -0.5 M9 13.5 l-2.5 -2 M31.5 25 l3 -1.5 M32.5 19 l3 -0.5 M31 13.5 l2.5 -2" />
          <path d="M17 15 L21 12 V30 M17 30 H25" />
        </>
      );
    case "three_lines":
      // Three portfolios rising above the benchmark's dashed line.
      return (
        <>
          <path d="M4 27 H36" strokeDasharray="2.5 3" />
          <path d="M12 35 V15 M20 35 V8 M28 35 V12" strokeWidth="4.2" />
        </>
      );
    case "five_lines":
      // Five portfolios above the benchmark.
      return (
        <>
          <path d="M3 27 H37" strokeDasharray="2.5 3" />
          <path d="M8 35 V17 M14 35 V11 M20 35 V7 M26 35 V12 M32 35 V16" strokeWidth="3.2" />
        </>
      );
    case "crowned_chart":
      return (
        <>
          <path d="M12 12 L14 6 L18 10 L20 5 L22 10 L26 6 L28 12 Z" />
          <path d="M6 35 H34 M10 35 V28 M17 35 V23 M24 35 V19 M31 35 V15" strokeWidth="3.2" />
        </>
      );
    case "five_stars":
      return (
        <>
          {[[20, 9], [9, 18], [31, 18], [13, 30], [27, 30]].map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x} ${y - 4.5} L${x + 1.4} ${y - 1.4} L${x + 4.5} ${y - 1.1} L${x + 2.1} ${y + 1} L${x + 2.8} ${y + 4.2} L${x} ${y + 2.5} L${x - 2.8} ${y + 4.2} L${x - 2.1} ${y + 1} L${x - 4.5} ${y - 1.1} L${x - 1.4} ${y - 1.4} Z`} />
          ))}
        </>
      );
    case "alpha":
      // The Greek alpha, with three marks for three portfolios.
      return (
        <>
          <path d="M27 14 C25 22 22 29 16 29 C11 29 9 25 9 21.5 C9 17 12 13.5 16 13.5 C21 13.5 23 20 25 25 C26 28 28 29.5 31 29" />
          <path d="M14 34 h2 M19 34 h2 M24 34 h2" strokeWidth="2.6" />
        </>
      );
    case "phoenix":
      // A minimalist phoenix: wings raised, crest, a short tail. No flames.
      return (
        <>
          <path d="M20 33 C17.5 28 17.5 22 20 17.5 C22.5 22 22.5 28 20 33 Z" />
          <path d="M19 21 C14 17 9 15.5 4.5 9 C10 11 14.5 11.5 18.4 16" />
          <path d="M21 21 C26 17 31 15.5 35.5 9 C30 11 25.5 11.5 21.6 16" />
          <path d="M20 17.5 V12.5 M17.8 13.6 L20 11 L22.2 13.6" />
          <path d="M20 33 L16.5 37.5 M20 33 L23.5 37.5" />
        </>
      );
    default:
      return <circle cx="20" cy="20" r="10" />;
  }
};

export const Medal = ({
  icon,
  tier,
  decoration = 0,
  size = 96,
  aura = true,
  label,
  className = "",
}: {
  icon: string;
  tier: number;
  decoration?: number;
  size?: number;
  aura?: boolean;
  /** Accessible name; omit when the medal sits beside its own text. */
  label?: string;
  className?: string;
}) => {
  const id = useId().replace(/:/g, "");
  const m = METALS[Math.min(5, Math.max(1, tier))];
  const marks = Math.min(6, decoration);
  return (
    <span
      className={`medal tier-${tier}${aura ? " has-aura" : ""} ${className}`}
      style={{ inlineSize: size, blockSize: size * 1.25 }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 120 150" width={size} height={size * 1.25}>
        <defs>
          <linearGradient id={`rim${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={m.hi} />
            <stop offset="0.45" stopColor={m.mid} />
            <stop offset="1" stopColor={m.lo} />
          </linearGradient>
          <radialGradient id={`face${id}`} cx="0.38" cy="0.32" r="0.8">
            <stop offset="0" stopColor={m.hi} />
            <stop offset="0.55" stopColor={m.mid} />
            <stop offset="1" stopColor={m.lo} />
          </radialGradient>
          <linearGradient id={`ribbon${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16192A" />
            <stop offset="1" stopColor="#0B0D16" />
          </linearGradient>
        </defs>

        {/* A short upper ribbon: two tails, one stripe in the metal. */}
        <path d="M38 2 H58 L64 44 H46 Z" fill={`url(#ribbon${id})`} />
        <path d="M62 2 H82 L74 44 H56 Z" fill={`url(#ribbon${id})`} />
        <path d="M46 2 H50 L56 44 H52 Z M70 2 H74 L68 44 H64 Z" fill={m.mid} opacity="0.85" />

        {/* The medal. */}
        <circle cx="60" cy="96" r="50" fill={`url(#rim${id})`} stroke={m.edge} strokeWidth="1.2" />
        <circle cx="60" cy="96" r="41" fill={`url(#face${id})`} stroke={m.edge} strokeWidth="0.8" />
        <circle cx="60" cy="96" r="44.5" fill="none" stroke={m.hi} strokeOpacity="0.55" strokeWidth="0.8" />
        {tier >= 5 && (
          // Royal detailing: a fine beaded ring and a crown point.
          <>
            <circle cx="60" cy="96" r="47" fill="none" stroke={m.edge} strokeWidth="1.4" strokeDasharray="0.1 3.6" strokeLinecap="round" />
            <path d="M54 51 L57 46 L60 50 L63 46 L66 51 Z" fill={m.hi} stroke={m.edge} strokeWidth="0.8" />
          </>
        )}
        {tier >= 4 && <circle cx="60" cy="96" r="37.5" fill="none" stroke={m.edge} strokeOpacity="0.45" strokeWidth="0.7" />}

        {/* The engraved symbol: a dark cut with a light edge below it. */}
        <g transform="translate(40 74)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g stroke={m.hi} strokeOpacity="0.7" strokeWidth="2.6" transform="translate(0.6 0.8)">
            <Symbol icon={icon} />
          </g>
          <g stroke={m.edge} strokeWidth="2.4">
            <Symbol icon={icon} />
          </g>
        </g>

        {marks > 0 && (
          <g fill={m.edge}>
            {Array.from({ length: marks }, (_, i) => (
              <circle key={i} cx={60 + (i - (marks - 1) / 2) * 7} cy="124" r="2" />
            ))}
          </g>
        )}
      </svg>
      {aura && <span className="medal-sheen" aria-hidden="true" />}
    </span>
  );
};
