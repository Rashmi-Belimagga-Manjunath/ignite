// Shared helpers for the Evidence Panel: maps DB + live-API results into
// evidence rows (source, API/MCP name, count, note, timestamp) and computes
// a confidence score from how many sources actually returned data.

export function dbEvidence(summary, at = Date.now()) {
  return {
    source: "Mori Coffee business database",
    api: "business-data · SQLite (ignite.db)",
    count: summary?.sales_rows ?? 0,
    note: "rows queried live",
    at,
  };
}

export function computeConfidence(evidenceList) {
  if (!evidenceList?.length) return 0;
  const live = evidenceList.filter((e) => e.count > 0 || e.note);
  const fetched = evidenceList.filter((e) => e.count > 0);
  return Math.min(96, Math.round(55 + (fetched.length / Math.max(evidenceList.length, 1)) * 40));
}
