// The IGNITE orchestrator: runs the five-agent pipeline with streaming events
// so the UI can render live progress, tool calls, evidence and handoffs.
// Researcher -> Designer -> Maker -> Communicator -> Manager, unbroken.

import { AGENTS, getAgent, pipelineOrder } from "./agents.js";
import { chat } from "./llm.js";
import { callTool } from "./mcp.js";
import { queryRows } from "./db.js";

// The default brief runs the full organisation on the Mori Coffee demo client.
export const DEMO_BRIEF = {
  company: "Mori Coffee",
  category: "specialty coffee / pop-up",
  goal: "Find a commercially viable weekend pop-up opportunity in Dublin with a €3,000 budget",
  budget: "€3,000",
};

export const isMoriBrief = (brief) =>
  (brief?.company || "").toLowerCase().includes("mori");

function mergeBrief(brief = {}) {
  return { ...DEMO_BRIEF, ...brief };
}

// ---------------------------------------------------------------------------
// Main pipeline runner
// ---------------------------------------------------------------------------
// `onEvent` receives { type, ... } events:
//   { type:'pipeline:start' }
//   { type:'agent:start', agentId, role }
//   { type:'agent:context', agentId, text }
//   { type:'tool:start', agentId, name, args }
//   { type:'tool:end', agentId, name, ms, summary }
//   { type:'evidence', source, api, count, note, at }
//   { type:'agent:delta', agentId, text }
//   { type:'agent:end', agentId, output, handoff }
//   { type:'checkpoint:open', agentId, file, excerpt }
//   { type:'pipeline:end' }
// `checkpoint` (optional) is an async fn(info) => Promise<{action:'approve'|'revise', note}>
// called after every agent so a human can approve or request a revision before
// the pipeline proceeds — the human-in-the-loop proof.
export async function runPipeline({ onEvent, signal, brief = {}, checkpoint = null } = {}) {
  if (typeof AbortSignal !== "undefined" && signal?.aborted) return;
  const project = mergeBrief(brief);
  const emit = (e) => { try { onEvent?.(e); } catch {} };

  const demo = isMoriBrief(project);
  emit({ type: "pipeline:start" });

  const handoffs = {};
  let previousOutput = "";
  const MAX_REVISIONS = 2;

  for (const agentId of pipelineOrder) {
    if (signal?.aborted) return;
    const agent = getAgent(agentId);
    let revision = null;
    let revisions = 0;

    for (;;) {
      if (signal?.aborted) return;
      emit({ type: "agent:start", agentId, role: agent.role });

      // Researcher pulls live data BEFORE writing; the others read the handoff.
      // The Manager independently re-queries live data before deciding —
      // the organisation does not blindly trust the first agent's findings.
      let contextBlock = "";
      if (agentId === "researcher") {
        emit({ type: "agent:context", agentId, text: "Querying Mori Coffee's database + live weather & market signals…" });
        contextBlock = await runResearcherLiveTools(emit, project, demo);
      } else if (agentId === "manager") {
        emit({ type: "agent:context", agentId, text: "Independently re-querying the live forecast + business numbers to verify the Researcher's claims…" });
        contextBlock = await runManagerVerification(emit, project, demo);
      } else {
        const prevId = pipelineOrder[pipelineOrder.indexOf(agentId) - 1];
        const prev = getAgent(prevId);
        emit({ type: "agent:context", agentId, text: `Reading ${prev.file} — ${prev.name}'s ${prev.output}…` });
      }

      const messages = [];
      if (contextBlock) {
        messages.push({ role: "system", content: (agentId === "manager"
          ? "LIVE VERIFICATION — re-queried independently by YOU at decision time. Compare it against the Researcher's claims; do not trust them blindly. If conditions changed, say so explicitly and adjust your recommendation.\n\n"
          : "LIVE DATA ALREADY FETCHED (do not re-run tools):\n") + contextBlock });
      }
      messages.push({ role: "user", content: buildUserMessage(agentId, { previousOutput, brief: project, revision, demo }) });

      const output = cleanOutput(await chat({
        system: agent.system,
        messages,
        tools: [],
        onDelta: (t) => emit({ type: "agent:delta", agentId, text: t }),
        temperature: 0.6,
      }));

      handoffs[agentId] = output;
      previousOutput = output;
      emit({ type: "agent:end", agentId, output, handoff: buildHandoff(agent, output) });

      // Human checkpoint: approve to continue, or ask this agent to revise.
      if (checkpoint && revisions < MAX_REVISIONS) {
        emit({ type: "checkpoint:open", agentId, file: agent.file, excerpt: output.slice(0, 600) });
        let decision = { action: "approve" };
        try {
          decision = (await checkpoint({ agentId, role: agent.role, name: agent.name, file: agent.file, output })) || decision;
        } catch {}
        if (signal?.aborted) return;
        if (decision.action === "revise" && decision.note) {
          revision = decision.note;
          revisions++;
          emit({ type: "agent:context", agentId, text: `Revision requested by the user: ${decision.note}` });
          continue;
        }
      }
      break;
    }
  }

  emit({ type: "pipeline:end", handoffs });
  return handoffs;
}

// ---------------------------------------------------------------------------
// Researcher: fire live tool calls at the moment of use and stream results
// into context. Real APIs, real timestamps — never hardcoded numbers.
// ---------------------------------------------------------------------------
async function runResearcherLiveTools(emit, brief, demo) {
  const lines = [];
  const company = (brief.company || "the client").trim();
  const term = brief.category || "coffee pop-up";

  // 1. Business database (demo client only — Mori Coffee's real data).
  if (demo) {
    try {
      emit({ type: "tool:start", agentId: "researcher", name: "get_business_profile", args: {} });
      const r = await callTool("get_business_profile", {});
      emit({ type: "tool:end", agentId: "researcher", name: "get_business_profile", ms: r.ms, summary: `${r.result.profile.business_name} — budget €${r.result.profile.budget}, ${r.result.profile.staff_available} staff` });
      emit({ type: "evidence", source: "Mori Coffee business database", api: "business-data · SQLite (ignite.db)", count: 1, note: "business profile", at: Date.now() });
      const p = r.result.profile;
      lines.push("## BUSINESS PROFILE (business-data MCP, queried now)");
      lines.push(`- ${p.business_name} · ${p.category} · ${p.tagline}`);
      lines.push(`- Budget €${p.budget} ${p.currency} · ${p.staff_available} staff · capacity ${p.max_capacity} · avg order €${p.avg_order_value}`);
      lines.push(`- Target: ${p.target_customer} · Hours ${p.opening_hours}`);
    } catch (e) { lines.push(`## BUSINESS PROFILE\n- failed: ${e.message}`); }

    try {
      emit({ type: "tool:start", agentId: "researcher", name: "get_products", args: {} });
      const r = await callTool("get_products", {});
      emit({ type: "tool:end", agentId: "researcher", name: "get_products", ms: r.ms, summary: `${r.result.products.length} menu items from the database` });
      lines.push("## MENU (business-data MCP)");
      for (const p of r.result.products) lines.push(`- ${p.name}: €${p.price} (cost €${p.cost}, margin €${p.margin})`);
    } catch (e) { lines.push(`## MENU\n- failed: ${e.message}`); }

    let locs = [];
    try {
      emit({ type: "tool:start", agentId: "researcher", name: "get_locations", args: {} });
      const r = await callTool("get_locations", {});
      emit({ type: "tool:end", agentId: "researcher", name: "get_locations", ms: r.ms, summary: `${r.result.locations.length} candidate locations` });
      locs = r.result.locations;
      lines.push("## CANDIDATE LOCATIONS (business-data MCP)");
      for (const l of locs) lines.push(`- ${l.name} (${l.district}) @ ${l.latitude},${l.longitude} — ${l.footfall_estimate}. ${l.weekend_notes}`);
    } catch (e) { lines.push(`## CANDIDATE LOCATIONS\n- failed: ${e.message}`); }

    try {
      emit({ type: "tool:start", agentId: "researcher", name: "get_historical_sales", args: { days: 30 } });
      const r = await callTool("get_historical_sales", { days: 30 });
      emit({ type: "tool:end", agentId: "researcher", name: "get_historical_sales", ms: r.ms, summary: `${r.result.sales.length} recent sales rows` });
      emit({ type: "evidence", source: "Mori Coffee historical sales", api: "business-data · SQLite (ignite.db)", count: r.result.sales.length, note: "30 days of real sales rows", at: Date.now() });
      lines.push("## HISTORICAL SALES (30 days, business-data MCP)");
      for (const s of r.result.sales.slice(0, 12)) lines.push(`- ${s.date} ${s.product} ×${s.units} = €${s.revenue} @ ${s.location} (${s.weather})`);
    } catch (e) { lines.push(`## HISTORICAL SALES\n- failed: ${e.message}`); }

    // 2. Live weather for each candidate location (Open-Meteo, keyless).
    const weatherRows = [];
    for (const loc of locs.slice(0, 3)) {
      try {
        emit({ type: "tool:start", agentId: "researcher", name: "get_weather_forecast", args: { latitude: loc.latitude, longitude: loc.longitude, name: loc.name, days: 3 } });
        const r = await callTool("get_weather_forecast", { latitude: loc.latitude, longitude: loc.longitude, name: loc.name, days: 3 });
        emit({ type: "tool:end", agentId: "researcher", name: "get_weather_forecast", ms: r.ms, summary: `${r.result.location}: ${r.result.current.temp_c}°C now, ${r.result.daily.length}-day forecast` });
        weatherRows.push(r.result);
        lines.push(`## LIVE WEATHER (Open-Meteo) — ${r.result.location} (${new Date(r.result.fetched_at).toLocaleTimeString()})`);
        lines.push(`- Now: ${r.result.current.temp_c}°C, precip ${r.result.current.precipitation_mm}mm, wind ${r.result.current.wind_kmh} km/h`);
        for (const d of r.result.daily) {
          lines.push(`- ${d.date}: ${d.min_c}–${d.max_c}°C, rain ${d.rain_probability_pct}%, ${d.rain_mm}mm, wind ${d.wind_kmh} km/h`);
        }
      } catch (e) { lines.push(`## LIVE WEATHER\n- ${loc.name} failed: ${e.message}`); }
    }
    if (weatherRows.length) {
      emit({ type: "evidence", source: "Open-Meteo live forecast", api: "Open-Meteo API", count: weatherRows.length, note: "locations × 3-day forecast", at: Date.now() });
    }
  } else {
    // General (non-Mori) brief: live weather for Dublin city centre only.
    try {
      emit({ type: "tool:start", agentId: "researcher", name: "get_weather_forecast", args: { latitude: 53.3498, longitude: -6.2603, name: "Dublin city centre", days: 3 } });
      const r = await callTool("get_weather_forecast", { latitude: 53.3498, longitude: -6.2603, name: "Dublin city centre", days: 3 });
      emit({ type: "tool:end", agentId: "researcher", name: "get_weather_forecast", ms: r.ms, summary: `Dublin: ${r.result.current.temp_c}°C now, ${r.result.daily.length}-day forecast` });
      emit({ type: "evidence", source: "Open-Meteo live forecast", api: "Open-Meteo API", count: r.result.daily.length, note: "Dublin 3-day forecast", at: Date.now() });
      lines.push(`## LIVE WEATHER (Open-Meteo) — Dublin (${new Date(r.result.fetched_at).toLocaleTimeString()})`);
      lines.push(`- Now: ${r.result.current.temp_c}°C, precip ${r.result.current.precipitation_mm}mm, wind ${r.result.current.wind_kmh} km/h`);
      for (const d of r.result.daily) lines.push(`- ${d.date}: ${d.min_c}–${d.max_c}°C, rain ${d.rain_probability_pct}%, wind ${d.wind_kmh} km/h`);
    } catch (e) { lines.push(`## LIVE WEATHER\n- failed: ${e.message}`); }
  }

  // 3. Live market signals (Reddit + Wikipedia) — always.
  try {
    const q = `${term} Dublin`;
    emit({ type: "tool:start", agentId: "researcher", name: "search_reddit", args: { query: q } });
    const r = await callTool("search_reddit", { query: q });
    emit({ type: "tool:end", agentId: "researcher", name: "search_reddit", ms: r.ms, summary: `${r.result.hits.length} live Reddit discussions` });
    emit({ type: "evidence", source: "Reddit", api: "Reddit public JSON", count: r.result.hits.length, note: "live Dublin market discussions", at: Date.now() });
    lines.push("## LIVE REDDIT SIGNAL");
    for (const p of r.result.hits) lines.push(`- [${p.score} pts, ${p.numComments} comments] r/${p.subreddit} — ${p.title}`);
  } catch (e) { lines.push(`## LIVE REDDIT SIGNAL\n- failed: ${e.message}`); }

  try {
    emit({ type: "tool:start", agentId: "researcher", name: "search_wikipedia", args: { query: term } });
    const r = await callTool("search_wikipedia", { query: term });
    emit({ type: "tool:end", agentId: "researcher", name: "search_wikipedia", ms: r.ms, summary: `${r.result.results.length} Wikipedia articles` });
    emit({ type: "evidence", source: "Wikipedia", api: "Wikipedia API", count: r.result.results.length, note: "industry reference", at: Date.now() });
    lines.push("## LIVE MARKET CONTEXT (Wikipedia)");
    for (const w of r.result.results.slice(0, 3)) lines.push(`- ${w.title}: ${w.snippet.slice(0, 140)}`);
  } catch (e) { lines.push(`## LIVE MARKET CONTEXT\n- failed: ${e.message}`); }

  const context = `## CONTEXT\nClient: ${company} — ${term}. Goal: ${brief.goal}.`;
  return [context, ...lines].join("\n");
}

// ---------------------------------------------------------------------------
// Manager: independently re-query live data at decision time so it can verify
// (or challenge) the Researcher's claims before issuing the GO/NO-GO.
// ---------------------------------------------------------------------------
async function runManagerVerification(emit, brief, demo) {
  const lines = [];
  lines.push("## LIVE VERIFICATION (re-queried by the Manager now, not copied from the Researcher)");

  if (demo) {
    // 1. Re-fetch the live weather forecast for the candidate locations.
    try {
      const { rows: locs } = await queryRows("SELECT name, latitude, longitude FROM locations ORDER BY id LIMIT 3", 3);
      let ok = 0;
      for (const loc of locs) {
        try {
          emit({ type: "tool:start", agentId: "manager", name: "get_weather_forecast", args: { latitude: loc.latitude, longitude: loc.longitude, name: loc.name, days: 3 } });
          const r = await callTool("get_weather_forecast", { latitude: loc.latitude, longitude: loc.longitude, name: loc.name, days: 3 });
          emit({ type: "tool:end", agentId: "manager", name: "get_weather_forecast", ms: r.ms, summary: `verified ${r.result.location}: ${r.result.current.temp_c}°C now` });
          ok++;
          lines.push(`### VERIFIED WEATHER — ${r.result.location} (${new Date(r.result.fetched_at).toLocaleTimeString()})`);
          lines.push(`- Now: ${r.result.current.temp_c}°C, precip ${r.result.current.precipitation_mm}mm, wind ${r.result.current.wind_kmh} km/h`);
          for (const d of r.result.daily) lines.push(`- ${d.date}: ${d.min_c}–${d.max_c}°C, rain ${d.rain_probability_pct}%, ${d.rain_mm}mm`);
        } catch (e) { lines.push(`- ${loc.name} verification failed: ${e.message}`); }
      }
      if (ok) emit({ type: "evidence", agentId: "manager", source: "Manager live re-verification", api: "Open-Meteo API (independent re-query)", count: ok, note: "forecast re-fetched at decision time", at: Date.now() });
    } catch (e) { lines.push(`## VERIFIED WEATHER\n- failed: ${e.message}`); }

    // 2. Re-fetch the cost structure.
    try {
      emit({ type: "tool:start", agentId: "manager", name: "get_operations", args: {} });
      const r = await callTool("get_operations", {});
      const o = r.result.operations;
      emit({ type: "tool:end", agentId: "manager", name: "get_operations", ms: r.ms, summary: `cost structure verified (€${(o.permits_cost + o.insurance_cost + o.wifi_tether_cost + o.generator_cost + o.delivery_cost + o.marketing_budget + o.misc_cost).toFixed(0)} total)` });
      lines.push("### VERIFIED COST STRUCTURE (operations table)");
      lines.push(`- Permits €${o.permits_cost} · Insurance €${o.insurance_cost} · Generator €${o.generator_cost} · Delivery €${o.delivery_cost} · Marketing €${o.marketing_budget} · Misc €${o.misc_cost}`);
    } catch (e) { lines.push(`## COST STRUCTURE\n- failed: ${e.message}`); }

    // 3. Re-fetch recent sales for the revenue cross-check.
    try {
      emit({ type: "tool:start", agentId: "manager", name: "get_historical_sales", args: { days: 14 } });
      const r = await callTool("get_historical_sales", { days: 14 });
      emit({ type: "tool:end", agentId: "manager", name: "get_historical_sales", ms: r.ms, summary: `${r.result.sales.length} sales rows re-queried for the revenue cross-check` });
      emit({ type: "evidence", agentId: "manager", source: "Manager revenue cross-check", api: "business-data · SQLite (ignite.db)", count: r.result.sales.length, note: "14 days re-queried at decision time", at: Date.now() });
      lines.push("### VERIFIED RECENT SALES (14 days)");
      for (const s of r.result.sales.slice(0, 8)) lines.push(`- ${s.date} ${s.product} ×${s.units} = €${s.revenue} @ ${s.location} (${s.weather})`);
    } catch (e) { lines.push(`## RECENT SALES\n- failed: ${e.message}`); }
  } else {
    // Non-Mori brief: verify the Dublin forecast independently.
    try {
      emit({ type: "tool:start", agentId: "manager", name: "get_weather_forecast", args: { latitude: 53.3498, longitude: -6.2603, name: "Dublin city centre", days: 3 } });
      const r = await callTool("get_weather_forecast", { latitude: 53.3498, longitude: -6.2603, name: "Dublin city centre", days: 3 });
      emit({ type: "tool:end", agentId: "manager", name: "get_weather_forecast", ms: r.ms, summary: `verified Dublin: ${r.result.current.temp_c}°C now` });
      emit({ type: "evidence", agentId: "manager", source: "Manager live re-verification", api: "Open-Meteo API (independent re-query)", count: r.result.daily.length, note: "forecast re-fetched at decision time", at: Date.now() });
      lines.push(`### VERIFIED WEATHER — Dublin (${new Date(r.result.fetched_at).toLocaleTimeString()})`);
      lines.push(`- Now: ${r.result.current.temp_c}°C, precip ${r.result.current.precipitation_mm}mm`);
      for (const d of r.result.daily) lines.push(`- ${d.date}: ${d.min_c}–${d.max_c}°C, rain ${d.rain_probability_pct}%`);
    } catch (e) { lines.push(`## VERIFIED WEATHER\n- failed: ${e.message}`); }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Message builders
// ---------------------------------------------------------------------------
function buildUserMessage(agentId, { previousOutput, brief, revision, demo }) {
  const clientLine = demo
    ? `- Client: Mori Coffee — a specialty coffee brand (single-origin, small-batch) launching a weekend pop-up in Dublin with a €${brief.budget} budget.\n- Goal: ${brief.goal}.`
    : `- Client: ${brief.company}, a ${brief.category} business (physical/offline) in Dublin.\n- Goal: ${brief.goal}.`;
  const head = `CONTEXT:\n${clientLine}\n- IGNITE is an autonomous venture launch studio pitching its capabilities; the pipeline produces real research, design, build and launch artifacts.\n\n`;

  if (agentId === "researcher") {
    return head + `Your job: analyse the LIVE data above (already fetched — do not re-run tools) and produce the Opportunity Brief.\n\nOUTPUT FILE: ${getAgent(agentId).file}${revisionBlock(revision)}`;
  }

  const prev = getAgent(pipelineOrder[pipelineOrder.indexOf(agentId) - 1]);
  return (
    head +
    `### Handoff from ${prev.name} (${prev.role})\nINPUT FILE: ${prev.file}\n${previousOutput}\n\n` +
    `Read the handoff above in full — it is ${prev.name}'s actual output, passed to you directly. Produce your deliverable now.\n\nOUTPUT FILE: ${getAgent(agentId).file}${revisionBlock(revision)}`
  );
}

function revisionBlock(revision) {
  return revision
    ? `\n\n### REVISION REQUESTED BY THE USER\n${revision}\nRevise your deliverable to address this feedback. Keep the same overall structure — improve the content.`
    : "";
}

function cleanOutput(text) {
  const t = (text || "").trim();
  const m = t.match(/^```(?:markdown|md)\n([\s\S]*?)\n```$/);
  return m ? m[1].trim() : t;
}

function buildHandoff(agent, output) {
  return {
    from: agent.role,
    name: agent.name,
    file: agent.file,
    artifact: agent.output,
    excerpt: output.slice(0, 400),
  };
}
