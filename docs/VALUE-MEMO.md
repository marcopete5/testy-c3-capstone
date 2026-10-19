# Value Memo — building by effort vs. building by judgment

**Student:** QA Demo Student · **C2 TeamPulse vs. C3 TeamPulse Rebuild** · 2026-10-16

## The claim

**The deliberate build took about 35% less working time than the C2 build, and I got stuck a quarter as often.**

| | C2 (built by effort) | C3 Rebuild (built by judgment) |
|---|---|---|
| Working time | about 14 hours over 2 weeks (from my W8D5 recollection log) | 9 hours 10 minutes over 10 days (from the build log in the repo) |
| Times I was stuck for 30+ minutes | 8 | 2 |
| Features shipped | board only | board, grounded Q&A with citations, governed agent, audit log, MCP server, rollback |
| Rollbacks practiced | 0 | 2 |

The baseline is my lived C2 experience as I wrote it down in Week 8 (before this build started). The result is the rebuild log I kept while building.

## What the number does not prove

I want to name what else could explain the number before anyone asks, because the honest answer is that the method is not the only thing that changed:

1. **Second time building the same idea.** I already knew what a task board needs. Some of the 35% is just familiarity, and I cannot separate that from the method.
2. **The backend got smaller, not better.** C2 had Express, Mongo and JWT. The rebuild has no server at all. Fewer moving parts means fewer places to get stuck, whether or not I made better decisions.
3. **I am better at the tools now.** Ten more weeks with the AI tools and with Git. Some stuck-time in C2 was tool-fumbling that would not happen today regardless of method.
4. **The C2 baseline is from memory.** I logged C3 as I went; C2 I reconstructed in Week 8. Memory tends to round up pain and round down time, so the C2 number could be off in either direction.
5. **Different features.** It is a method comparison, not the same app twice, but that also means the two timelines are not measuring identical work.

## What I still believe

Even granting all five, the one thing I can point to is *where* the time went. In C2 I spent hours in the "it broke, why?" loop. In C3 the two stuck moments were both decisions I had not made yet (the refusal threshold, and whether the MCP tool should write). Writing decisions down first moved the hard part from debugging to thinking, and thinking was faster. If a future build does not feel easier than this one, that is a sign something in the method is wrong, not a sign to try harder.
