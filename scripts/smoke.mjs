// Smoke test: run the IGNITE pipeline in Node (SSR) with an auto-approving
// checkpoint. Exercises: sql.js DB, business-data MCP, Open-Meteo, Reddit,
// Wikipedia, the OpenAI client, handoffs and the checkpoint loop.
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

process.env.VITE_OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || "";

const { runPipeline } = await server.ssrLoadModule("/src/lib/orchestrator.js");
const { queryDb, getTableList } = await server.ssrLoadModule("/src/lib/db.js");

// 1. Database layer (real query on ignite.db via sql.js).
const tables = await getTableList();
const { rows: counts } = await queryDb(
  "SELECT (SELECT COUNT(*) FROM products) AS products, (SELECT COUNT(*) FROM locations) AS locations, (SELECT COUNT(*) FROM historical_sales) AS sales FROM (SELECT 1)"
);
console.log("DB tables:", tables.join(", "));
console.log("DB counts:", JSON.stringify(counts[0]));

// 2. Full pipeline with live tools + auto-approve checkpoints.
const events = [];
const brief = { company: "Mori Coffee", category: "specialty coffee / pop-up", goal: "Find a viable Dublin weekend pop-up with €3,000", budget: "€3,000" };

const onEvent = (e) => {
  const type = e.type;
  if (type === "agent:delta") return;
  events.push(type + (e.name ? `:${e.name}` : "") + (e.file ? ` [${e.file}]` : "") + (e.agentId ? ` (${e.agentId})` : ""));
};
const checkpoint = async (info) => ({ action: "approve" });

console.log("Running pipeline (this calls real APIs + OpenAI)…");
const handoffs = await runPipeline({ onEvent, brief, checkpoint });
await server.close();

console.log("\n=== EVENT STREAM (non-delta, non-tool) ===");
for (const e of events) console.log(" ", e);

console.log("\n=== DELIVERABLES ===");
for (const [k, v] of Object.entries(handoffs || {})) {
  console.log(`  ${k}: ${(v || "").length} chars → ${v ? v.split("\n")[0].slice(0, 80) : "MISSING"}`);
}

// 3. Does the Maker output contain a buildable HTML prototype?
const maker = handoffs?.maker || "";
const hasHtml = /```html\n/i.test(maker);
console.log("\nMaker contains a fenced HTML prototype:", hasHtml);

// 4. Manager decision.
const mgr = handoffs?.manager || "";
const hasGo = /\bGO\b/i.test(mgr);
console.log("Manager briefing mentions GO:", hasGo);

// 5. Manager independently re-queried live data (verification).
const mgrTools = events.filter((e) => e.startsWith("tool:") && e.includes("(manager)"));
const mgrEvidence = events.filter((e) => e.startsWith("evidence") && e.includes("(manager)"));
console.log("Manager tool calls:", mgrTools.length);
console.log("Manager evidence events:", mgrEvidence.length);

console.log("\nSMOKE TEST " + (handoffs && handoffs.manager && hasHtml && mgrTools.length >= 3 ? "PASSED" : "FAILED"));
process.exit(handoffs && handoffs.manager && hasHtml && mgrTools.length >= 3 ? 0 : 1);
