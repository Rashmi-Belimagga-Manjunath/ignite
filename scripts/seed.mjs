// IGNITE seed script — builds public/ignite.db (real SQLite) containing Mori Coffee's
// business profile, products, inventory, operations, brand and 90 days of historical
// sales. The DB file is fetched at runtime by the browser, opened in-memory with the
// sql.js WASM engine and queried with real SQL through the Business-Data MCP tools.
// Synthetic does not mean static: every number below is read at query time by the agents.

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "public", "ignite.db");
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
DROP TABLE IF EXISTS business_profile;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS operations;
DROP TABLE IF EXISTS brand;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS historical_sales;

CREATE TABLE business_profile (
  id INTEGER PRIMARY KEY,
  business_name TEXT,
  category TEXT,
  tagline TEXT,
  budget REAL,
  currency TEXT,
  target_customer TEXT,
  staff_available INTEGER,
  max_capacity INTEGER,
  avg_order_value REAL,
  opening_hours TEXT,
  home_base TEXT
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  description TEXT,
  cost REAL,
  price REAL,
  margin REAL,
  category TEXT,
  hero INTEGER
);

CREATE TABLE inventory (
  id INTEGER PRIMARY KEY,
  item TEXT,
  category TEXT,
  quantity REAL,
  unit TEXT,
  notes TEXT
);

CREATE TABLE operations (
  id INTEGER PRIMARY KEY,
  area TEXT,
  permits_cost REAL,
  insurance_cost REAL,
  wifi_tether_cost REAL,
  generator_cost REAL,
  delivery_cost REAL,
  marketing_budget REAL,
  misc_cost REAL
);

CREATE TABLE brand (
  id INTEGER PRIMARY KEY,
  tone TEXT,
  brand_values TEXT,
  audience TEXT,
  visual_identity TEXT,
  campaign_concept TEXT
);

CREATE TABLE locations (
  id INTEGER PRIMARY KEY,
  name TEXT,
  district TEXT,
  latitude REAL,
  longitude REAL,
  footfall_estimate TEXT,
  weekend_notes TEXT
);

CREATE TABLE historical_sales (
  id INTEGER PRIMARY KEY,
  date TEXT,
  product TEXT,
  units INTEGER,
  revenue REAL,
  location TEXT,
  weather TEXT,
  notes TEXT
);
`);

// ---------- Deterministic PRNG for reproducible seed ----------
let seed = 20260701;
function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}
function rint(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function pick(arr) { return arr[rint(0, arr.length - 1)]; }
function round(n, d = 2) { const m = Math.pow(10, d); return Math.round(n * m) / m; }

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

// ---------- Business profile ----------
db.prepare(`INSERT INTO business_profile
  (business_name, category, tagline, budget, currency, target_customer, staff_available, max_capacity, avg_order_value, opening_hours, home_base)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(
    "Mori Coffee",
    "specialty coffee / pop-up",
    "Single-origin specialty coffee, roasted in small batches and served from a pop-up cart.",
    3000,
    "EUR",
    "18–35 urban professionals, students and event-goers in Dublin",
    4,
    450,
    7.5,
    "10:00–22:00",
    "Dublin, Ireland"
  );

// ---------- Products ----------
const products = [
  ["Cold Brew Tonic", "Slow-steeped 18h cold brew with tonic and orange zest.", 1.10, 6.50, "specialty coffee", 1],
  ["Espresso Tonic", "Double espresso over tonic and ice — the signature pop-up drink.", 1.40, 7.50, "specialty coffee", 1],
  ["Matcha Latte", "Ceremonial-grade matcha, oat milk, light sweetness.", 1.20, 7.00, "specialty coffee", 1],
  ["Cortado", "Double ristretto with silky steamed milk.", 0.90, 3.50, "espresso", 0],
  ["Pour-Over", "Single-origin pour-over, brewed to order.", 1.30, 5.50, "specialty coffee", 0],
  ["Buttered Croissant", "Fresh from a local Dublin bakery.", 0.60, 3.50, "pastry", 0],
  ["Mori Blend (250g bag)", "House blend of the night's featured origin, to take home.", 4.00, 14.00, "retail", 0],
];
const insertProduct = db.prepare(`INSERT INTO products (name, description, cost, price, margin, category, hero) VALUES (?, ?, ?, ?, ?, ?, ?)`);
for (const [name, desc, cost, price, cat, hero] of products) {
  insertProduct.run(name, desc, cost, price, round(price - cost), cat, hero);
}

// ---------- Inventory ----------
const inventory = [
  ["Ethiopia Yirgacheffe beans", "coffee", 18, "kg", "covers ~1,100 espresso drinks"],
  ["Colombia Huila beans", "coffee", 14, "kg", "pour-over + retail bags"],
  ["Cold brew concentrate", "coffee", 40, "L", "pre-brewed 2 days before"],
  ["Oat milk", "dairy alt", 36, "L", "barista blend"],
  ["Tonic water", "syrup/soft", 48, "can", "signature drinks"],
  ["Matcha (ceremonial)", "ingredients", 3, "kg", "~450 servings"],
  ["Paper cups 12oz", "packaging", 900, "units", "eco compostable"],
  ["Paper cups 8oz", "packaging", 300, "units", "eco compostable"],
  ["Napkins + straws", "packaging", 800, "units", "compostable"],
  ["Propane canisters", "kit", 4, "units", "generator fuel for evening hours"],
];
const insertInv = db.prepare(`INSERT INTO inventory (item, category, quantity, unit, notes) VALUES (?, ?, ?, ?, ?)`);
for (const [item, cat, qty, unit, notes] of inventory) insertInv.run(item, cat, qty, unit, notes);

// ---------- Operations / cost structure ----------
db.prepare(`INSERT INTO operations (area, permits_cost, insurance_cost, wifi_tether_cost, generator_cost, delivery_cost, marketing_budget, misc_cost)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  .run("Dublin pop-up (1 day)", 120, 90, 30, 180, 60, 150, 40);

// ---------- Brand ----------
db.prepare(`INSERT INTO brand (tone, brand_values, audience, visual_identity, campaign_concept)
  VALUES (?, ?, ?, ?, ?)`)
  .run(
    "minimal / premium / urban",
    "single-origin craft, ethically sourced, small-batch, quietly confident",
    "18–35 urban professionals, students, event-goers; late-afternoon and evening crowd",
    "matte black cart, warm amber lighting, white sans-serif wordmark, one accent colour per evening",
    "One night. One roast. One city."
  );

// ---------- Candidate pop-up locations ----------
const locations = [
  ["The Docklands — Mayor Square", "Dublin Docklands", 53.3482, -6.2393, "Very high at weekends", "IFSC + tech events; strong Saturday evening footfall"],
  ["Smithfield Square", "Smithfield", 53.3490, -6.2780, "High on market weekends", "Sunday food markets; good footfall from 12:00"],
  ["Grand Canal Dock", "Grand Canal Dock", 53.3383, -6.2378, "High weekdays, rising weekends", "Silicon Docks; weekend park events nearby"],
  ["Temple Bar", "Temple Bar", 53.3459, -6.2636, "Very high, tourist heavy", "Highest footfall; less of a craft-coffee audience"],
  ["Stoneybatter", "Stoneybatter", 53.3423, -6.2881, "Medium, foodie locals", "Café culture neighbourhood; loyal local crowd"],
];
const insertLoc = db.prepare(`INSERT INTO locations (name, district, latitude, longitude, footfall_estimate, weekend_notes) VALUES (?, ?, ?, ?, ?, ?)`);
for (const [name, district, lat, lon, footfall, notes] of locations) insertLoc.run(name, district, lat, lon, footfall, notes);

// ---------- Historical sales (90 days) ----------
const saleProducts = products.map((p) => p[0]);
const salePrices = Object.fromEntries(products.map((p) => [p[0], p[3]]));
const locationsList = locations.map((l) => l[0]);
const weathers = ["sunny", "sunny", "cloudy", "cloudy", "cloudy", "rain", "rain", "windy"];
const insertSale = db.prepare(`INSERT INTO historical_sales (date, product, units, revenue, location, weather, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`);
const recent = (i) => (i > 60 ? 1 : i > 30 ? 0.85 : 1.1);
for (let i = 89; i >= 0; i--) {
  const dow = new Date(daysAgo(i)).getDay();
  const weekendBoost = dow === 5 || dow === 6 || dow === 0 ? 1.35 : 1;
  const weather = pick(weathers);
  const weatherBoost = weather === "sunny" ? 1.3 : weather === "rain" ? 0.6 : 1;
  const n = rint(2, 4);
  for (let k = 0; k < n; k++) {
    const product = pick(saleProducts);
    const units = Math.round(rint(4, 30) * recent(i) * weekendBoost * weatherBoost);
    const revenue = round(units * salePrices[product]);
    insertSale.run(
      daysAgo(i),
      product,
      units,
      revenue,
      pick(locationsList),
      weather,
      dow === 5 ? "Friday evening rush" : dow === 6 ? "Saturday pop-up day" : dow === 0 ? "Sunday market" : "weekday service"
    );
  }
}

const counts = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM products) AS products,
    (SELECT COUNT(*) FROM inventory) AS inventory,
    (SELECT COUNT(*) FROM locations) AS locations,
    (SELECT COUNT(*) FROM historical_sales) AS sales_rows,
    (SELECT ROUND(SUM(revenue),0) FROM historical_sales) AS total_revenue
`).get();

console.log(`Seeded ignite.db: ${counts.products} products, ${counts.inventory} inventory items, ${counts.locations} locations, ${counts.sales_rows} historical sales rows (€${counts.total_revenue} total revenue)`);
db.close();
