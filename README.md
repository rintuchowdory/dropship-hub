# Dropship Hub

A real, working dropshipping operations hub: **React frontend + Cloudflare Worker API + D1 (SQLite) database**. Not a mockup — orders, products, rules and connections are written to a real database and survive reloads, browsers and devices.

- **App:** https://dropship-hub.pages.dev
- **API:** https://dropship-hub-api.chowdoryrintu.workers.dev

## What is actually real

| Area | Status |
| --- | --- |
| Persistence | **Real.** Cloudflare D1 behind a Worker; every page reads `/api/state` |
| Order status changes | **Real.** `PATCH /api/orders/:id` updates the row in D1 |
| Product create / delete | **Real.** `POST /api/products`, `DELETE /api/products/:id` |
| Automation rules | **Real.** Rules are stored, toggled and deleted in D1 |
| Connections | **Real persistence**, but the connect flow stores the intent only |
| Channel sync | **Not implemented.** Live Shopify/Amazon/etc. sync needs OAuth apps and webhooks; the module boundaries for it are in `worker/index.ts` |
| Payments / tracking | Stored records and analytics, no carrier or PSP API calls |

The "Seed import" button writes the bundled 90-day starter dataset (~900 orders, 16 products, 509 customers, 64 shipments, 79 ledger entries) **into the database** as ordinary rows. Nothing in the UI is hardcoded.

## Architecture

```
Browser (React 18 + Vite + Tailwind)
   │  fetch  /api/*
   ▼
Cloudflare Worker  worker/index.ts      ← routing, validation, CORS
   │  prepared statements
   ▼
Cloudflare D1      dropship-hub         ← worker/schema.sql
```

`src/lib/store.ts` is the single data layer: it loads `/api/state`, and every mutation posts to the API and adopts the state the server returns, so the UI can never drift from what is persisted. All derived numbers (margins, forecasts, heatmaps, alerts) are computed in `src/lib/metrics.ts` from API data.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness plus order count |
| GET | `/api/state` | Full state for the dashboard |
| POST | `/api/seed` | Wipe and import the starter dataset |
| POST | `/api/reset` | Wipe all tables |
| PATCH | `/api/orders/:id` | `{ status }` |
| POST | `/api/products` | Create product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/rules` | Create rule |
| PATCH | `/api/rules/:id` | `{ enabled }` |
| DELETE | `/api/rules/:id` | Delete rule |
| PUT | `/api/connections` | `{ id, connected }` |

## Local development

```bash
npm install
npx wrangler d1 create dropship-hub        # once, then copy database_id into worker/wrangler.toml
npm run db:init                            # create tables (remote)
npm run api:dev                            # Worker on http://localhost:8787
npm run dev                                # Vite on http://localhost:5173, proxies /api
```

## Deploy

```bash
npm run deploy:api                         # Worker + API
VITE_API_URL=https://dropship-hub-api.chowdoryrintu.workers.dev npm run build
npm run deploy:web                         # Cloudflare Pages project "dropship-hub"
```

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Pages

Dashboard, Analytics, Orders, Products, Tracking, Automation, Connections, Customers, Finance — all fed by the API.

## License

MIT © Rintu Chowdory
