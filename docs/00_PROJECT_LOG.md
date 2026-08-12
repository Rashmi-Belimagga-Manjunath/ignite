# IGNITE — Project Log

## Sessions

### Session 1 — foundation
- Fresh scaffold (`productpilot-ai` left untouched; IGNITE chosen as a clean, honest submission).
- Tech decision: Vite 8 + React 19 + Tailwind v4 + `sql.js` + `marked`/DOMPurify; all browser-side, so the
  "organisation" can run on static hosting with zero backend.
- `npm run seed` → real SQLite `public/ignite.db`: 7 tables, 7 products, 10 inventory rows,
  5 locations, 1 operations row, 262 historical sales rows, brand + profile.
- Core libs: `config.js`, `db.js` (sql.js Node/browser loader), `mcp.js` (MCP-style registry with
  business-data + live-signals servers, keyless public APIs), `llm.js` (streaming OpenAI client),
  `agents.js` (five personas + prompts), `orchestrator.js` (pipeline + handoffs + checkpoints),
  `chat.js` (IGNITE COMMAND + follow-up with all five deliverables injected).
- Added the **Manager independent re-verification**: Pilot re-queries weather + cost + recent sales at
  decision time and can turn GO into CONDITIONAL GO / NO-GO.

### Session 2 — UI + verification + deploy prep
- All seven pages and six components; dark aurora design system; run store shared across pages.
- `Settings.jsx` added (route was wired but missing).
- `npm run build` green (52 modules; 448 KB JS / 660 KB WASM gz ~142/326).
- `vite preview` served: bundle contains all page strings; `ignite.db` + `sql-wasm.wasm` 200.
- Docs 00–08, Pages workflow, source-appendix generator (`npm run gendocs`).

## Verified
- `npm run smoke` PASSED: DB loads (7 tables, 262 sales), full 5-agent pipeline with live tools,
  all five deliverables, prototype fence, Manager GO, Manager independent re-query (≥3 calls,
  2 evidence events at decision time).
- Production build + preview healthy.

## Deployed (Session 2, part 2)
- Committed (47 files, 9,289 insertions) → pushed to `github.com/Rashmi-Belimagga-Manjunath/ignite`.
- Repo set **public** (Pages not supported on private for this plan — confirmed with user).
- Pages enabled (`build_type: workflow`); secret `VITE_OPENAI_API_KEY` set from `.env.local` value.
- Deploy triggered with `gh workflow run` (push trigger does not auto-fire here) — **success**.
- Live site verified: `https://rashmi-belimagga-manjunath.github.io/ignite/` — index 200, bundle
  contains all demo markers, `ignite.db` 200 (57,344 B), `sql-wasm-*.wasm` 200 (659,730 B).

## Remaining (optional, pre-pitch)
- Browser click-through of checkpoints + prototype iframe on the live site (engine already verified in Node).
