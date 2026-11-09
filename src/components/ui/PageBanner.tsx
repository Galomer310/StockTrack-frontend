import "./pageBanner.css";

/* ===========================================================================
   A page's title banner, in the Player Card's language (Gal, 2026-11-09).
   ---------------------------------------------------------------------------
   Replaces the photographs that sat behind the Dashboard and Leaderboard
   titles. Drawn, not a picture: a near-black ground lit by soft gold light,
   a hairline gold frame, a faint grid, and a thin gold performance line
   rising over a few bars to a glowing point - the Player Card's corner
   chart, wider and quieter. The title takes the card's gold.

   The art sits on the side away from the title (inline-end), so it never
   runs under the words in either language. Decorative only.
   =========================================================================== */

const Art = () => (
  <svg className="page-banner-art" viewBox="0 0 520 150" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="pbGold" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#8E6426" />
        <stop offset=".55" stopColor="#D9A94E" />
        <stop offset="1" stopColor="#FFE7A8" />
      </linearGradient>
      <linearGradient id="pbArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D9A94E" stopOpacity=".22" />
        <stop offset="1" stopColor="#D9A94E" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="pbBar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D9A94E" stopOpacity=".35" />
        <stop offset="1" stopColor="#D9A94E" stopOpacity=".04" />
      </linearGradient>
      <radialGradient id="pbGlow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#FFE7A8" stopOpacity=".9" />
        <stop offset=".35" stopColor="#D9A94E" stopOpacity=".35" />
        <stop offset="1" stopColor="#D9A94E" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* A faint grid, like a terminal's. */}
    <g stroke="#D9A94E" strokeOpacity=".08" strokeWidth="1">
      {[30, 60, 90, 120].map((y) => <line key={`h${y}`} x1="0" x2="520" y1={y} y2={y} />)}
      {[80, 160, 240, 320, 400, 480].map((x) => <line key={`v${x}`} x1={x} x2={x} y1="0" y2="150" />)}
    </g>

    {/* Volume-like bars, rising. */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
      const h = 14 + i * 6 + (i % 3) * 5;
      return <rect key={i} x={150 + i * 28} y={150 - h} width="14" height={h} rx="1.5" fill="url(#pbBar)" />;
    })}

    {/* The performance line and the area under it. */}
    <path d="M60 128 C120 122, 160 112, 200 104 S260 96, 290 84 S340 76, 370 58 S430 36, 470 26" fill="none" stroke="url(#pbGold)" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M60 128 C120 122, 160 112, 200 104 S260 96, 290 84 S340 76, 370 58 S430 36, 470 26 L470 150 L60 150 Z" fill="url(#pbArea)" />
    <path d="M458 20l14-2-3 14" fill="none" stroke="url(#pbGold)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

    {/* Its glowing tip, and a few points of light. */}
    <circle cx="470" cy="26" r="16" fill="url(#pbGlow)" />
    <circle cx="470" cy="26" r="2.6" fill="#FFF0C4" />
    {[[430, 50, 1.4], [492, 44, 1], [446, 14, 1.2], [404, 30, 0.9], [500, 16, 1.1]].map(([x, y, r]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#FFE7A8" opacity=".75" />
    ))}
  </svg>
);

export const PageBanner = ({
  title,
  subtitle,
  as: Heading = "h2",
}: {
  title: string;
  subtitle?: string;
  /** h1 on a page whose main title this is. */
  as?: "h1" | "h2";
}) => (
  <section className="page-banner">
    <Art />
    <div className="page-banner-text">
      <Heading className="page-banner-title">{title}</Heading>
      {subtitle && <p className="page-banner-subtitle">{subtitle}</p>}
    </div>
  </section>
);
