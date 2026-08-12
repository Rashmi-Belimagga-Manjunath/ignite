# IGNITE Architecture

## System diagram

```
 USER  ── request ──►  IGNITE COMMAND (chat front door)
                            │
                            ▼
                     ORCHESTRATOR (runPipeline)
                            │
   ┌───────────┬───────────┼───────────┬───────────┐
   ▼           ▼           ▼           ▼           ▼
 SCOUT      MUSE        FORGE        VOICE        PILOT
 Researcher  Designer    Maker        Communicator Manager
    │           │           │           │           │
    │  01_Opportunity_Brief.md  02_Design_Specification.md
    │  03_Build_Package.md      04_Launch_Kit.md
    └────────────────────────────────────────────► 05_Executive_Briefing.md
                            │
   ┌────────────────────────┴────────────────────────┐
   ▼                                                 ▼
 LIVE-SIGNALS MCP                           BUSINESS-DATA MCP (custom)
 Open-Meteo · Reddit · Wikipedia · GitHub   SQLite (ignite.db) via sql.js
   (live APIs, queried at call time)         (real database, queried at call time)
```

## Layers

1. **Frontend (React + Vite + Tailwind v4)** — 7 routes. The Operations page renders the live
   pipeline with a split screen: left = agent timeline + evidence, right = the **live artefact**
   (the pop-up website Forge built, rendered in a sandboxed iframe).
2. **Chat engine (`src/lib/chat.js`)** — IGNITE COMMAND, the conversational front door and narrator.
3. **Orchestrator (`src/lib/orchestrator.js`)** — `runPipeline` runs the five agents in order,
   injects each previous agent's **full output** as the next agent's input, streams events
   (`agent:start`, `tool:start`, `evidence`, `agent:delta`, `checkpoint:open`, `agent:end`, …),
   and awaits a human **checkpoint** (approve / revise) after every agent.
4. **MCP layer (`src/lib/mcp.js`)** — a Model Context Protocol-style tool registry. Two servers:
   - `business-data` (custom) — typed access to Mori Coffee's SQLite database.
   - `live-signals` — live public APIs (Open-Meteo, Reddit, Wikipedia, GitHub read-only, Hacker News).
5. **LLM client (`src/lib/llm.js`)** — minimal OpenAI streaming client with function-calling support.
6. **Data layer (`src/lib/db.js`)** — loads `public/ignite.db` in-browser via sql.js (WASM) and runs
   read-only SQL.

## Data flow for one run

1. **Scout** fires live tool calls: business DB (profile, products, locations, historical sales),
   then **Open-Meteo forecasts for every candidate location**, then Reddit + Wikipedia. Every call
   streams a `tool:start` / `tool:end` pair and an `evidence` row (source, API, count, timestamp).
2. Scout's brief is written to `01_Opportunity_Brief.md`.
3. **Muse** receives the brief **in full**, writes `02_Design_Specification.md`.
4. **Forge** receives the design spec, writes `03_Build_Package.md` containing a complete,
   self-contained HTML prototype (extracted and rendered live).
5. **Voice** receives the build package, writes `04_Launch_Kit.md`.
6. **Pilot** receives all of it AND **independently re-queries** the live forecast + cost
   structure + recent sales (the "live verification"), then writes `05_Executive_Briefing.md`
   with the GO / NO-GO decision.

## Why the handoff is unbroken

- Each agent's prompt contains the **previous agent's real output** verbatim (`INPUT FILE: …`).
- The Researcher **cannot** design, the Designer **cannot** build, the Maker **cannot** market,
  the Communicator **cannot** decide — each agent's scope is enforced in its system prompt.
- The Manager does not trust the first agent's findings: it re-queries the live data before deciding.

## Security

- The OpenAI key lives only in the browser (`localStorage`) or the `VITE_OPENAI_API_KEY` build
  secret. Agents stream directly to `api.openai.com`.
- All DB queries are read-only SELECT (the query guard rejects DROP/UPDATE/INSERT/DELETE).
- Generated HTML is rendered in a **sandboxed iframe** (`sandbox="allow-scripts allow-popups allow-forms"`),
  and all markdown is sanitised with DOMPurify.
- Live sources are all keyless, CORS-enabled public APIs; failures are surfaced to the model and UI,
  never faked.
