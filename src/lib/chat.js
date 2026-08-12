// IGNITE COMMAND — the conversational front door and narrator of the venture
// studio. One chat in front of five hidden agents. It runs a guided intake,
// launches the organisation pipeline, and answers follow-ups using each agent's
// real work plus the live business database and API tools.

import { chat } from "./llm.js";
import { listTools, callTool } from "./mcp.js";

const COMMAND_SYSTEM = `You are IGNITE COMMAND — the conversational front door and orchestrator of IGNITE, an autonomous venture launch studio.

Behind you, five specialist agents work as ONE unbroken pipeline:
1. SCOUT · RESEARCHER — opportunity intelligence: queries Mori Coffee's real business database, LIVE Dublin weather (Open-Meteo) and live market signals (Reddit, Wikipedia) to find the opportunity.
2. MUSE · DESIGNER — turns the research into a pop-up concept, experience, menu and brand direction.
3. FORGE · MAKER — builds the actual working pop-up website (a real, clickable HTML prototype).
4. VOICE · COMMUNICATOR — creates the launch campaign: Instagram, email, ads, launch strategy.
5. PILOT · MANAGER — reviews everything and decides GO / NO-GO / REVISE with revenue, cost, confidence and risks.

BEHAVIOUR:
- You are the narrator. You speak for the whole team — never for a single agent.
- The demo client is Mori Coffee (€3,000, weekend pop-up in Dublin). Use the business-data tools for its real numbers and the live tools (get_weather_forecast, search_reddit, search_wikipedia) for what is happening right now. Never invent figures.
- If the user describes THEIR OWN business, ANSWER DIRECTLY and concretely with the live tools (weather, Reddit, Wikipedia) — do NOT apply Mori Coffee's database to them.
- If the user wants the full end-to-end organisation, say you're ready to run it and offer the demo: "I have a coffee brand, €3,000, want to launch in Dublin this weekend."
- Keep answers under ~200 words unless the user asks for detail. Use markdown bullets when helpful.
- NEVER claim data you did not fetch. If a tool is unavailable, say so.`;

const FOLLOW_UP_SYSTEM = `You are IGNITE COMMAND, the orchestrator of an autonomous venture launch studio. A full pipeline run just finished for the user's project. You now explain, defend and build on the organisation's actual work.

When the user asks "why did you recommend X?", "how did the team decide this?", or any follow-up, answer by referencing the agents' real deliverables below — never invent new reasoning or outputs.

BEHAVIOUR:
- Cite which agent(s) produced the relevant evidence (Scout found X, Muse designed Y, Forge built Z, Voice positioned it as W, Pilot approved with a GO/NO-GO).
- You may still use the live tools (get_weather_forecast, search_reddit, search_wikipedia, business-data) to fetch fresh numbers that support the reasoning.
- Keep answers under ~220 words unless the user asks for detail.`;

const CHAT_TOOLS = listTools();

const toolRunner = async (name, args) => {
  const r = await callTool(name, args);
  return { name: r.name, server: r.server, result: r.result };
};

// Guided intake: one question per step.
export const INTAKE_STEPS = [
  {
    key: "company",
    question: "What's the business?",
    hint: "e.g. Mori Coffee — a specialty coffee brand in Dublin",
    chips: ["Mori Coffee"],
  },
  {
    key: "category",
    question: "What kind of business is it?",
    hint: "e.g. specialty coffee, street food, fashion pop-up, plant shop…",
    chips: ["Specialty coffee", "Street food", "Fashion pop-up", "Plant shop", "Art / prints"],
  },
  {
    key: "budget",
    question: "How much budget do you have?",
    hint: "e.g. €3,000",
    chips: ["€1,000", "€3,000", "€5,000", "€10,000"],
  },
  {
    key: "goal",
    question: "What do you want the launch to achieve?",
    hint: "e.g. a one-day weekend pop-up in Dublin",
    chips: ["Weekend pop-up in Dublin", "Event-adjacent activation", "Neighbourhood presence"],
  },
];

export const DEMO_TRIGGER = "🎯 Use the Mori Coffee demo";

export async function runGeneral({ history, onDelta, mode = "command" }) {
  return chat({
    system: COMMAND_SYSTEM,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
    tools: CHAT_TOOLS,
    toolRunner,
    onDelta,
    temperature: 0.5,
    maxRounds: 6,
  });
}

export async function runFollowUp({ history, brief, results, onDelta }) {
  const context = buildAgentContext(brief, results);
  return chat({
    system: FOLLOW_UP_SYSTEM + "\n\n" + context,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
    tools: CHAT_TOOLS,
    toolRunner,
    onDelta,
    temperature: 0.5,
    maxRounds: 6,
  });
}

function buildAgentContext(brief, results) {
  const parts = [`=== PROJECT BRIEF ===`, `Client: ${brief?.company || "—"}`, `Category: ${brief?.category || "—"}`, `Goal: ${brief?.goal || "—"}`];
  const labels = {
    researcher: "01_Opportunity_Brief.md — Scout (Researcher)",
    designer: "02_Design_Specification.md — Muse (Designer)",
    maker: "03_Build_Package.md — Forge (Maker)",
    communicator: "04_Launch_Kit.md — Voice (Communicator)",
    manager: "05_Executive_Briefing.md — Pilot (Manager)",
  };
  for (const id of Object.keys(labels)) {
    const out = results?.[id];
    if (!out) continue;
    parts.push(`\n=== DELIVERABLE: ${labels[id]} ===`);
    parts.push(out.length > 2200 ? out.slice(0, 2200) + "\n…(truncated)" : out);
  }
  return parts.join("\n");
}
