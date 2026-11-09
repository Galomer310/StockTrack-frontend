# Investments — frontend

The web app for **Investments** (formerly StockTrack): a social investing game
where every player runs virtual model portfolios that start with $10,000,
trades at real quoted prices, explains each trade, and is ranked against
everyone else.

The API lives in
[StockTracker-backend](https://github.com/Galomer310/StockTracker-backend),
which also holds the product spec and roadmap in
[`docs/PRODUCT-SPEC-AND-GAP.md`](https://github.com/Galomer310/StockTracker-backend/blob/main/docs/PRODUCT-SPEC-AND-GAP.md).

Illustrative video: https://youtu.be/XTYVHmeUiLY

---

## Screens

| Path | Screen |
|---|---|
| `/` | Landing page. |
| `/login`, `/register` | Sign in and create an account. |
| `/user` | Dashboard: portfolio switcher, holdings, cash, buy and sell with a required note, allocation and performance charts, trade journal. |
| `/player` | Player Card: the player's profile, level and active title, six headline figures, medals, achievements, competitions, game progress and performance. |
| `/player/achievements` | Game Achievement Collection: totals, the seven categories with their next milestone, and every achievement's state and progress. |
| `/search` | Find a stock and buy it at the market price. |
| `/stock/:ticker` | One stock: quote, chart, fundamentals and news. |
| `/market` | Links out to outside research sites, with a ticker box that opens a stock on the chosen site. |
| `/feed` | Everyone's trades, with reactions and replies. |
| `/leaderboard` | Every portfolio ranked by percentage return. |
| `/investor/:id` | Another player's portfolio, percentages only, and their journal. |
| `/compare/:id` | Your portfolio against another, side by side. |

Every screen except the landing, login and registration pages needs a
signed-in session.

## Languages

The interface is switchable between Hebrew (right to left) and English from
the toggle in the navbar, and the choice is remembered per browser. Every
screen is translated. Copy lives in `src/i18n/messages.ts`, where the Hebrew table is
typed against the English one, so a missing translation fails the build.

## Player Card

Built from the reference design and the Player Card spec (Parts 3 and 4 of
the backend's spec document). It shows the signed-in player's real card from
the backend's `GET /players/me/card`, where every figure is calculated. Figures
whose data or rules do not exist yet show as locked or unavailable with the
reason, rather than invented. Players can edit their first name, bio and
picture from the card. The picture comes from the avatar gallery in
`src/components/avatars` (standalone SVGs; the server stores only the chosen
id and accepts only the ids in its own list, so add new avatars to both).
The chosen picture also appears beside the player's name in the feed and
its replies, the leaderboard, the portfolio page and the follow lists
(`PlayerAvatar`, which falls back to the initial).
Players also choose their username there (checked for availability as it is
typed; rules in `src/api/nickname.ts`, enforced by the server). Uploaded
pictures follow once there is storage.

**The look.** `src/theme.css`, loaded last, gives every page the Player
Card's style: near-black grounds lit by soft gold light, champagne-gold
frames, cream type, Cormorant Garamond / Frank Ruhl Libre headings, and a
gold glow around a card, a header link or a button under the pointer. Dark
mode only; light mode keeps its own palette.

**Test panel.** `/test-tools`, for the account named in the server's
`TEST_PLAYER_EMAILS` only (a "test panel" button appears on its Player
Card). After each tool the app checks for news as for a player, so the
daily notice, capital boost, achievement notices and title ceremony appear
as a player would see them.

**Portfolio Dashboard.** The portfolio switcher is now the spec's carousel
(return, status, age, last updated, sparkline). Module 1, Portfolio
Allocation (`components/allocation`), replaces the old pie: Top 5 + Other +
Cash, a panel per holding, the expanded allocation dashboard and Portfolio
History (the composition matrix, newest on the left). All figures come from
the server.

**Portfolio Activity** (`components/activity`), Module 2: the newest actions
on the dashboard, and an expanded view with the detailed activity (where
the author adds dated follow-ups; the original rationale never changes)
and the composition table. Follow-ups also show in the feed.

**Investment Profile** (`components/profile`), Module 3: the spec's five
dimensions - Risk, Portfolio Volatility, Diversification, Investment
Horizon, Portfolio Turnover - each a horizontal meter with its result, and
an info button opening "About this metric" (what it shows, how it is
measured, how to read it) and the parts behind the number. From
`GET /portfolios/:id/profile`.

**Performance Insights** (`components/insights`), Module 5: the portfolio's
record on investing alone (capital rewards are not return) - total return,
months, drawdown, best and worst days, age - and the S&P 500 and NASDAQ-100
(through the SPY and QQQ funds) over exactly the same dates, with a chart
that starts every series at 100. Every figure comes from
`GET /portfolios/:id/insights`.

**Professional medals** (`components/medals`, `pages/ProfessionalPage`):
classic circular medals in five metals with a restrained aura per tier
(still under reduced motion), on the Player Card (automatic or the
player's choice of four) and in the full collection at /player/medals,
with every professional achievement by category and what is in progress.
Risk & Discipline adds the Capital Protector (shield) and Phoenix Recovery
(phoenix) medals; Phoenix never shows the depth of a fall.
New unlocks and upgrades arrive as one notice, the best medal first.

**Sign-out after inactivity** (`session/idle.ts`, `components/session/IdleWatcher`):
15 minutes without any pointer, key, scroll or touch input in any tab signs
the player out and opens the login page, which says why. A warning counts
down the last minute; any input or "I'm still here" keeps the session. The
moment of the last input is shared by every tab and kept across a browser
restart, so coming back after more than 15 minutes finds the session
already over. Signing out in one tab signs out the others.

**Daily rewards.** `DailyRewardsWatcher` checks in whenever the app opens
(the server decides the day), shows the day's XP and streak, and opens the
capital boost dialog on milestone days: the player picks one portfolio and
sees its value and return before and after (the return does not change).
The Player Card shows the streak, the next milestones and pending rewards;
`/player/rewards` adds the full history.

**Titles and achievements** (Part 5 of the spec document). The active title
sits under the player's level, and "My Title Collection" lists all 60 titles
by category, unlocked and locked. When a new title tier is reached, the
unlock ceremony offers its three titles. Unlock notices appear in the corner
on any page (`ProgressionWatcher`, mounted in `App.tsx`). Anything that can
earn XP calls `requestProgressionCheck()` from `src/api/progression.ts`. The
server decides every state; the screens only display it. Styles live in
`src/components/progression/progression.css`.

**Following.** One click, no approval. The Follow button is on another
player's portfolio page (`FollowButton`); your followers and the players you
follow open from the Followers figure on your own card (`FollowListsDialog`).
Counts are public; the lists are yours alone.

Demo data, kept apart from the components in
`src/features/playerCard/demoData.ts`, is available for design work:
`/player?demo=1` for an established player, `/player?demo=new` for a new one.

`prototypes/player-card.html` is the standalone prototype the page was
ported from. It is not part of the build.

## Tech stack

- React 18, TypeScript, Vite 6
- Redux Toolkit for session and portfolio state
- React Router 7
- Chart.js through react-chartjs-2
- Plain CSS with design tokens (`src/style.css`, `src/responsive.css`, and
  `src/components/playerCard/playerCard.css` for the Player Card)

## Getting started

Prerequisites: Node.js 22, and the backend running.

```bash
npm install
```

Create a `.env` file pointing at the backend:

```env
VITE_BACKEND_API_URL=http://localhost:3000
```

Then:

```bash
npm run dev
```

The app opens at `http://localhost:5173`, which is the origin the backend
allows by default.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload. |
| `npm run build` | Type-check and build to `dist/`. |
| `npm run preview` | Serve the built app locally. |
| `npm run lint` | ESLint. |

## Project structure

```
src/
  App.tsx           routes; every page except the first three loads on demand
  api/              one module per backend area, through axiosInstance
  pages/            one component per screen
  components/       charts, layout, trades, stock detail, toasts, Player Card
  features/         Redux slices, Player Card demo data, demo progression catalog
  i18n/             languages: copy, provider, hook
  charts/           shared Chart.js theme
prototypes/         standalone design prototypes, not built
```

## Deployment

Prepared for Render as a static site: `npm ci && npm run build`, serving
`dist/`. Set `VITE_BACKEND_API_URL` to the backend's address at build time,
and add this site's address to the backend's `CORS_ORIGINS`.

## Contact

For questions or feedback: [galomer6708@gmail.com](mailto:galomer6708@gmail.com)
