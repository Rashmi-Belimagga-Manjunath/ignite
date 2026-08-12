# Data Layer

Two distinct data sources power the agents, and both are **queried at the moment of use** —
nothing is hardcoded or snapshotted into the prompts.

## 1. Business Data — real SQLite database

`public/ignite.db` is a real SQLite database for **Mori Coffee** (a specialty coffee brand in Dublin).
It is opened in the browser with sql.js (WASM) and queried through the custom **Business-Data MCP**.

| Table | Purpose | Volume |
|---|---|---|
| `business_profile` | brand details, stage, mission, constraints | 1 row |
| `products` | menu items with real `price`, `cost`, `margin`, `category` | 7 rows |
| `inventory` | stock levels, units, min-stock thresholds | 10 rows |
| `locations` | 5 candidate pop-up sites (name, address, rent, footfall, capacity, fee) | 5 rows |
| `operations` | overheads: staff hourly rate, setup/teardown, equipment, daily costs | 1 row |
| `historical_sales` | 6 months of daily sales by product | 262 rows |
| `brand` | voice, audience, tone (used by Niamh Gallagher) | 1 row |

Rebuild with `npm run seed` (script: `scripts/seed.mjs`). All SQL reads go through a read-only guard.

## 2. Live Signals — live external APIs (queried at call time)

The **Live-Signals MCP** (server: `live-signals`) wraps public, keyless APIs. Each call happens when
the agent invokes the tool — the model never sees stale data.

| Tool | Source | What it returns |
|---|---|---|
| `get_weather_forecast` | Open-Meteo (no API key) | hourly/3-hourly temp, precip probability, rain, wind, humidity for a lat/lon |
| `get_market_discussion` | Reddit JSON (public) | titles, scores, comment counts, links, subreddit, top keywords |
| `get_signal_background` | Wikipedia REST API | article extract, summary, references, categories |
| `get_live_github_activity` | GitHub REST API (read-only, no auth) | recent repo activity, stars, issues, descriptions |
| `get_hacker_news_trends` | Hacker News Algolia API | top stories, points, comments, timestamps |

Every tool returns `{ ok, data, ms, ts }` so the UI can show **source, latency, timestamp**.

## 3. The MCP layer (`src/lib/mcp.js`)

A lightweight Model-Context-Protocol-style registry:

```js
MCP_SERVERS  → { "business-data": {…}, "live-signals": {…} }
listTools()  → all tools across both servers
callTool(name, args) → { ok, data, ms, ts }  (or { ok:false, error })
```

Both "servers" run entirely in the browser — no backend needed to demo a working MCP architecture.

## 4. Evidence model (`src/lib/evidence.js`)

Each agent run records an **evidence trail**: `{ tool, label, source, api, count, ts }`. The UI
renders this in the Evidence panel (source + API + record count + timestamp) with a confidence score
(`computeConfidence`) derived from how many independent live signals the claim rests on.

## Why this satisfies the brief

> "Synthetic data must live in a real queryable source and be fetched at query time."

✓ The data lives in a **real SQLite database** (`ignite.db`).
✓ It is **fetched at query time** — the agents run SQL against it in the browser during every run.
✓ At least one agent (**Amara Osei**, and again **Elias Voss**) calls a **live external API at query time** (Open-Meteo).
