// TeamPulse MCP server — one read-only tool, `list_tasks`, exposing the board.
// Permission scope: read only. There is deliberately no move/delete tool; all
// writes go through the app's confirm-gated path (see docs/AUTONOMY-JUSTIFICATION.md).
//
// Run:   node mcp-server/server.mjs           (stdio transport, for an MCP client)
//        node mcp-server/server.mjs --http    (HTTP status + JSON-RPC on :8787)
// No dependencies: the protocol surface here is small enough to speak by hand.

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
      catch (err) { return reply({ content: [{ type: "text", text: `list_tasks failed: ${err.message}` }], isError: true }); }
    default:
      return id === undefined ? null : error(-32601, `method not found: ${method}`);
  }
}

if (process.argv.includes("--http")) {
  const port = Number(process.env.PORT || 8787);
  createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ server: SERVER_INFO, tools: TOOLS.map((t) => t.name), scope: "read-only" }));
    }
    let body = "";
    for await (const chunk of req) body += chunk;
    try {
      const out = await handle(JSON.parse(body));
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(out ?? {}));
    } catch (err) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: `parse error: ${err.message}` } }));
    }
  }).listen(port, () => console.error(`[teampulse-mcp] http on :${port}`));
} else {
  const rl = createInterface({ input: process.stdin });
  rl.on("line", async (line) => {
    if (!line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); } catch (err) { return process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: `parse error: ${err.message}` } }) + "\n"); }
    const out = await handle(msg);
    if (out) process.stdout.write(JSON.stringify(out) + "\n");
  });
}
