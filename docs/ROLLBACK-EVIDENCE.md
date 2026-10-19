# Rollback evidence

**Student:** QA Demo Student · **TeamPulse Rebuild** · practiced 2026-10-14 and 2026-10-15

Two different rollbacks, both practiced on purpose before the capstone was due.

## 1. Rolling back an agent run (the board)

The stale sweep saves a snapshot of the board before it applies any move. *Undo last run* restores that snapshot and logs the rollback under the same run id.

Practiced on 2026-10-14. The run moved two tasks; I undid it 41 seconds later. Audit log excerpt:

```
[2026-10-14T16:02:12.418Z] run-20261014-100204 snapshot: board snapshot saved for rollback
[2026-10-14T16:02:12.420Z] run-20261014-100204 write:move_task: t3 "Rotate on-call calendar for November" inprogress → todo
[2026-10-14T16:02:12.421Z] run-20261014-100204 write:move_task: t4 "Replace hero image on landing page" inprogress → todo
[2026-10-14T16:02:12.422Z] run-20261014-100204 done: 2 task(s) moved
[2026-10-14T16:02:53.907Z] run-20261014-100204 rollback: board restored from snapshot taken before apply
```

What I checked afterwards: both tasks were back in In progress, their notes were back to what they were before, and the log still showed the moves *and* the rollback, so nothing was hidden.

## 2. Rolling back a release (the deployed app)

The app deploys from `main` to GitHub Pages on every push. The handbook's rule (§H6) is: revert the release commit, push, never force-push.

Practiced on 2026-10-15. I pushed a change that broke the handbook search (the index was built before the handbook had loaded), confirmed the live site was broken in a private window, then reverted:

```
$ git log --oneline -3
8c1f2a0 (HEAD -> main) Revert "search: build index eagerly"
4d9e77b search: build index eagerly
b2a6c31 docs: eval report re-run
$ git push origin main
```

| Step | Time (Mountain) |
|---|---|
| Bad commit pushed | 2026-10-15 14:21 |
| Broken on the live site, confirmed | 14:24 |
| `git revert` pushed | 14:27 |
| GitHub Pages rebuilt, live site working again | 14:30 |

Nine minutes from noticing to fixed, and the broken commit is still in history so I can see what went wrong. The fix itself (await the handbook fetch before building the index) went out as a new commit the next morning, after the eval set passed again.

## What I would tighten

Add a one-line smoke check (fetch the live page and look for the board heading) that runs after every deploy, so I find out about a broken release from the check and not from a teammate.
