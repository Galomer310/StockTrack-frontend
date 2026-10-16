/* Line and solid icons used across the Player Card. Decorative: every icon
   sits next to text that already says what it means. */

export type IconName =
  | "info" | "lock" | "trend" | "users" | "user" | "medal" | "trophy" | "cycle_up"
  | "crown" | "star" | "person" | "pencil" | "laurel" | "bars" | "folders"
  | "folder_check" | "calendar" | "gem" | "podium" | "first";

const PATHS: Record<IconName, JSX.Element> = {
  info: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 11v6" strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
    </g>
  ),
  lock: <path fill="currentColor" d="M7 10V7.5a5 5 0 0 1 10 0V10h.6c.8 0 1.4.6 1.4 1.4v8.2c0 .8-.6 1.4-1.4 1.4H6.4C5.6 21 5 20.4 5 19.6v-8.2C5 10.6 5.6 10 6.4 10H7zm2 0h6V7.5a3 3 0 0 0-6 0V10z" />,
  trend: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 18l6-6 4 4 9-9" />
      <path d="M15 7h6.5v6.5" />
    </g>
  ),
  users: (
    <g fill="currentColor">
      <circle cx="12" cy="7.2" r="3.3" />
      <path d="M5.6 19.5c0-3.8 2.9-6.5 6.4-6.5s6.4 2.7 6.4 6.5z" />
      <circle cx="5.1" cy="9" r="2.4" />
      <path d="M.8 18.4c0-2.8 2-4.7 4.4-4.7 1 0 1.9.3 2.6.8-1.4 1.2-2.3 2.7-2.5 3.9z" />
      <circle cx="18.9" cy="9" r="2.4" />
      <path d="M23.2 18.4c0-2.8-2-4.7-4.4-4.7-1 0-1.9.3-2.6.8 1.4 1.2 2.3 2.7 2.5 3.9z" />
    </g>
  ),
  user: (
    <g fill="currentColor">
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4 21c0-4.6 3.6-7.8 8-7.8s8 3.2 8 7.8z" />
    </g>
  ),
  person: (
    <g fill="currentColor">
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4 21c0-4.6 3.6-7.8 8-7.8s8 3.2 8 7.8z" />
    </g>
  ),
  medal: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M7 2l3.3 6.7M17 2l-3.3 6.7" />
      <circle cx="12" cy="15" r="6.4" />
      <path fill="currentColor" stroke="none" d="M12 11.4l1.1 2.3 2.5.4-1.8 1.7.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.8-1.7 2.5-.4z" />
    </g>
  ),
  trophy: <path fill="currentColor" d="M6.8 2.2h10.4v2.3H21V7c0 3-2.2 5.1-5 5.5a5.7 5.7 0 0 1-2.9 3.2V18h3.4v2.8H7.5V18h3.4v-2.3a5.7 5.7 0 0 1-2.9-3.2C5.2 12.1 3 10 3 7V4.5h3.8zm10.4 4.5v3.7c1.2-.5 2-1.6 2-3.3v-.4zm-10.4 0H4.8v.4c0 1.7.8 2.8 2 3.3z" />,
  cycle_up: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.2 12a8.2 8.2 0 1 1-3-6.4" />
      <path d="M17.6 2.6v3.4h3.3" />
      <path d="M7.5 15l3.4-3.4 2.2 2.2L17.2 9.7" />
      <path d="M14.3 9.7h2.9v2.9" />
    </g>
  ),
  crown: <path fill="currentColor" d="M3 7.5l4.5 4 4.5-6.5 4.5 6.5 4.5-4-1.8 10.5H4.8zM5 19.5h14V21H5z" />,
  star: <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  pencil: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19z" />
      <path d="M14 7l3.5 3.5" />
    </g>
  ),
  laurel: <path fill="currentColor" d="M7 21c-3.5-2.5-5-6.5-4-11 .5 3 2 5.5 4.5 7.3zM5 9.5C4.4 7 5 4.5 6.8 2.5c0 2.4.4 4.6 1.6 6.6zM17 21c3.5-2.5 5-6.5 4-11-.5 3-2 5.5-4.5 7.3zm2-11.5c.6-2.5 0-5-1.8-7 0 2.4-.4 4.6-1.6 6.6z" />,
  bars: (
    <g fill="currentColor">
      <rect x="3" y="14" width="4" height="7" rx="1" />
      <rect x="10" y="9" width="4" height="12" rx="1" />
      <rect x="17" y="4" width="4" height="17" rx="1" />
    </g>
  ),
  folders: (
    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M3 7h6l2 2h10v10H3z" />
      <path d="M6 4h5l2 2" />
    </g>
  ),
  folder_check: (
    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
      <path d="M3 6h6l2 2h10v11H3z" />
      <path d="M9 13.5l2.2 2.2L15.5 11" />
    </g>
  ),
  calendar: (
    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8 15l2.5-2.5 2 2L16 11" />
    </g>
  ),
  gem: <path fill="currentColor" d="M6 3h12l4 6-10 12L2 9z" />,
  podium: (
    <g fill="currentColor">
      <path d="M9 9h6v12H9zM2 13h6v8H2zM16 15h6v6h-6z" />
      <path d="M12 2.5l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" />
    </g>
  ),
  first: (
    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="7.5" />
      <path d="M8 2.5l2.5 4M16 2.5l-2.5 4" />
      <path d="M11 10.5l1.6-1V17" />
    </g>
  ),
};

export const Icon = ({ name, className }: { name: IconName; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {PATHS[name]}
  </svg>
);
