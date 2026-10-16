/* ===========================================================================
   Drawn artwork for the Player Card: medal and achievement badges, the
   level emblem, and the title ornaments, after the reference image.
   ---------------------------------------------------------------------------
   Every drawing shares the gradients in <ArtDefs/>, which the page renders
   once. Medals are metal and gem, with depth; achievements are brighter
   hexagons, a little more playful, as the spec asks.
   =========================================================================== */

import type { AwardArt as AwardArtName } from "../../api/playerCard";

const starPoints = (cx: number, cy: number, r: number): string =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

const HEX = "40,4 74,23 74,61 40,80 6,61 6,23";
const HEX_INNER = "40,10 69,26.5 69,57.5 40,74 11,57.5 11,26.5";

export const ArtDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="pcGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF0C2" /><stop offset=".35" stopColor="#F0C871" />
        <stop offset=".7" stopColor="#C08A33" /><stop offset="1" stopColor="#7A5420" />
      </linearGradient>
      <linearGradient id="pcGoldRim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFE7A8" /><stop offset=".5" stopColor="#B9832E" /><stop offset="1" stopColor="#F3D07D" />
      </linearGradient>
      <linearGradient id="pcGreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A6F7B9" /><stop offset=".45" stopColor="#2DB25C" /><stop offset="1" stopColor="#0C5A2C" />
      </linearGradient>
      <linearGradient id="pcBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9FCBFF" /><stop offset=".5" stopColor="#2F6FCF" /><stop offset="1" stopColor="#16346F" />
      </linearGradient>
      <linearGradient id="pcPurple" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#DABCFF" /><stop offset=".5" stopColor="#8752DD" /><stop offset="1" stopColor="#3F1F7E" />
      </linearGradient>
      <linearGradient id="pcTeal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9DEBC8" /><stop offset=".5" stopColor="#2E9C6E" /><stop offset="1" stopColor="#124D37" />
      </linearGradient>
      <linearGradient id="pcSilver" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F4F6FA" /><stop offset=".5" stopColor="#8E97A6" /><stop offset="1" stopColor="#DCE2EA" />
      </linearGradient>
      <radialGradient id="pcDark" cx=".5" cy=".35" r=".7">
        <stop offset="0" stopColor="#2A2620" /><stop offset="1" stopColor="#0B0A09" />
      </radialGradient>
    </defs>
  </svg>
);

const Users = ({ color }: { color: string }) => (
  <g fill={color}>
    <circle cx="40" cy="36" r="6" />
    <path d="M28 56c0-7 5.4-11.5 12-11.5S52 49 52 56z" />
    <circle cx="27" cy="39" r="4.3" />
    <path d="M18 55c0-5 3.5-8.3 8-8.3 1.6 0 3 .4 4.2 1.2-2 2-3.3 4.5-3.6 7.1z" />
    <circle cx="53" cy="39" r="4.3" />
    <path d="M62 55c0-5-3.5-8.3-8-8.3-1.6 0-3 .4-4.2 1.2 2 2 3.3 4.5 3.6 7.1z" />
  </g>
);

const Compass = () => (
  <>
    <circle cx="40" cy="42" r="17" fill="#2B1E0A" stroke="#FFF0C2" strokeWidth="2" />
    <path d="M40 27l4.5 15L40 57l-4.5-15z" fill="#FFF0C2" />
    <path d="M25 42l15-4.5L55 42l-15 4.5z" fill="#E7B95B" />
    <circle cx="40" cy="42" r="2.6" fill="#2B1E0A" />
  </>
);

const HexBadge = ({ fill, children }: { fill: string; children: JSX.Element }) => (
  <>
    <polygon points={HEX} fill="url(#pcGoldRim)" stroke="#5E431A" strokeWidth="1" strokeLinejoin="round" />
    <polygon points={HEX_INNER} fill={fill} />
    <polygon points="40,10 69,26.5 69,40 11,40 11,26.5" fill="#fff" opacity=".12" />
    {children}
  </>
);

const SHIELD = "M40 3l33 11v26c0 22-14 36-33 45C21 76 7 62 7 40V14z";

const DRAWINGS: Record<AwardArtName, JSX.Element> = {
  laurel_trophy: (
    <>
      <g fill="url(#pcGold)">
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={`l${i}`} cx={14 + i * 1.2} cy={66 - i * 9} rx="4" ry="8"
            transform={`rotate(${-35 + i * 8} ${14 + i * 1.2} ${66 - i * 9})`} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={`r${i}`} cx={66 - i * 1.2} cy={66 - i * 9} rx="4" ry="8"
            transform={`rotate(${35 - i * 8} ${66 - i * 1.2} ${66 - i * 9})`} />
        ))}
      </g>
      <circle cx="40" cy="42" r="23" fill="url(#pcDark)" stroke="url(#pcGoldRim)" strokeWidth="3" />
      <path fill="url(#pcGold)" d="M30 29h20v4h5v3c0 5-3.5 8.2-7.8 8.6-1 2.6-2.9 4.5-5.2 5.3V55h5v4H33v-4h5v-5.1c-2.3-.8-4.2-2.7-5.2-5.3C28.5 44.2 25 41 25 36v-3h5zm20 7v5.3c1.8-.7 2.9-2.5 2.9-4.6V36zm-20 0h-2.9v.7c0 2.1 1.1 3.9 2.9 4.6z" />
      <path fill="url(#pcGold)" d="M28 76l12-8 12 8-4 8-8-4-8 4z" />
    </>
  ),
  gem: (
    <>
      <polygon points={HEX} fill="url(#pcDark)" stroke="url(#pcGoldRim)" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="40,14 66,28 66,56 40,70 14,56 14,28" fill="none" stroke="url(#pcGold)" strokeWidth="1.2" opacity=".6" />
      <path fill="url(#pcGreen)" d="M27 33h26l7 9-20 22-20-22z" />
      <path fill="#C9FFD8" opacity=".3" d="M27 33h26l-4 9H31z" />
      <path fill="none" stroke="#EFFFF3" strokeWidth=".8" opacity=".7" d="M27 33l4 9 9 22 9-22 4-9M20 42h40M31 42l9-9 9 9" />
    </>
  ),
  shield_top_percent: (
    <>
      <path fill="url(#pcGold)" d={SHIELD} />
      <path fill="url(#pcDark)" d="M40 11l25 8.4V40c0 17-10.5 28-25 36-14.5-8-25-19-25-36V19.4z" />
      <text x="40" y="51" textAnchor="middle" fontFamily="Heebo, sans-serif" fontWeight="800" fontSize="24" fill="url(#pcGold)" direction="ltr">1%</text>
    </>
  ),
  star_shield: (
    <>
      <path fill="url(#pcSilver)" d={SHIELD} />
      <path fill="url(#pcBlue)" d="M40 10l26 8.7V40c0 17.5-11 29-26 37-15-8-26-19.5-26-37V18.7z" />
      {[[40, 34, 6.5], [27, 44, 4.2], [53, 44, 4.2], [33, 56, 3.4], [47, 56, 3.4], [40, 22, 3]].map(([x, y, r]) => (
        <polygon key={`${x}-${y}`} points={starPoints(x, y, r)} fill="#F4F6FF" />
      ))}
    </>
  ),
  hex_blue: <HexBadge fill="url(#pcBlue)"><Users color="#E8F2FF" /></HexBadge>,
  hex_green: <HexBadge fill="url(#pcTeal)"><Users color="#E6FFF2" /></HexBadge>,
  hex_purple: <HexBadge fill="url(#pcPurple)"><polygon points={starPoints(40, 43, 15)} fill="#F1E6FF" /></HexBadge>,
  hex_gold: <HexBadge fill="url(#pcGold)"><Compass /></HexBadge>,
};

export const AwardArt = ({ art, className }: { art: AwardArtName; className?: string }) => (
  <svg className={className} viewBox="0 0 80 88" aria-hidden="true" focusable="false">
    {DRAWINGS[art]}
  </svg>
);

// The level emblem shows the current level number inside it: the spec
// requires the level in the progression area, which the image leaves out.
export const LevelEmblem = ({ level }: { level: string }) => (
  <svg className="pc-emblem" viewBox="0 0 120 132" aria-hidden="true" focusable="false">
    <polygon points="60,4 112,34 112,98 60,128 8,98 8,34" fill="url(#pcGoldRim)" />
    <polygon points="60,13 104,38.5 104,93.5 60,119 16,93.5 16,38.5" fill="url(#pcDark)" />
    <polygon points="60,20 98,42 98,90 60,112 22,90 22,42" fill="none" stroke="url(#pcGold)" strokeWidth="1.5" opacity=".7" />
    <polygon points={starPoints(60, 56, 22)} fill="url(#pcGold)" />
    <text x="60" y="100" textAnchor="middle" fontFamily="Heebo, sans-serif" fontWeight="800" fontSize="19" fill="#F4D58C">{level}</text>
  </svg>
);

export const TitleOrnament = () => (
  <svg className="pc-ornament" viewBox="0 0 100 14" aria-hidden="true" focusable="false">
    <path d="M0 7h40M60 7h40" stroke="currentColor" strokeWidth="1" opacity=".7" />
    <path d="M50 0l2.2 4.8L57 7l-4.8 2.2L50 14l-2.2-4.8L43 7l4.8-2.2z" fill="currentColor" />
    <circle cx="36" cy="7" r="1.6" fill="currentColor" />
    <circle cx="64" cy="7" r="1.6" fill="currentColor" />
  </svg>
);

export const CornerChart = () => (
  <svg className="pc-corner-chart" viewBox="0 0 150 110" aria-hidden="true" focusable="false">
    {[18, 38, 58, 78, 98].map((x, i) => {
      const y = 100 - i * 14;
      return <rect key={x} x={x} y={y - 10} width="14" height={110 - y + 10} rx="1.5" fill="url(#pcGold)" opacity=".5" />;
    })}
    <path d="M6 96 C40 80, 70 66, 96 40 S128 14, 138 8" fill="none" stroke="url(#pcGold)" strokeWidth="3" strokeLinecap="round" />
    <path d="M126 6l14-2-3 14" fill="none" stroke="url(#pcGold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {[[120, 30], [132, 46], [104, 18], [142, 26], [112, 52]].map(([x, y], i) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={1 + (i % 3) * 0.6} fill="#FFE7A8" opacity=".8" />
    ))}
  </svg>
);
