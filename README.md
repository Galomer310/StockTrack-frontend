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
the toggle in the navbar, and the choice is remembered per browser. The
navbar, sign-in pages, Dashboard, Market, Search, stock page, Player Card and
achievement collection are translated; the other screens are moving over one
at a time. Copy lives in `src/i18n/messages.ts`, where the Hebrew table is
typed against the English one, so a missing translation fails the build.

## Player Card

Built from the reference design and the Player Card spec (Parts 3 and 4 of
the backend's spec document). It shows the signed-in player's real card from
the backend's `GET /players/me/card`, where every figure is calculated. Figures
whose data or rules do not exist yet show as locked or unavailable with the
reason, rather than invented. Players can edit their first name and bio from
the card; the nickname and picture follow once their rules and storage are
decided.

**Titles and achievements** (Part 5 of the spec document). The active title
sits under the player's level, and "My Title Collection" lists all 60 titles
by category, unlocked and locked. When a new title tier is reached, the
unlock ceremony offers its three titles. Unlock notices appear in the corner
on any page (`ProgressionWatcher`, mounted in `App.tsx`). Anything that can
earn XP calls `requestProgressionCheck()` from `src/api/progression.ts`. The
server decides every state; the screens only display it. Styles live in
`src/components/progression/progression.css`.

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
