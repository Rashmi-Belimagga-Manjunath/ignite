# The Five Agents

Each agent embodies one of the five innovation archetypes from the brief. Each has its own system
prompt, personality and domain expertise. The chain is unbroken: **output of one = input of the next**.

| # | Agent | Persona | Archetype | Superpower | Produces |
|---|-------|---------|-----------|------------|----------|
| 1 | **Scout** | 🕵️ Researcher | Identify the opportunity | Deep analysis & pattern recognition | `01_Opportunity_Brief.md` |
| 2 | **Muse** | 🎨 Designer | Create the solution | Creative problem-solving & design thinking | `02_Design_Specification.md` |
| 3 | **Forge** | ⚙️ Maker | Build the product | Technical craftsmanship & rapid prototyping | `03_Build_Package.md` (+ working prototype) |
| 4 | **Voice** | 📣 Communicator | Get the customers | Persuasion & storytelling | `04_Launch_Kit.md` |
| 5 | **Pilot** | 🧭 Manager | Run the business | Leadership & orchestration | `05_Executive_Briefing.md` |

## 1. Scout — Researcher

- **Personality:** curious, sceptical, evidence-first; refuses to speculate without a source.
- **Scope:** research and intelligence only. Never designs, builds, or markets.
- **Live data:** queries Mori Coffee's database (profile, products, locations, historical sales),
  then **Open-Meteo forecasts for every candidate location**, then Reddit + Wikipedia.
- **Output:** an Opportunity Brief with business constraints, live weather window, live market
  signals, historical sales insight, a location scorecard, an opportunity score, and one recommended direction.

## 2. Muse — Designer

- **Personality:** imaginative, customer-obsessed, systematic; thinks in moments and journeys.
- **Scope:** design only. Never writes production code or marketing copy.
- **Input:** Scout's full brief. **Output:** a Design Specification — concept, design principles,
  target persona, service flow, menu & pricing (from Mori's real products), brand direction, customer
  journey, the digital experience spec, capacity & risk, success metrics.

## 3. Forge — Maker

- **Personality:** practical, precise, obsessive about working output.
- **Scope:** build only. Works from the spec, never redesigns.
- **Input:** Muse's design spec. **Output:** a Build Package whose centrepiece is a **complete,
  self-contained, working HTML prototype** of the pop-up website (hero, real menu prices, live
  spots-left counter, reservation form → confirmation with a booking ID). The prototype is extracted
  and rendered live in a sandboxed iframe. Also: architecture, reservation flow, GIVEN/WHEN/THEN
  acceptance criteria, build risks.

## 4. Voice — Communicator

- **Personality:** charismatic, strategic, customer-obsessed; sells the night, not the beans.
- **Scope:** distribution and storytelling only. Never modifies the product.
- **Input:** Forge's build package + Scout's brief. **Output:** a Go-To-Market Launch Kit — campaign
  concept, Instagram content plan, email, ad, day-by-day launch strategy, key messages, CTAs.

## 5. Pilot — Manager

- **Personality:** decisive, accountable, commercially minded; stress-tests every assumption.
- **Scope:** evaluates and orchestrates. Never re-does specialist work.
- **Input:** all four prior deliverables **plus** a live verification block it re-queries itself.
- **Output:** an Executive Briefing — pipeline summary, **GO / NO-GO / REVISE** recommendation,
  expected revenue (with stated assumptions), estimated cost (real numbers), expected contribution,
  confidence, **live verification (re-queried data vs the Researcher's claims)** , key risks, pilot
  instructions, KPIs.

## Why the Manager's live verification matters

The organisation does not blindly trust its own first findings. Before deciding, Pilot
**independently re-queries** the Open-Meteo forecast and the business cost/sales numbers at decision
time. If conditions changed (e.g. rain probability rose), Pilot states it explicitly and adjusts the
recommendation — e.g. **GO → CONDITIONAL GO or NO-GO**. That is agentic collaboration: verification,
not blind handoff.
