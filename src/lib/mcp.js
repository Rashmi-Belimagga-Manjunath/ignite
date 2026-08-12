// IGNITE MCP layer — a Model Context Protocol-style tool registry.
//
// Every tool exposes an MCP-style contract: name, description, inputSchema
// (JSON Schema), and a run() that performs a LIVE fetch at the moment of use.
// Two servers are exposed:
//
//   1. business-data (custom MCP) — typed access to Mori Coffee's real SQLite
//      database (ignite.db), the synthetic-but-real data source required by the
//      brief. Nothing is hardcoded into prompts or code; agents read it at query time.
//   2. live-signals (public APIs)  — Open-Meteo (weather), Reddit, Wikipedia,
//      GitHub (read-only), Hacker News (Algolia). All keyless and CORS-enabled.

import { queryRows, queryDb } from "./db.js";

// ---------------------------------------------------------------------------
// Live fetch helper
// ---------------------------------------------------------------------------

async function fetchJson(url, timeoutMs = 12000, headers = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.split("?")[0]}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
// Live-signal fetchers
// ---------------------------------------------------------------------------

// Open-Meteo — keyless live weather forecast. No API key, CORS-enabled.
// Used for the exact pop-up weekend so the Researcher can reason about
// outdoor footfall conditions (rain probability, temperature, wind).
async function openMeteoForecast(lat, lon, name = "", days = 3) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,weather_code` +
    `&timezone=Europe%2FDublin&forecast_days=${Math.min(Math.max(days, 1), 7)}` +
    `&current=temperature_2m,precipitation,weather_code,wind_speed_10m`;
  const data = await fetchJson(url);
  const daily = (data?.daily || {});
  const rows = (daily.time || []).map((d, i) => ({
    date: d,
    max_c: daily.temperature_2m_max?.[i],
    min_c: daily.temperature_2m_min?.[i],
    rain_probability_pct: daily.precipitation_probability_max?.[i],
    rain_mm: daily.precipitation_sum?.[i],
    wind_kmh: daily.wind_speed_10m_max?.[i],
    weather_code: daily.weather_code?.[i],
  }));
  const cur = data?.current || {};
  return {
    location: name || "queried coordinates",
    latitude: lat,
    longitude: lon,
    fetched_at: new Date().toISOString(),
    current: {
      temp_c: cur.temperature_2m,
      precipitation_mm: cur.precipitation,
      weather_code: cur.weather_code,
      wind_kmh: cur.wind_speed_10m,
    },
    daily: rows,
  };
}

async function redditSearch(query, limit = 5) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=top`;
  const data = await fetchJson(url, 12000, {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  });
  const children = data?.data?.children || [];
  return children.map((c) => {
    const d = c.data || {};
    return {
      title: d.title || "",
      subreddit: d.subreddit || "",
      score: d.score || 0,
      numComments: d.num_comments || 0,
      url: d.permalink ? `https://www.reddit.com${d.permalink}` : "",
      date: d.created_utc ? new Date(d.created_utc * 1000).toISOString().slice(0, 10) : "",
    };
  });
}

async function wikipediaSearch(query, limit = 4) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json&origin=*`;
  const data = await fetchJson(url);
  return (data?.query?.search || []).map((r) => ({
    title: r.title,
    snippet: r.snippet.replace(/<[^>]+>/g, ""),
  }));
}

async function githubSearch(query) {
  const [issuesRes, reposRes] = await Promise.allSettled([
    fetchJson(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=reactions&order=desc&per_page=5`),
    fetchJson(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=3`),
  ]);
  const issues = ((issuesRes.status === "fulfilled" && issuesRes.value?.items) || []).map((i) => ({
    title: i.title,
    repo: i.repository_url ? i.repository_url.split("/").slice(-2).join("/") : "",
    state: i.state,
    comments: i.comments || 0,
    url: i.html_url || "",
    date: (i.created_at || "").slice(0, 10),
  }));
  const repos = ((reposRes.status === "fulfilled" && reposRes.value?.items) || []).map((r) => ({
    fullName: r.full_name,
    stars: r.stargazers_count || 0,
    openIssues: r.open_issues_count || 0,
    language: r.language || "",
    url: r.html_url || "",
  }));
  return { issues, repos };
}

async function hnSearch(query, hits = 6) {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${hits}`;
  const data = await fetchJson(url);
  return (data.hits || []).map((h) => ({
    title: h.title,
    points: h.points || 0,
    numComments: h.num_comments || 0,
    url: h.url || "",
    date: (h.created_at || "").slice(0, 10),
  }));
}

// ---------------------------------------------------------------------------
// Business-Data MCP (custom) — typed access to the Mori Coffee database
// ---------------------------------------------------------------------------

// Convenience: return the single business_profile row as an object.
async function profileRow() {
  const { rows } = await queryRows("SELECT * FROM business_profile LIMIT 1", 1);
  return rows[0] || {};
}

const TOOLS = {
  // ---- business-data MCP ----
  get_business_profile: {
    server: "business-data",
    description:
      "Get Mori Coffee's business profile from the IGNITE business database: name, category, tagline, budget, currency, " +
      "target customer, staff available, max capacity, average order value, opening hours, home base. Read at query time.",
    inputSchema: {},
    run: async () => ({ profile: await profileRow() }),
  },
  get_budget: {
    server: "business-data",
    description:
      "Get Mori Coffee's available launch budget and core operating constraints (staff, capacity, avg order value) " +
      "from the IGNITE business database. Use to sanity-check whether an opportunity is financially viable.",
    inputSchema: {},
    run: async () => {
      const p = await profileRow();
      return {
        budget_eur: p.budget,
        currency: p.currency,
        staff_available: p.staff_available,
        max_capacity: p.max_capacity,
        avg_order_value_eur: p.avg_order_value,
        opening_hours: p.opening_hours,
      };
    },
  },
  get_products: {
    server: "business-data",
    description:
      "Get Mori Coffee's menu from the IGNITE business database: product name, description, cost, price, margin and category. " +
      "Use for pricing the pop-up offer and for the Maker's menu.",
    inputSchema: {},
    run: async () => {
      const { rows } = await queryRows("SELECT name, description, cost, price, margin, category, hero FROM products ORDER BY price DESC", 20);
      return { products: rows };
    },
  },
  get_inventory: {
    server: "business-data",
    description:
      "Get Mori Coffee's current stock from the IGNITE business database: item, quantity, unit and notes. " +
      "Use to verify the pop-up can actually be stocked (beans, cups, milk alternatives, matcha, tonics).",
    inputSchema: {},
    run: async () => {
      const { rows } = await queryRows("SELECT item, category, quantity, unit, notes FROM inventory ORDER BY category, item", 20);
      return { inventory: rows };
    },
  },
  get_locations: {
    server: "business-data",
    description:
      "Get candidate pop-up locations for Dublin from the IGNITE business database: name, district, latitude, longitude, " +
      "footfall estimate and weekend notes. Pass the latitude/longitude to get_weather_forecast for each candidate.",
    inputSchema: {},
    run: async () => {
      const { rows } = await queryRows("SELECT name, district, latitude, longitude, footfall_estimate, weekend_notes FROM locations ORDER BY id", 10);
      return { locations: rows };
    },
  },
  get_operations: {
    server: "business-data",
    description:
      "Get Mori Coffee's cost structure from the IGNITE business database: permits, insurance, wifi tether, generator, " +
      "delivery, marketing budget and misc costs for a one-day Dublin pop-up. Use for the Manager's cost/ROI model.",
    inputSchema: {},
    run: async () => {
      const { rows } = await queryRows("SELECT * FROM operations LIMIT 1", 1);
      return { operations: rows[0] || {} };
    },
  },
  get_brand: {
    server: "business-data",
    description:
      "Get Mori Coffee's brand identity from the IGNITE business database: tone, values, audience, visual identity and " +
      "campaign concept. Use for the Designer's direction and the Communicator's campaign.",
    inputSchema: {},
    run: async () => {
      const { rows } = await queryRows("SELECT tone, brand_values, audience, visual_identity, campaign_concept FROM brand LIMIT 1", 1);
      return { brand: rows[0] || {} };
    },
  },
  get_historical_sales: {
    server: "business-data",
    description:
      "Get Mori Coffee's historical daily sales from the IGNITE business database (90 days): date, product, units, revenue, " +
      "location, weather and notes. Use to build a realistic demand forecast for the pop-up (best-selling products, " +
      "weekend vs weekday multipliers, weather sensitivity).",
    inputSchema: { days: { type: "number", description: "Number of recent days to return (default 30, max 90)" } },
    run: async (args) => {
      const days = Math.min(Math.max(Number(args.days) || 30, 1), 90);
      const { rows } = await queryRows(
        `SELECT date, product, units, revenue, location, weather, notes FROM historical_sales ORDER BY date DESC LIMIT ${days}`,
        days
      );
      return { sales: rows };
    },
  },
  query_business_db: {
    server: "business-data",
    description:
      "Run a read-only SQL SELECT against the IGNITE business database. Tables: business_profile, products, inventory, " +
      "operations, brand, locations, historical_sales. Returns columns + rows. LIMIT results to 40 rows. " +
      "Use for deeper analysis (e.g. aggregate revenue by product).",
    inputSchema: { sql: { type: "string", required: true } },
    run: async (args) => {
      const { columns, rows } = await queryRows(args.sql, 40);
      return { columns, rows };
    },
  },

  // ---- live-signals MCP ----
  get_weather_forecast: {
    server: "live-signals",
    description:
      "Get a LIVE weather forecast from Open-Meteo (keyless API) for a latitude/longitude over the next 1-7 days: " +
      "daily max/min temperature, rain probability, rain mm, wind and weather code. Use to assess whether outdoor " +
      "footfall conditions favour a pop-up on a specific day. Fetch for each candidate location.",
    inputSchema: {
      latitude: { type: "number", required: true, description: "Decimal latitude (e.g. 53.3482)" },
      longitude: { type: "number", required: true, description: "Decimal longitude (e.g. -6.2393)" },
      name: { type: "string", description: "Optional label for the location" },
      days: { type: "number", description: "Forecast days (1-7, default 3)" },
    },
    run: async (args) => openMeteoForecast(args.latitude, args.longitude, args.name, args.days),
  },
  search_reddit: {
    server: "live-signals",
    description:
      "Search Reddit (public JSON API) for live discussions — e.g. what Dubliners say about coffee, pop-ups, cold brew, " +
      "or the event crowd. Returns post titles, subreddit, score, comment counts. Live market sentiment at query time.",
    inputSchema: { query: { type: "string", required: true } },
    run: async (args) => ({ hits: await redditSearch(args.query) }),
  },
  search_wikipedia: {
    server: "live-signals",
    description:
      "Search Wikipedia for background/market context on a topic (e.g. specialty coffee, Dublin Docklands, cold brew). " +
      "Returns article titles and snippets. Use for reference context, not demand signals.",
    inputSchema: { query: { type: "string", required: true } },
    run: async (args) => ({ results: await wikipediaSearch(args.query) }),
  },
  search_github: {
    server: "live-signals",
    description:
      "Search the GitHub API (read-only) for live engineering issues and top repositories matching a topic. " +
      "Signals what the tech/startup community is building right now. Returns issues (title, repo) and repos (stars, language).",
    inputSchema: { query: { type: "string", required: true } },
    run: async (args) => ({ hits: await githubSearch(args.query) }),
  },
  search_hackernews: {
    server: "live-signals",
    description:
      "Search Hacker News (Algolia API) for live stories on a topic. Signals what the developer/startup world is discussing now.",
    inputSchema: { query: { type: "string", required: true } },
    run: async (args) => ({ hits: await hnSearch(args.query) }),
  },
};

// ---------------------------------------------------------------------------
// Registry API (MCP contract)
// ---------------------------------------------------------------------------

export function listTools() {
  return Object.entries(TOOLS).map(([name, t]) => ({
    name,
    server: t.server,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
}

// Which server each tool belongs to, for the Live Data page.
export const MCP_SERVERS = [
  {
    id: "business-data",
    label: "Business-Data MCP (custom)",
    description: "Typed, schema-validated access to Mori Coffee's real SQLite database (ignite.db) — business profile, products, inventory, locations, operations, brand, historical sales.",
    tools: Object.entries(TOOLS).filter(([, t]) => t.server === "business-data").map(([n]) => n),
  },
  {
    id: "live-signals",
    label: "Live-Signals MCP (public APIs)",
    description: "Keyless live data queried at the moment of use: Open-Meteo weather, Reddit, Wikipedia, GitHub (read-only), Hacker News (Algolia).",
    tools: Object.entries(TOOLS).filter(([, t]) => t.server === "live-signals").map(([n]) => n),
  },
];

export async function callTool(name, args) {
  const tool = TOOLS[name];
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  const t0 = Date.now();
  const result = await tool.run(args || {});
  return {
    name,
    server: tool.server,
    args,
    result,
    ms: Date.now() - t0,
    ts: new Date().toISOString(),
  };
}
