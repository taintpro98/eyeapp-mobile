# Handoff: AlumiEye — Mobile App

## Overview
AlumiEye is a Vietnamese-markets trading companion (VN-Index / VN30 KPIs, trading
signals, watchlist, positions, portfolio, analytics, AI insights). There is an
existing **web frontend**. This package describes how to bring that same product
to a **native mobile app**, carrying over the web app's warm-purple design language.

The deliverable in this conversation was a set of phone mockups in two directions:
- **Variation 1 — Faithful**: iOS, light theme, warm `#F4F0EA` surfaces, bottom tab bar.
- **Variation 2 — Native**: Android, dark theme, elevated take.
- **Navigation proposal**: how to fit the web app's **8 destinations** into a mobile bottom bar.

## About the Design Files
`AlumiEye Mobile.dc.html` (+ `support.js`) is a **design reference created in HTML** —
a prototype showing intended look, layout, and behavior. It is **not production code
to copy directly**. The task is to **recreate these designs in the mobile app's
environment** using its established patterns, components, and libraries.

Open it in a browser to view all screens side by side (it is a labeled-frame canvas,
not a running app). If `support.js` fails to load offline, read the HTML source
directly — the inline styles fully specify every screen.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and component treatments
are specified below and in the HTML. Recreate the UI faithfully using the mobile
codebase's libraries — match the tokens, don't pixel-trace the HTML.

---

## Recommended Implementation Path

**If the web FE is React → React Native + Expo.** Reuse the web app's **API client,
auth flow, and TypeScript models**; rebuild only the presentation layer (which these
mockups specify). Alternatives discussed: PWA + Capacitor (fastest, reuses almost
everything), or Flutter (separate native codebase, reuses only the API contract).

Suggested structure (Expo + expo-router or React Navigation):
- Bottom-tab navigator implementing the **4 + More** design (see Navigation below)
- One screen component per destination
- Each screen consumes the **same data hooks / endpoints** as the web app
- Live data (VN-Index, positions P&L, signals) via the web app's existing
  websocket or polling layer

---

## STEP 0 — Learn how the web FE calls the API (do this first, in the real repo)
Before building screens, extract and document the existing data layer. Look for:

- **API client / base layer** — `axios`/`fetch` wrapper, base URL, interceptors, error handling
- **Auth** — how tokens are obtained, stored, refreshed, attached to requests (JWT / OAuth / session)
- **Data fetching** — React Query / SWR / Redux hooks, query keys, caching, polling intervals,
  and any **websocket** subscriptions for real-time market data
- **Types / models** — `Position`, `Signal`, `Quote`, `Portfolio`, `WatchlistItem`, etc.
- **One feature end-to-end** — e.g. Positions (`Vị thế`): component → hook → endpoint

Produce a short `API_NOTES.md` mapping each mobile screen below to the endpoint(s)/hook(s)
that feed it. The mobile app should share these contracts, not reinvent them.

---

## Navigation (key decision)

The web app has **8 destinations**. A mobile bottom bar holds **5 slots max**.
Split them: keep the 4 highest-frequency destinations always visible + a 5th **More**
slot that opens a bottom sheet for the rest.

| Web (VN) | English | Placement |
|---|---|---|
| Bảng điều khiển | Dashboard | **Bottom bar** |
| Thị trường | Market | **Bottom bar** |
| Tín hiệu | Signals | **Bottom bar** |
| Vị thế | Positions | **Bottom bar** |
| Danh sách theo dõi | Watchlist | More sheet |
| Danh mục | Portfolio | More sheet |
| Phân tích | Analytics | More sheet |
| Phân tích AI | AI Analysis (Premium) | More sheet (locked badge) |

- **Bottom bar**: 5 slots — Dashboard · Market · Signals · Positions · More.
  Active item uses an accent pill background + accent label.
- **More sheet**: bottom sheet with a grab handle, "More" title + close, a 2-column
  grid of tiles for the 4 secondary destinations (AI Analysis shows a "Premium" lock
  badge), then a divider and list rows for Settings and Help & support.
- Icons: Dashboard = 2×2 grid, Market = bars, Signals = lightning bolt, Positions =
  concentric-circle target, More = horizontal three-dots.

---

## Design Tokens

### Type
- Family: **Inter** (400/500/600/700). Numeric data uses `font-variant-numeric: tabular-nums`.
- Monospace labels (eyebrows, KPI captions): system `ui-monospace`, uppercase, ~10–11px, letter-spacing .08em.
- Scale on phone: screen title 21–22px/700; card value 20–21px/600; card label 11.5px/500; body 12.5–14px.

### Color — Light theme (iOS / Variation 1)
| Role | Hex |
|---|---|
| Brand / primary | `#6F2C91` |
| Brand gradient | `#8B5FBF` → `#4B1F63` |
| App surface | `#F4F0EA` |
| Card surface | `#FFFFFF` |
| Card border | `#E7DFD6` |
| Hairline divider | `#F0EBE3` |
| Text primary | `#2E2630` |
| Text muted | `#6E6470` |
| Positive | `#16A34A` |
| Negative | `#DC2626` |

### Color — Dark theme (Android / Variation 2)
| Role | Hex |
|---|---|
| Brand / primary | `#6F2C91` |
| Accent (on dark) | `#B794D4` |
| App surface | `#18181B` |
| Card surface | `#27272A` |
| Card / chip border | `#3F3F46` |
| Nav bar surface | `#1E1E21` |
| Text primary | `#FAFAFA` |
| Text muted | `#A1A1AA` |
| Text faint | `#71717A` / `#52525B` |
| Positive | `#4ADE80` |
| Negative | `#F87171` |
| Status (running/opened/closing) | `#B794D4` / `#60A5FA` / `#FBBF24` |

### Radius & elevation
- Cards: 13–14px · chips/buttons: 9–11px · pills: 999px · sheet top: 26px
- Phone bezels (mock only): iOS 43px screen / 54px case; Android 35px / 42px
- Card shadow (light): `0 1px 3px rgba(46,38,48,.04)`
- Bottom bar height: ~74–80px

---

## Screens / Views
Each below exists as a frame in the HTML. Recreate per theme as appropriate.

### Dashboard (Bảng điều khiển)
- **Purpose**: markets-at-a-glance landing.
- **Layout**: app header (avatar + "ALumiEye" + bell + profile) → page title ("Welcome, Minh")
  with a Stocks/Crypto segmented toggle → scrollable content.
- **Components**: 2×2 **KPI grid** (VN-Index, VN30, HOSE Value, Net Foreign — value +
  % change colored positive/negative); **Recent signals** card (rows: ticker, Buy/Sell ·
  strength, time-ago; "View all signals" link); **Unlock Premium** upsell card.

### Market (Thị trường)
- **Purpose**: browse Vietnam equities (HOSE).
- **Components**: subtitle "Vietnam equities · HOSE"; **ticker list** card (FPT, VHM, VIC …
  with price + % change, hairline dividers); **Market sentiment** card (Bullish/Neutral/Bearish
  horizontal bars with % labels).

### Signals (Tín hiệu)
- **Purpose**: trading signal feed.
- **Components**: title "Trading signals"; search field; signal cards (ticker, action,
  strength, confidence, time).

### Positions (Vị thế)
- **Purpose**: open/closed trade positions with live P&L. *(Highlighted by the user as
  important — kept as a primary bar tab.)*
- **Components**: back chevron + "Positions" title + refresh; **filter chips**
  (All / Running / Opened / Closing / Closed) + "Active" checkbox; **position cards**:
  ticker + BUY/SELL badge + status pill (Running/Opened/Closing, color-coded),
  left accent border (green/red by side), time-ago + style tag (Swing/Intraday),
  and a 2-col data grid — Avg price (with secondary stop price in red), Size,
  **Capacity** progress bar with %, Current price, **Return** % (colored).

### Portfolio (Danh mục)
- **Purpose**: allocation & holdings.
- **Components**: 3 small KPI tiles (Total value, Cash + %, Positions count);
  **Allocation** card with a **conic-gradient donut** (center shows holdings count)
  and a legend list (ticker, % change colored, weight %).

### Watchlist (Danh sách theo dõi)
- **Purpose**: user-tracked tickers. (In More sheet.) Build a saved-tickers list with
  quick price/% and add/remove.

### Analytics (Phân tích)
- **Purpose**: performance & risk. (In More sheet.) Charts/metrics over the portfolio.

### AI Analysis (Phân tích AI) — **Premium**
- **Purpose**: AI insights & forecasts. (In More sheet.) Gated behind a Premium lock;
  show a "Premium" badge and an upgrade path when locked.

---

## Interactions & Behavior
- Bottom-tab switch between the 4 primary screens; **More** opens a bottom sheet (scrim +
  slide-up, ~26px top radius, grab handle, tap-scrim/close to dismiss).
- Segmented toggles (Stocks/Crypto), filter chips (single-select), "Active" checkbox.
- Live/real-time: VN-Index, position Current price + Return, signal feed — wire to the
  web app's websocket/polling layer; show loading skeletons and error/empty states.
- Pull-to-refresh on list screens; refresh icon on Positions.
- Premium gating on AI Analysis.

## State Management
- Auth/session (token + refresh), current user.
- Per-screen query state via the web app's hooks (or RN equivalents): markets, signals,
  positions (+ filter), portfolio/allocation, watchlist, analytics.
- UI state: active tab, More-sheet open/closed, segmented + filter selections.

## Assets
- Icons are simple inline SVG line icons (lucide-style). Use the codebase's existing
  icon library (e.g. `lucide-react-native`) — do not ship the mock SVGs.
- No raster images required; the allocation donut is a conic gradient.
- Logo: "A" avatar on a `#8B5FBF → #4B1F63` gradient + "ALumiEye" wordmark.

## API Reference — verified against `taintpro98/eyeapp-frontend`

> Read from the real FE (`src/lib/api.ts`, `src/api/*`, `src/config/navigation.ts`).
> Backend: **`https://eyeapp-backend.fly.dev`**. Swagger: `/docs/index.html`.

### Base client (`src/lib/api.ts`)
- **Base URL**: `${VITE_BACKEND_URL}/api/v1`
- `apiFetch<T>(path, { accessToken?, method?, body? })` — sends `Content-Type: application/json`;
  if `accessToken` is given, adds `Authorization: Bearer <token>`.
- **401 handling**: one silent refresh then retry (a shared promise dedupes concurrent 401s);
  refresh fn is registered at startup to avoid a circular import.
- **Error shape**: `{ error: { code, message } }` → thrown as `Error` with `.status` and `.code`.
- No React Query/SWR and **no websockets** in the api layer — "live" data is a **polling endpoint**.
  Mobile: wrap these in TanStack Query with `refetchInterval` for VN-Index, position P&L, signals.

### Markets are addressed by `market_id`
`market_id: 1` = **stocks (HOSE)**, `2` = **crypto**. The Stocks/Crypto toggle = `1` / `2`.

### Auth (`src/api/auth.ts`) — JWT with refresh rotation
| Method | Endpoint | Body / returns |
|---|---|---|
| POST | `/auth/register` | `{ email, password, display_name }` → `{ message }` |
| POST | `/auth/login` | `{ email, password }` → `{ user, tokens{ access_token, refresh_token, expires_in } }` |
| POST | `/auth/refresh` | `{ refresh_token }` → `AuthResponse` |
| POST | `/auth/logout` | `{ refresh_token? }` |
| GET | `/me` | (bearer) → `{ user }` |
| POST | `/auth/verify-email` · `/auth/resend-verification-email` | email verification |

`User = { id, email, display_name, role, status }`.
**Mobile note**: store tokens in **`expo-secure-store`** (not localStorage). Web keeps them in a
Zustand store (`useAuthStore.getState().getAccessToken()`).

### Endpoints per screen
| Screen | Call | Endpoint |
|---|---|---|
| Markets / entitlements | `fetchAllMarkets` / `fetchUserMarkets` | `GET /markets` · `GET /me/markets` |
| Subscribe (free) | `subscribeFreeMarket` | `POST /me/subscriptions { market_id }` |
| Signals | `fetchSignals` | `GET /signals/{marketId}?limit&offset&symbol` → `{ total, items[] }` |
| Positions | `fetchPositions` | `GET /positions/{marketId}?limit&offset&is_active&status&symbol` |
| Position detail | `fetchPositionDetail` | `GET /positions/{marketId}/{id}` (+ `orders[]`) |
| Position live P&L | `fetchPositionLive` | `GET /positions/{marketId}/{id}/live` → `current_price, current_pnl, position_return` |
| Portfolio | `fetchPortfolio` | `GET /market/{marketId}/portfolio` |
| Watchlist | `fetchWatchlist` | `GET /watchlist/{marketId}` → `{ total, items[] }` (`latest_price`) |
| Analysis (AI) | `fetchAnalysis` | `GET /market/{marketId}/analysis/{symbol}` (⚠ no token passed — public) |

### Key types (lift verbatim into the mobile app)
- **Position**: `{ id, symbol, market_id, side: 'buy'|'sell', status: 'running'|'opening'|'opened'|'closing'|'cancelling'|'closed', term: 'short_term'|'mid_term', active, avg_price, stop_loss, size, capacity, booked_pnl, realized_pnl, timestamp_str, ... }`. `PositionLive` adds `current_price, current_pnl, position_return`.
- **Signal**: `{ id, symbol, market_id, side, signal_type, main_position, price, quantity, confidence, timestamp_str }`.
- **PortfolioResponse**: `{ total_capital, total_portfolio_value, cash, cash_weight, holdings[] }`; holding has `weight, current_value, position_return, avg_price, current_price`.
- **AnalysisResult**: `{ live_price, mid_term, short_term, rating: 'A'|'B+'|'B'|'C'|'D'|'F' }`, each trend = `{ trend, signal, strength }`.
- **UserMarket** drives **premium gating**: `features[].accessible` + `required_plan` (used by AI Analysis lock).

### ⚠ Gaps / things to confirm against Swagger
- **Dashboard data is not a real endpoint yet** — `src/api/bootstrap.ts` returns `mockBootstrap`
  (the VN-Index / VN30 / HOSE Value / Net Foreign / Market-sentiment tiles are mock). Find or add
  a real dashboard/index endpoint before wiring the Dashboard screen.
- **Real-time** is polling, not websockets — confirm acceptable intervals with backend.
- `fetchAnalysis` sends **no auth** while the UI gates AI behind premium — confirm whether the
  endpoint is truly public or whether mobile should attach the token.

### Mobile mapping (so screens ↔ data are unambiguous)
Dashboard→(bootstrap, TBD) · Market→`/markets`+`/analysis` · Signals→`/signals/{m}` ·
Positions→`/positions/{m}` (+`/live` poll) · Watchlist→`/watchlist/{m}` ·
Portfolio→`/market/{m}/portfolio` · Analytics→(portfolio + positions history) · AI Analysis→`/analysis/{symbol}` (premium).

## Files
- `AlumiEye Mobile.dc.html` — all screens (iOS light, Android dark, navigation proposal). Design reference.
- `support.js` — runtime for opening the HTML reference in a browser. Not part of the app.
