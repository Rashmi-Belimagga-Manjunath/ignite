# IGNITE — The Autonomous Venture Launch Studio

Five specialised AI agents — a **Researcher**, **Designer**, **Maker**, **Communicator** and **Manager** —
work as one unbroken pipeline. Each has its own system prompt, personality and domain expertise.
Each agent's *actual output* becomes the next agent's *input*. Together they research, design, build,
market and decide on a real business — using **live data queried at the moment of use**.

> "This is not a report about AI. This is AI, working."

## The assignment mapped

| Requirement | How IGNITE satisfies it |
|---|---|
| Exactly five agents | Amara Osei (Researcher) → Lena Kovács (Designer) → Dara O'Brien (Maker) → Niamh Gallagher (Communicator) → Elias Voss (Manager) |
| Each has its own system prompt, personality, domain expertise | `src/lib/agents.js` — distinct persona, colour, motto, superpower, scope, tools, system prompt |
| Handoffs unbroken | Every agent's output file (`01_Opportunity_Brief.md` … `05_Executive_Briefing.md`) is passed **in full** as the next agent's INPUT. No agent can do another's job. |
| At least one agent connects to a live external source via tool call / MCP | `src/lib/mcp.js` — the **Live-Signals MCP** calls Open-Meteo, Reddit, Wikipedia and GitHub (read-only) *at query time*. Never hardcoded or cached. |
| Synthetic data lives in a real queryable source, fetched dynamically | `public/ignite.db` — a real SQLite database (Mori Coffee's business data) opened in-browser with sql.js and queried via the **Business-Data MCP** at runtime |
| Tangible output | Dara O'Brien builds a **working, clickable pop-up website** (rendered live in a sandboxed iframe); the Manager issues a GO / NO-GO decision |
| Human-in-the-loop (differentiator) | Human checkpoints after every agent (approve / revise) + the Manager **independently re-queries the live forecast** at decision time |

## The demo

**Mori Coffee** — a small specialty coffee brand with **€3,000** wants a weekend pop-up in Dublin.

> "I have a coffee brand, €3,000, and want to launch something in Dublin this weekend."

One request → the organisation takes over:
1. **Amara Osei** queries Mori Coffee's database, live Dublin weather (Open-Meteo) and live market discussions (Reddit/Wikipedia).
2. **Lena Kovács** designs the pop-up concept, experience, menu and brand direction.
3. **Dara O'Brien** builds the actual pop-up website (live prototype in the interface).
4. **Niamh Gallagher** writes the launch campaign.
5. **Elias Voss** independently re-queries the live forecast and business numbers, then decides **GO / NO-GO / REVISE** with expected revenue, cost, contribution, confidence and risks.

## Read order

1. `docs/02_ARCHITECTURE.md` — how the whole system fits together
2. `docs/03_AGENTS.md` — the five agents and their contracts
3. `docs/04_DATA_LAYER.md` — the databases, live APIs and the MCP layer
4. `docs/05_FRONTEND.md` — the website: pages and components
5. `docs/06_SETUP_AND_DEPLOYMENT.md` — run it, deploy it
6. `docs/07_FILE_MANIFEST.md` — file inventory
7. `docs/08_SOURCE_APPENDIX.md` — full source, generated

## Quick start

```bash
npm install
npm run seed      # builds public/ignite.db
npm run dev       # local dev at http://localhost:5173
```

Set the API key: `VITE_OPENAI_API_KEY=sk-… npm run dev`, or paste it in **Settings** in the app.
