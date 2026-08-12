// Minimal OpenAI streaming client (no SDK needed). Supports function calling
// so the IGNITE agents can invoke live tools mid-conversation.

import { getApiKey, getModel } from "./config.js";

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

export function hasKey() {
  return Boolean(getApiKey());
}

export class NoKeyError extends Error {
  constructor() {
    super("Missing OpenAI API key");
    this.code = "NO_KEY";
  }
}

function ensureKey() {
  const key = getApiKey();
  if (!key) throw new NoKeyError();
  return key;
}

// Normalise our compact `{ propName: { type, required } }` schema into a valid
// JSON Schema for the OpenAI API.
function toParameters(schema = {}) {
  const properties = {};
  const required = [];
  for (const [key, val] of Object.entries(schema)) {
    const { required: isRequired, ...rest } = val || {};
    properties[key] = rest.type ? rest : { type: "string", ...rest };
    if (isRequired) required.push(key);
  }
  return { type: "object", properties, ...(required.length ? { required } : {}) };
}

// Run a chat completion with optional tools. Calls onDelta(text) as tokens stream.
// If the model requests a tool call, invoke via toolRunner(name, args) and continue
// the loop (up to maxRounds). Returns the final assistant text.
export async function chat({ system, messages, tools = [], toolRunner = null, onDelta = () => {}, model, temperature = 0.6, maxRounds = 6 }) {
  const key = ensureKey();
  const useModel = model || getModel();
  const apiMessages = [];
  if (system) apiMessages.push({ role: "system", content: system });
  for (const m of messages) apiMessages.push(m);

  for (let round = 0; round < maxRounds; round++) {
    const body = {
      model: useModel,
      messages: apiMessages,
      temperature,
      stream: true,
    };
    if (tools.length) {
      body.tools = tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: toParameters(t.inputSchema),
        },
      }));
    }

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 401) throw new Error("Invalid OpenAI API key");
      throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 200)}`);
    }

    // ---- stream and parse ----
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let textAcc = "";
    let toolCalls = {};
    let finishReason = null;

    const flushLine = (line) => {
      if (!line.startsWith("data:")) return;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") return;
      let json;
      try { json = JSON.parse(payload); } catch { return; }
      const delta = json.choices?.[0]?.delta;
      if (delta?.content) {
        textAcc += delta.content;
        onDelta(delta.content);
      }
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          if (!toolCalls[idx]) toolCalls[idx] = { index: idx, id: "", name: "", args: "" };
          if (tc.id) toolCalls[idx].id = tc.id;
          if (tc.function?.name) toolCalls[idx].name += tc.function.name;
          if (tc.function?.arguments) toolCalls[idx].args += tc.function.arguments;
        }
      }
      if (json.choices?.[0]?.finish_reason) {
        finishReason = json.choices[0].finish_reason;
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.trim()) flushLine(line);
      }
    }

    if (finishReason === "tool_calls" && Object.keys(toolCalls).length && toolRunner) {
      const calls = Object.values(toolCalls).sort((a, b) => a.index - b.index);
      const apiToolCalls = calls.map((c, i) => ({
        id: c.id || `call_${i}`,
        type: "function",
        function: { name: c.name, arguments: c.args || "{}" },
      }));
      apiMessages.push({ role: "assistant", content: null, tool_calls: apiToolCalls });
      for (let i = 0; i < calls.length; i++) {
        let args = {};
        try { args = JSON.parse(calls[i].args || "{}"); } catch { args = {}; }
        let toolResult;
        try {
          toolResult = await toolRunner(calls[i].name, args);
        } catch (err) {
          // Never let a live-source failure kill the answer: hand the model the error.
          toolResult = { name: calls[i].name, error: err?.message || String(err) };
        }
        apiMessages.push({ role: "tool", tool_call_id: apiToolCalls[i].id, content: JSON.stringify(toolResult) });
      }
      continue;
    }

    return textAcc.trim();
  }

  throw new Error("Agent exceeded max tool rounds");
}
