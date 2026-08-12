# Frontend

React 19 + Vite 8 + Tailwind CSS v4 (via `@tailwindcss/vite`), `react-router-dom`, `marked` + DOMPurify,
`sql.js`. Dark, aurora-lit studio aesthetic; Space Grotesk / Inter / JetBrains Mono.

## Routes (`src/App.jsx`)

| Route | Page | Purpose |
|---|---|---|
| `/` | `Home` | Hero, MOVES value props, live-data proof card, demo transcript, artefact list |
| `/operations` | `Operations` | **The demo centre** — run the pipeline live, split-screen: timeline + evidence (left), live prototype + decision (right) |
| `/data` | `LiveData` | The MCP console — test every live tool, explore the SQLite database |
| `/agents` | `Agents` | The five agents: flip-card roster + the unbroken chain |
| `/artefacts` | `Artefacts` | All five deliverables as tabs, downloadable; embedded prototype |
| `/chat` | `Chat` | IGNITE COMMAND — conversational front door + narrator events + live pipeline panel |
| `/settings` | `Settings` | API key + model; live-data explainer |

## Shared state (`src/lib/store.js`, `src/hooks/useRun.js`)

A tiny pub/sub run store so multiple pages (Operations and Chat) see the **same** running pipeline.
`useRun` exposes `start`, `approve`, `revise`, `stop` and streams the run + events + result.

## Key components

- **`PipelineFlow`** — animated 5-node pipeline diagram (Scout→Muse→Forge→Voice→Pilot).
- **`RunTimeline`** — agent-by-agent timeline: INPUT/OUTPUT file blocks, tool checklist with live
  ✓/…/✗ states, animated progress fill, and the **human checkpoint** bar (approve / revise with note).
- **`EvidencePanel`** — source + API + record count + timestamp for every live query, plus the
  Manager's "live re-verification" and "revenue cross-check" rows, with confidence bar.
- **`PrototypeFrame`** — extracts the ```` ```html ```` fence from Forge's output and renders it in a
  **sandboxed iframe** with a code/toggle tab.
- **`Markdown`** — marked + DOMPurify sanitisation.

## The Operations page flow

1. User clicks **START IGNITE** (gated on an API key being present).
2. Pipeline runs live: Scout streams tool calls → evidence appears → checkpoint opens → user approves.
3. … through Muse, Forge, Voice.
4. Pilot re-queries live data → issues decision → **GO / NO-GO / REVISE** banner.
5. The right pane updates in real time: after Forge it shows the **working prototype**; after Pilot,
   the **executive decision** with revenue/cost/contribution/confidence.

## Design language

- `gradient-text` amber→orange gradient on headlines; `bg-grid` + `aurora` background; `.card` panels.
- Flip-card agent roster; indet-bar animation during streaming; reduced-motion respected.
- Each agent has a brand colour + glow (`src/lib/agents.js`) used across the timeline, roster and evidence.
