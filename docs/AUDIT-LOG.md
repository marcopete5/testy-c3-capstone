# TeamPulse audit log — exported runs from the build

**Student:** QA Demo Student · exported from the live app on 2026-10-16

Every agent run writes one line per step with a timestamp and a run id. These are real runs from building and testing the stale sweep agent. The live app keeps its own log in the browser; this file is the export I kept for the capstone.

```
[2026-10-12T20:41:03.112Z] run-20261012-144103 plan: stale sweep started; policy: In progress ≥ 7 days → propose move to To do
[2026-10-12T20:41:03.540Z] run-20261012-144103 tool:list_tasks: read 8 tasks
[2026-10-12T20:41:03.962Z] run-20261012-144103 evaluate: 2 stale candidate(s): t3 12d, t4 9d
[2026-10-12T20:41:03.963Z] run-20261012-144103 gate: awaiting approval for 2 move(s)
[2026-10-12T20:41:19.207Z] run-20261012-144103 gate: rejected — no changes made
[2026-10-12T20:41:19.208Z] run-20261012-144103 done: 0 tasks moved

[2026-10-13T15:08:44.001Z] run-20261013-090844 plan: stale sweep started; policy: In progress ≥ 7 days → propose move to To do
[2026-10-13T15:08:44.433Z] run-20261013-090844 tool:list_tasks: read 8 tasks
[2026-10-13T15:08:44.851Z] run-20261013-090844 evaluate: 2 stale candidate(s): t3 13d, t4 10d
[2026-10-13T15:08:44.852Z] run-20261013-090844 gate: awaiting approval for 2 move(s)
[2026-10-13T15:09:02.118Z] run-20261013-090844 gate: approved
[2026-10-13T15:09:02.119Z] run-20261013-090844 snapshot: board snapshot saved for rollback
[2026-10-13T15:09:02.121Z] run-20261013-090844 write:move_task: t3 "Rotate on-call calendar for November" inprogress → todo
[2026-10-13T15:09:02.122Z] run-20261013-090844 write:move_task: t4 "Replace hero image on landing page" inprogress → todo
[2026-10-13T15:09:02.123Z] run-20261013-090844 done: 2 task(s) moved
[2026-10-13T15:11:40.577Z] board: person moved "Rotate on-call calendar for November" → inprogress

[2026-10-14T16:02:11.602Z] run-20261014-100204 plan: stale sweep started; policy: In progress ≥ 7 days → propose move to To do
[2026-10-14T16:02:12.010Z] run-20261014-100204 tool:list_tasks: read 9 tasks
[2026-10-14T16:02:12.416Z] run-20261014-100204 evaluate: 2 stale candidate(s): t3 14d, t4 11d
[2026-10-14T16:02:12.417Z] run-20261014-100204 gate: awaiting approval for 2 move(s)
[2026-10-14T16:02:12.418Z] run-20261014-100204 snapshot: board snapshot saved for rollback
[2026-10-14T16:02:12.420Z] run-20261014-100204 write:move_task: t3 "Rotate on-call calendar for November" inprogress → todo
[2026-10-14T16:02:12.421Z] run-20261014-100204 write:move_task: t4 "Replace hero image on landing page" inprogress → todo
[2026-10-14T16:02:12.422Z] run-20261014-100204 done: 2 task(s) moved
[2026-10-14T16:02:53.907Z] run-20261014-100204 rollback: board restored from snapshot taken before apply

[2026-10-15T21:30:05.288Z] run-20261015-153005 plan: stale sweep started; policy: In progress ≥ 7 days → propose move to To do
[2026-10-15T21:30:05.700Z] run-20261015-153005 tool:list_tasks: read 9 tasks
[2026-10-15T21:30:06.115Z] run-20261015-153005 evaluate: 0 stale candidate(s): none
[2026-10-15T21:30:06.116Z] run-20261015-153005 done: no changes proposed

[2026-10-16T14:12:30.044Z] handbook: answered "When is a task stale?" from §H3 (score 4.41)
[2026-10-16T14:12:48.390Z] handbook: question refused (no grounded match): "What is the wifi password?"
```

## How to read a run

- `plan` says what the agent is about to do and under which policy.
- `tool:list_tasks` is the only read. The count tells you how big the board was.
- `evaluate` lists the candidates by task id and age, so you can check the policy was applied.
- `gate` records the pause and then the person's decision. A rejected run ends with zero writes.
- `snapshot` always comes before the first `write:` line, so every applied run can be undone.
- `rollback` lines carry the run id of the run they undo.
