# Opsdeck

A dropshipping operations dashboard you own: orders, suppliers, margins, tracking, customers, finance and automation in one place. React frontend, one-file Cloudflare Worker API, Cloudflare D1 database. No SaaS subscription, no per-order limits, your data stays in your account.

- **Live demo:** https://dropship-hub.pages.dev
- **Sales page:** https://dropship-hub.pages.dev/landing.html
- **License:** commercial, see [LICENSE](./LICENSE)

## What you get

| Page | What it does |
| --- | --- |
| Dashboard | Revenue, profit, AOV, pipeline, channel mix, top products, alerts, recent orders |
| Analytics | Margins per channel, forecast, weekday heatmap, supplier scorecard |
| Orders | Filter by channel, status, country, risk; status changes are persisted |
| Products | Cost, price, stock, lead time; create and delete products |
| Tracking | Shipments with carrier, checkpoint, exceptions, ETA |
| Automation | Rules with trigger and action, active/paused, add and delete |
| Connections | Catalogue of 39 services across 7 categories, selection is persisted |
| Customers | Segments, spend, last order, repeat rate |
| Finance | Ledger of payouts, fees, refunds with running balance |

## Architecture

```
Browser (React 18 + Vite + TypeScript + Tailwind)
   │  fetch /api/*
   ▼
Cloudflare Worker      worker/index.ts     routing, validation, CORS
   │  prepared statements
   ▼
Cloudflare D1          worker/schema.sql   SQLite, real persistence
```

`src/lib/store.ts` is the only data layer. It loads `/api/state`, every mutation posts to the API and adopts the state the server returns, so the UI cannot drift from the database. All metrics in `src/lib/metrics.ts` are derived from API data at render time.

## Quickstart, about ten minutes

```bash
git clone https://github.com/rintuchowdory/dropship-hub.git
cd dropship-hub
npm install

# 1. Create the database and paste the id into worker/wrangler.toml
npx wrangler d1 create opsdeck

# 2. Create the tables
npm run db:init

# 3. Local development: API on :8787, app on :5173
npm run api:dev
npm run dev
```

Deploy:

```bash
npm run deploy:api
VITE_API_URL=https://<your-worker>.workers.dev npm run build
npx wrangler pages deploy dist --project-name <your-pages-project> --branch main
```

Both commands need `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

After the first deploy open the app and click **Seed import** in the sidebar to write the starter dataset (899 orders, 16 products, 509 customers, 64 shipments, 79 ledger entries) into **your** database. **Clear** empties it again.

Worker config must live in `worker/wrangler.toml`. A `wrangler.toml` in the repo root makes `wrangler pages deploy` fail with a missing `pages_build_output_dir`.

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

## Customizing

- **Branding:** name and logo in `src/components/Sidebar.tsx`, colours and font in `tailwind.config.js`, font link in `index.html`.
- **Add a page:** create the component in `src/pages`, add the key to `Page` in `src/lib/types.ts`, register it in `src/App.tsx` and in the sidebar groups.
- **Change the data model:** edit `worker/schema.sql`, add the mapping in `worker/index.ts`, extend `src/lib/types.ts`.
- **Legal pages:** `public/impressum.html`, `public/datenschutz.html`, `public/license.html`, shared style in `public/site.css`.

## What is real and what is not

Real: persistence, order status changes, product CRUD, rules, connection selection, all metrics, all pages, the API, the database.

Not included: live sync with Shopify, Amazon, AliExpress, Stripe, AfterShip and the other services in the catalogue. The catalogue stores your selection only. Real sync needs a provider app, credentials and a sync job per provider; the Worker is the place to add them. The README says so on the sales page too, so nobody buys an expectation you cannot deliver.

## License

Commercial one-time license, see [LICENSE](./LICENSE). Solo covers one project, Studio covers unlimited own and client projects. Reselling the source as a template is not allowed.
