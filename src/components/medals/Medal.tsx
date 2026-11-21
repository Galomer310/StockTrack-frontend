import { useId } from "react";
import "./medals.css";

/* ===========================================================================
   A professional medal, design B: "by meaning". Each track has its own
   shape, so the medal says what was achieved before its name is read.
   ---------------------------------------------------------------------------
     bars      Beat the Market, quarterly: the rim cut into four quarters,
               the last bar breaks through the market's dashed line.
     calendar  Beat the Market, annual / monthly combo: a watch bezel with
               twelve months, the year engraved.
     trend     Portfolio performance: the arrow breaks out of the frame.
     cal12     Green months: a dot per month; every tier lights more.
     shield    Capital protector: a shield; the line never touches the floor.
     phoenix   Phoenix recovery: wings that grow with every tier.
     gem       The special, platform-wide medals: a cut gem.

   Tiers: 1 Bronze, 2 Silver, 3 Gold, 4 Platinum, 5 Sovereign. Each tier
   has its own effect, stronger as the tier rises (medals.css); still when
   the viewer asks for reduced motion. `decoration` adds small marks for the
   evolutions beyond the fifth tier.
   =========================================================================== */

type Metal = { name: string; c: string; stops: [string, string, string] };

const METALS: Record<number, Metal> = {
  1: { name: "bronze", c: "#D9A07A", stops: ["#E7B08A", "#9C6440", "#D49A70"] },
  2: { name: "silver", c: "#E3E7EC", stops: ["#F4F6F9", "#8E959F", "#DDE1E7"] },
  3: { name: "gold", c: "#EBCB86", stops: ["#F6DFA6", "#A7843F", "#E7C680"] },
  4: { name: "platinum", c: "#CFE0F5", stops: ["#F0F5FC", "#7F97B8", "#CFE0F5"] },
  5: { name: "sovereign", c: "#F6DC9C", stops: ["#FFEDBE", "#B98F3E", "#F3D58E"] },
};

type Shape = "bars" | "calendar" | "trend" | "cal12" | "shield" | "phoenix" | "gem";

// The server's medal icon (and, where two tracks share an icon, its id).
export const medalShape = (icon: string, medalId?: string): Shape => {
  if (medalId === "btm_annual" || medalId === "btm_monthly_combo") return "calendar";
  switch (icon) {
    case "line_over_benchmark":
      return "bars";
    case "calendar_over_benchmark":
      return "calendar";
    case "upward_chart":
      return "trend";
    case "green_calendar":
      return "cal12";
    case "shield_growth":
      return "shield";
    case "phoenix":
      return "phoenix";
    default:
      return "gem";
  }
};

const sparkle = (x: number, y: number) =>
  `M${x} ${y - 4} L${x + 1} ${y - 1} L${x + 4} ${y} L${x + 1} ${y + 1} L${x} ${y + 4} L${x - 1} ${y + 1} L${x - 4} ${y} L${x - 1} ${y - 1}Z`;

const CROWN = "M3 18l2-10 5 5 2-7 2 7 5-5 2 10z";
const LIT: Record<number, number> = { 1: 1, 2: 3, 3: 6, 4: 9, 5: 12 };
const WING: Record<number, number> = { 1: 0.55, 2: 0.7, 3: 0.85, 4: 1, 5: 1.12 };
const WING_PATH =
  "M0 0 C-6 -5 -13 -13 -18 -26 C-16 -16 -18 -13 -22 -10 C-16 -6 -13 -3 -11 0 C-18 0 -21 3 -24 8 C-16 8 -8 6 0 5 Z";

const line = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Medal = ({
  icon,
  tier,
  medalId,
  year,
  decoration = 0,
  size = 96,
  aura = true,
  label,
  className = "",
}: {
  icon: string;
  tier: number;
  /** The track's id, where two tracks share an icon. */
  medalId?: string;
  /** The year engraved on the annual medal; omitted, the bezel shows "12". */
  year?: string;
  decoration?: number;
  size?: number;
  aura?: boolean;
  /** Accessible name; omit when the medal sits beside its own text. */
  label?: string;
  className?: string;
}) => {
  const id = useId().replace(/:/g, "");
  const level = Math.min(5, Math.max(1, tier));
  const m = METALS[level];
  const c = m.c;
  const metal = `url(#mt${id})`;
  const disc = `url(#dc${id})`;
  const shape = medalShape(icon, medalId);
  // Only a plain year is engraved; other period keys stay off the metal.
  const engraved = year && /^\d{4}$/.test(year) ? year : undefined;
  const marks = Math.min(6, decoration);
  const rim = (r: number) => <circle cx="50" cy="52" r={r} fill={disc} stroke={metal} strokeWidth="5" />;

  let body: JSX.Element;
  switch (shape) {
    case "bars":
      body = (
        <>
          <circle cx="50" cy="52" r="43" fill={disc} />
          <circle cx="50" cy="52" r="43" fill="none" stroke={metal} strokeWidth="5" strokeDasharray="60.5 7" strokeDashoffset="-3.5" transform="rotate(-90 50 52)" />
          <path d="M24 72 H76" stroke={c} strokeWidth="1" opacity=".4" />
          <path d="M22 56 H78" stroke={c} strokeWidth="1.2" strokeDasharray="3 3" opacity=".65" />
          {[[28, 9], [38, 13], [48, 11]].map(([x, h]) => (
            <rect key={x} x={x} y={72 - h} width="7" height={h} rx="1" fill={c} opacity=".7" />
          ))}
          <rect x="60" y="30" width="8" height="42" rx="1" fill={c} />
        </>
      );
      break;
    case "calendar":
      body = (
        <>
          {rim(43)}
          <circle cx="50" cy="52" r="33" fill="none" stroke={c} strokeWidth=".8" opacity=".4" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = ((i * 30 - 90) * Math.PI) / 180;
            const r1 = i % 3 === 0 ? 33.5 : 35.5;
            return (
              <line
                key={i}
                x1={(50 + r1 * Math.cos(a)).toFixed(1)}
                y1={(52 + r1 * Math.sin(a)).toFixed(1)}
                x2={(50 + 39 * Math.cos(a)).toFixed(1)}
                y2={(52 + 39 * Math.sin(a)).toFixed(1)}
                stroke={c}
                strokeWidth={i % 3 === 0 ? 2 : 1}
              />
            );
          })}
          <text x="50" y="58" textAnchor="middle" fill={c} fontSize={engraved ? 16 : 18} fontWeight="700" fontFamily="Heebo, sans-serif">
            {engraved ?? "12"}
          </text>
        </>
      );
      break;
    case "trend":
      body = (
        <>
          {rim(43)}
          <polyline points="24,72 38,57 48,63 64,44 94,12" {...line} stroke="#151518" strokeWidth="9" />
          <polyline points="24,72 38,57 48,63 64,44 94,12" {...line} stroke={c} strokeWidth="3.2" />
          <polyline points="81,12 94,12 94,25" {...line} stroke={c} strokeWidth="3.2" />
        </>
      );
      break;
    case "cal12":
      body = (
        <>
          {rim(43)}
          {Array.from({ length: 12 }, (_, j) => {
            const b = ((j * 30 - 90) * Math.PI) / 180;
            const x = (50 + 34 * Math.cos(b)).toFixed(1);
            const y = (52 + 34 * Math.sin(b)).toFixed(1);
            return j < LIT[level] ? (
              <circle key={j} cx={x} cy={y} r="3" fill={c} />
            ) : (
              <circle key={j} cx={x} cy={y} r="2.6" fill="none" stroke={c} strokeWidth=".9" opacity=".4" />
            );
          })}
          <path d="M50 70 V50 M50 55 C50 46 56 41 64 41 C64 49 58 55 50 55 M50 61 C50 53 44 49 36 49 C36 57 42 61 50 61" {...line} stroke={c} strokeWidth="2" />
        </>
      );
      break;
    case "shield":
      body = (
        <>
          <path d="M50 6 L86 17 V48 C86 73 70 89 50 98 C30 89 14 73 14 48 V17 Z" fill={disc} stroke={metal} strokeWidth="5" strokeLinejoin="round" />
          <path d="M50 15 L78 24 V48 C78 68 66 81 50 89 C34 81 22 68 22 48 V24 Z" fill="none" stroke={c} strokeWidth=".8" opacity=".4" />
          <path d="M30 68 H70" stroke={c} strokeWidth="1.4" strokeDasharray="3 3" opacity=".7" />
          <polyline points="30,58 40,54 48,57 58,46 69,38" {...line} stroke={c} strokeWidth="2.6" />
          <polyline points="62,38 69,38 69,45" {...line} stroke={c} strokeWidth="2.6" />
        </>
      );
      break;
    case "phoenix":
      body = (
        <>
          <path d={WING_PATH} fill={metal} transform={`translate(14 48) scale(${WING[level]})`} />
          <path d={WING_PATH} fill={metal} transform={`translate(86 48) scale(${-WING[level]} ${WING[level]})`} />
          {rim(40)}
          <path d="M50 74 C40 68 39 56 46 47 C46 53 49 56 52 56 C50 47 54 39 61 35 C59 43 65 50 64 60 C63 68 57 73 50 74 Z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />
          <path d="M50 70 C46 67 46 62 49 58 C50 62 53 63 54 66 C53 68 52 70 50 70 Z" fill={c} opacity=".6" />
        </>
      );
      break;
    default:
      body = (
        <>
          <path d="M28 18 H72 L92 42 L50 96 L8 42 Z" fill={disc} stroke={metal} strokeWidth="4" strokeLinejoin="round" />
          <path d="M8 42 H92 M28 18 L39 42 L50 18 L61 42 L72 18 M39 42 L50 96 L61 42" fill="none" stroke={c} strokeWidth="1" opacity=".55" />
          <path d={sparkle(84, 14)} fill={c} />
        </>
      );
  }

  return (
    <span
      className={`medal tier-${level}${aura ? " has-aura" : ""} ${className}`}
      style={{ inlineSize: size, blockSize: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="-16 -18 132 132" width={size} height={size} overflow="visible">
        <defs>
          <linearGradient id={`mt${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={m.stops[0]} />
            <stop offset={level === 5 ? ".45" : ".5"} stopColor={m.stops[1]} />
            <stop offset="1" stopColor={m.stops[2]} />
          </linearGradient>
          <radialGradient id={`dc${id}`} cx="50%" cy="35%" r="70%">
            <stop offset="0" stopColor="#202026" />
            <stop offset="1" stopColor="#101013" />
          </radialGradient>
        </defs>

        {aura && level === 4 && (
          <circle className="medal-halo" cx="50" cy="52" r="56" fill="none" stroke="#9FC0E8" strokeWidth="1.2" strokeDasharray="3 9" opacity=".7" />
        )}
        {aura && level === 5 &&
          [[-6, 14], [106, 16], [-8, 92], [108, 94]].map(([x, y]) => (
            <path key={`${x}${y}`} className="medal-spark" d={sparkle(x, y)} fill="#F6DC9C" />
          ))}

        {body}

        {level === 5 && (
          <g transform="translate(36 -17) scale(1.15)">
            <path d={CROWN} {...line} stroke={metal} strokeWidth="1.8" />
          </g>
        )}

        {marks > 0 && (
          <g fill={c}>
            {Array.from({ length: marks }, (_, i) => (
              <circle key={i} cx={50 + (i - (marks - 1) / 2) * 6} cy="104" r="1.8" />
            ))}
          </g>
        )}
      </svg>
    </span>
  );
};
