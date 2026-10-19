# TeamPulse Rebuild

The C2 TeamPulse task board, rebuilt the deliberate way for Course 3: grounded handbook answers with citations, a confirm-gated stale-task agent, an audit log, a read-only MCP server, and a practiced rollback.

**Live app:** https://marcopete5.github.io/testy-c3-capstone/
**MCP server status:** https://marcopete5.github.io/testy-c3-capstone/mcp/

This is a **test capstone** used for the Course 3 viva walkthrough (student: QA Demo Student). It is intentionally small and safe to delete.

## What it does

- **Board** — To do / In progress / Done. Saved in your browser (each person sees their own copy; see the decision doc for why).
- **Ask the handbook** — a grounded Q&A over the twelve-passage team handbook. Every answer quotes a passage and cites its section. Questions the handbook can't answer are refused, not guessed.
- **Stale sweep agent** — reads the board through the `list_tasks` tool, finds tasks stuck in In progress for 7+ days, and *proposes* moving them back to To do. Nothing moves until a person approves. Every step is written to the audit log; every applied run can be undone.
- **MCP server** — `mcp-server/server.mjs`, one read-only tool, no dependencies.

## Run it

Open the live link, or serve the folder locally (`npx serve .`) — the app fetches its data files, so opening `index.html` straight from disk won't load them.

## The capstone documents

| Document | What it is |
|---|---|
| [docs/DECISION-DOC.md](docs/DECISION-DOC.md) | Stack chosen in priority order, each rejected alternative, and the self-taught element declaration (BM25 ranking). |
| [docs/AUTONOMY-JUSTIFICATION.md](docs/AUTONOMY-JUSTIFICATION.md) | Why the agent asks before it writes, the permission scope, and error handling. |
| [docs/EVAL-REPORT.md](docs/EVAL-REPORT.md) | The 20-question eval, the baseline number, and the misses. |
| [docs/VALUE-MEMO.md](docs/VALUE-MEMO.md) | C2 vs. C3 as a method comparison, with the number and what else could explain it. |
| [docs/ROLLBACK-EVIDENCE.md](docs/ROLLBACK-EVIDENCE.md) | Two practiced rollbacks: an agent run and a release. |
| [docs/AUDIT-LOG.md](docs/AUDIT-LOG.md) | Exported runs from the build. |

## Self-taught element

BM25 ranking, implemented by hand in `index.html`. The course taught embedding-based retrieval; this build has no server to hold a model or a key, so I taught myself a method that runs entirely in the browser.
