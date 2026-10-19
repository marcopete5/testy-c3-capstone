# Autonomy justification — the stale sweep agent

**Student:** QA Demo Student · **TeamPulse Rebuild** · 2026-10-14

## What the agent does

Once a person presses *Run stale sweep*, the agent:

1. States its plan (move In-progress tasks untouched for 7+ days back to To do, with a note).
2. Reads the board through the `list_tasks` tool, the same tool the MCP server exposes.
3. Works out which tasks are stale.
4. **Stops and shows a proposal.** A person approves or rejects.
5. Only if approved: saves a snapshot of the board, applies the moves, and writes every step to the audit log.

## The autonomy level I chose: confirm-gated writes

The agent reads freely and **asks me to confirm before changing anything**. I considered the two neighbours:

- **Read-only (report only).** Safer, but then a person still does the moving, and the whole point of the sweep is that nobody has to police the board. It would have been a report, not an agent.
- **Autonomous writes within limits** (for example, "may move at most three tasks per run"). Hands-off, and the limit caps the damage. I rejected it because of what a bad run looks like from a teammate's side: their task vanished from In progress with no warning. The handbook says the agent "may propose moves but never applies them without a person approving the proposal first" (§H10), and I wrote that rule *because* of this decision, not after it.

Confirm-gated is the level where a wrong proposal costs one click and a wrong apply is impossible without a person saying yes.

## Permission scope

- The MCP server exposes **one tool, `list_tasks`, read-only**. There is no `move_task` tool on purpose.
- The agent's writes go through the app's own `moveTask` function, which is the same code path a person uses when they click a button, so there is no second way to change the board that bypasses the log.
- The agent can only move tasks **from In progress to To do**. It cannot delete, cannot touch Done, and cannot edit titles.

## Error handling

- If `list_tasks` fails (for example, the seed file can't load), the run stops at step 2 and logs the failure. Nothing is proposed.
- If there are no stale tasks, the run ends with "nothing to propose" and that is logged too, so an empty run is visible.
- Every applied run saves a snapshot first. *Undo last run* restores it in one click, and the rollback is logged under the same run id. See the rollback evidence.

## What would make me raise the autonomy level

A month of logs showing every proposal was approved unchanged. At that point an auto-apply with a daily cap and a morning summary would be justified by evidence, not by convenience.
