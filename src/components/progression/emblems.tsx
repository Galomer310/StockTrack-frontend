/* ===========================================================================
   Thin-line emblems for titles and game achievements.
   ---------------------------------------------------------------------------
   One stroke weight, drawn on a 24-unit grid in currentColor, so a category
   is told apart by its shape and its accent colour and never by a heavier
   or busier drawing. Names match the `icon` field the server sends (title
   categories, achievement categories, and the two prestige achievements).
   =========================================================================== */

import type { ReactNode } from "react";

const PATHS: Record<string, ReactNode> = {
  // Title categories
  mortarboard: (
    <>
      <path d="M2.5 9.2 12 5l9.5 4.2L12 13.4z" />
      <path d="M6.5 11v4.6c0 1.4 2.5 2.9 5.5 2.9s5.5-1.5 5.5-2.9V11" />
      <path d="M21.5 9.2v5.3" />
    </>
  ),
  flame: (
    <>
      <path d="M12 21c-3.6 0-6-2.5-6-5.8 0-3.7 3.1-5.4 3.6-9.2 2.9 1.8 4.3 4.3 4 7.3 1.1-.6 1.8-1.8 2-3 1.6 1.5 2.4 3.3 2.4 5 0 3.2-2.4 5.7-6 5.7z" />
      <path d="M12 21c-1.5 0-2.6-1.1-2.6-2.6 0-1.7 1.4-2.5 2.6-4 1.2 1.5 2.6 2.3 2.6 4 0 1.5-1.1 2.6-2.6 2.6z" />
    </>
  ),
  crown: (
    <>
      <path d="M4 17.5 3 7.8l5 3.7L12 5.5l4 6 5-3.7-1 9.7z" />
      <path d="M4.5 20h15" />
    </>
  ),
  // Achievement categories
  flag: (
    <>
      <path d="M5.5 21V3.5" />
      <path d="M5.5 4.5c4-2 6.5 2 10.5 0 1-.5 2-.7 2.5-.8v8.6c-.5.1-1.5.3-2.5.8-4 2-6.5-2-10.5 0" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="1.6" />
      <path d="M9 7.5V5.6c0-.6.5-1.1 1.1-1.1h3.8c.6 0 1.1.5 1.1 1.1v1.9" />
      <path d="M3 12.5h18M10.5 12.5v1.6h3v-1.6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m15.6 8.4-2.2 5-5 2.2 2.2-5z" />
      <path d="M12 3.2v1.6M12 19.2v1.6M3.2 12h1.6M19.2 12h1.6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19.5c.4-3.3 2.8-5.4 6-5.4s5.6 2.1 6 5.4" />
      <path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.2 14.4c2.2.6 3.6 2.4 3.8 5.1" />
    </>
  ),
  crossed_swords: (
    <>
      <path d="M4 4h3.5l9 9M4 4v3.5l9 9" />
      <path d="M20 4h-3.5l-4 4M20 4v3.5l-4 4" />
      <path d="m14.5 15.5 4.5 4.5M17 13l-4 4M9.5 15.5 5 20M7 13l4 4" />
    </>
  ),
  hourglass: (
    <>
      <path d="M6.5 3.5h11M6.5 20.5h11" />
      <path d="M7.5 3.5c0 4 4.5 5.3 4.5 8.5s-4.5 4.5-4.5 8.5M16.5 3.5c0 4-4.5 5.3-4.5 8.5s4.5 4.5 4.5 8.5" />
      <path d="M9.5 18.5c.8-1.3 1.6-1.9 2.5-1.9s1.7.6 2.5 1.9z" />
    </>
  ),
  // Prestige achievements
  institution: (
    <>
      <path d="M3 9.5 12 4l9 5.5z" />
      <path d="M5 9.5v8M9.7 9.5v8M14.3 9.5v8M19 9.5v8" />
      <path d="M3.5 17.5h17M2.5 20.5h19" />
    </>
  ),
  mogul_crown: (
    <>
      <path d="M4 16.5 3 7l5 3.5L12 4.5l4 6L21 7l-1 9.5z" />
      <path d="M4 19.5h16" />
      <circle cx="12" cy="12.6" r="1.4" />
      <path d="M3 7h.01M12 4.5h.01M21 7h.01" strokeWidth="2.6" />
    </>
  ),
  // Interface
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="1.8" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </>
  ),
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
};

export const Emblem = ({ name, className }: { name: string; className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {PATHS[name] ?? PATHS.crown}
  </svg>
);

// A small four-point star between hairlines: the gold ornament under the level.
export const Ornament = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 12" aria-hidden="true" focusable="false">
    <path d="M0 6h50M70 6h50" stroke="currentColor" strokeWidth="0.75" opacity=".55" />
    <path d="M60 0.5l1.6 3.9L65.5 6l-3.9 1.6L60 11.5l-1.6-3.9L54.5 6l3.9-1.6z" fill="currentColor" />
  </svg>
);

// The ceremony's crest: a diamond frame with the emblem inside.
export const Crest = ({ className, children }: { className?: string; children?: ReactNode }) => (
  <span className={className}>
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M32 2 62 32 32 62 2 32z" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M32 9 55 32 32 55 9 32z" fill="none" stroke="currentColor" strokeWidth="0.6" opacity=".6" />
    </svg>
    <span className="prg-crest-inner">{children}</span>
  </span>
);
