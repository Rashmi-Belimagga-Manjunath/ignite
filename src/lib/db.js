// sql.js loader + query helpers for the IGNITE business database.
// ignite.db is a real SQLite file shipped in /public, fetched at runtime,
// opened in-browser with the SQLite WASM engine, and queried with real SQL.

import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

let dbPromise = null;

// sql.js needs a file path for its WASM binary. In the browser, wasmUrl is the
// bundled asset URL. In Node (SSR smoke tests) it resolves to a path that
// misses the cwd prefix, so we fix it up here.
function locateWasm(file) {
  if (typeof window === "undefined" && typeof process !== "undefined") {
    return process.cwd() + "/node_modules/sql.js/dist/" + file;
  }
  return wasmUrl;
}

async function loadDbBytes() {
  if (typeof window === "undefined" && typeof process !== "undefined") {
    const { readFileSync } = await import("node:fs");
    return readFileSync(process.cwd() + "/public/ignite.db");
  }
  const res = await fetch(`${import.meta.env.BASE_URL}ignite.db`);
  if (!res.ok) throw new Error(`Failed to load ignite.db (${res.status})`);
  return await res.arrayBuffer();
}

export async function getDb() {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    const SQL = await initSqlJs({ locateFile: locateWasm });
    const bytes = await loadDbBytes();
    return new SQL.Database(new Uint8Array(bytes));
  })();
  return dbPromise;
}

// Run a read-only SELECT and return { columns, rows }.
export async function queryDb(sql) {
  const trimmed = (sql || "").trim().toUpperCase();
  if (!trimmed.startsWith("SELECT")) {
    throw new Error("Only SELECT queries are allowed");
  }
  if (trimmed.includes("DROP") || trimmed.includes("DELETE") || trimmed.includes("UPDATE") || trimmed.includes("INSERT")) {
    throw new Error("Only read-only queries are allowed");
  }
  const db = await getDb();
  const stmt = db.prepare(sql);
  try {
    const cols = stmt.getColumnNames();
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return { columns: cols, rows };
  } finally {
    stmt.free();
  }
}

export async function queryRows(sql, cap = 25) {
  const { columns, rows } = await queryDb(sql);
  return { columns, rows: rows.slice(0, cap) };
}

export async function getTableList() {
  const { rows } = await queryDb("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  return rows.map((r) => r.name);
}
