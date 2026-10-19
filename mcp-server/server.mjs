// TeamPulse MCP server — one read-only tool, `list_tasks`, exposing the board.
// Permission scope: read only. There is deliberately no move/delete tool; all
// writes go through the app's confirm-gated path (see docs/AUTONOMY-JUSTIFICATION.md).
//
// Run:   node mcp-server/server.mjs           (stdio transport, for an MCP client)
//        node mcp-server/server.mjs --http    (HTTP status + JSON-RPC on 127.0.0.1:8787)
// No dependencies: the protocol surface here is small enough to speak by hand.
//
// HTTP mode is for local testing only: it binds to loopback, refuses browser
// origins it doesn't know, caps the request body, and never echoes internal
// error text to the caller (error handling, see docs/AUTONOMY-JUSTIFICATION.md).

import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SEED = join(here, "..", "data", "tasks.seed.json");
const DAY = 86400000;

const SERVER_INFO = { name: "teampulse-mcp", version: "1.0.0" };
const TOOLS = [
  {
    name: "list_tasks",
    description: "Read the TeamPulse board (read-only). Returns every task with its column, owner, note and age in days.",
    inputSchema: { type: "object", properties: { column: { type: "string", enum: ["todo", "inprogress", "done"], description: "Optional column filter" } } },
  },
];

async function listTasks(args = {}) {
  const seed = JSON.parse(await readFile(SEED, "utf8"));
  const tasks = seed
    .map((t) => ({ id: t.id, title: t.title, column: t.column, owner: t.owner, note: t.note, ageDays: t.ageDays, updatedAt: new Date(Date.now() - t.ageDays * DAY).toISOString() }))
    .filter((t) => !args.column || t.column === args.column);
  return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
}

const isRequestObject = (m) =>
  m !== null && typeof m === "object" && !Array.isArray(m) && typeof m.method === "string" &&
  (m.id === undefined || m.id === null || typeof m.id === "string" || typeof m.id === "number");
process.on("unhandledRejection", (err) => console.error("[teampulse-mcp] unhandled rejection", err));

async function handle(msg) {
  const { id, method, params } = msg;
  const reply = (result) => ({ jsonrpc: "2.0", id, result });
  const error = (code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });
  switch (method) {
    case "initialize":
      return reply({ protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: SERVER_INFO });
    case "notifications/initialized":
      return null;
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS });
    case "tools/call":
      if (params?.name !== "list_tasks") return error(-32602, `unknown tool: ${params?.name}`);
      try { return reply(await listTasks(params.arguments)); }
      catch (err) {
        console.error("[teampulse-mcp] list_tasks failed", err);
        return reply({ content: [{ type: "text", text: "list_tasks failed (see server log)" }], isError: true });
      }
    default:
      return id === undefined ? null : error(-32601, `method not found: ${method}`);
  }
}

if (process.argv.includes("--http")) {
  const port = Number(process.env.PORT || 8787);
  const MAX_BODY = 64 * 1024;
  const ALLOWED_HOSTS = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  const json = (res, status, obj) => {
    let payload;
    try { payload = JSON.stringify(obj); }
    catch { status = 500; payload = JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32603, message: "internal error" } }); }
    if (res.headersSent) return res.end();
    res.writeHead(status, { "content-type": "application/json" });
    res.end(payload);
  };
  createServer(async (req, res) => {
    req.setTimeout(10_000, () => req.destroy());
    // Loopback only, and no browser origin may drive it (DNS-rebinding / CSRF guard).
    if (!ALLOWED_HOSTS.has(req.headers.host ?? "") || req.headers.origin) return json(res, 403, { error: "forbidden" });
    if (req.method !== "POST") return json(res, 200, { server: SERVER_INFO, tools: TOOLS.map((t) => t.name), scope: "read-only" });
    if (!(req.headers["content-type"] ?? "").startsWith("application/json")) return json(res, 415, { error: "content-type must be application/json" });
    if (Number(req.headers["content-length"] ?? 0) > MAX_BODY) return json(res, 413, { error: "body too large" });
    let body = "", len = 0;
    for await (const chunk of req) {
      len += chunk.length;
      if (len > MAX_BODY) { json(res, 413, { error: "body too large" }); return req.destroy(); }
      body += chunk;
    }
    let msg;
    try { msg = JSON.parse(body); }
    catch { return json(res, 400, { jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }); }
    if (!isRequestObject(msg)) return json(res, 400, { jsonrpc: "2.0", id: null, error: { code: -32600, message: "invalid request" } });
    try { json(res, 200, (await handle(msg)) ?? {}); }
    catch (err) {
      console.error("[teampulse-mcp] dispatch failed", err);
      if (res.headersSent) res.destroy();
      else json(res, 500, { jsonrpc: "2.0", id: msg.id ?? null, error: { code: -32603, message: "internal error" } });
    }
  }).listen(port, "127.0.0.1", () => console.error(`[teampulse-mcp] http on 127.0.0.1:${port}`));
} else {
  const rl = createInterface({ input: process.stdin });
  rl.on("line", async (line) => {
    if (!line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); } catch { return process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }) + "\n"); }
    if (!isRequestObject(msg)) return process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "invalid request" } }) + "\n");
    try {
      const out = await handle(msg);
      if (out) process.stdout.write(JSON.stringify(out) + "\n");
    } catch (err) {
      console.error("[teampulse-mcp] dispatch failed", err);
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: msg.id ?? null, error: { code: -32603, message: "internal error" } }) + "\n");
    }
  });
}
