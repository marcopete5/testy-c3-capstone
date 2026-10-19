# Decision document — TeamPulse Rebuild

**Student:** QA Demo Student · **Course 3 capstone (The Rebuild)** · written Week 8, updated Week 10 (2026-10-15)

This is the C2 TeamPulse board rebuilt from scratch, the deliberate way. In C2 I built by effort: start coding, fix what breaks. This time every layer was a decision made before any code, and the tradeoffs are written down here so an instructor can argue with them.

## What the app is for

A six-person remote team (the Kestrel team) that needs three things: a board that shows what is really being worked on, answers to handbook questions without pinging a teammate, and a way to keep the board honest without a person doing the policing.

## Brownfield read of my C2 build

Before deciding anything I re-read my C2 TeamPulse code. What I found: the board logic was fine, but there was no record of *why* anything was built the way it was, no way to answer "what's our policy on X" without asking in chat, and no audit of who moved what. The rebuild keeps the board idea and adds the parts that were missing: grounded answers, a governed agent, and a log.

## Stack, in priority order

Priority order was: (1) safe to undo, (2) nothing a non-technical teammate can't restart, (3) cheap, (4) fast to build. Features came last on purpose.

| Layer | I chose | I rejected | Why I still win |
|---|---|---|---|
| Hosting | **GitHub Pages** (static, deploys on push to `main`) | A **Vercel**-style managed platform with serverless functions | Vercel would have given me a server for free and one-step publishing, and honestly its preview deployments are nicer. But every function I add is one more thing that can be down on a Monday morning, and the rollback story is "revert the commit" either way. With no server, "the app is down" can only mean GitHub Pages is down. |
| Data | **Browser-local storage** (each person's board lives in their browser; the seed board is in the repo) | A **Postgres database on Supabase** | Postgres would keep the whole team on one board with real accounts, and I know the team will eventually want that. I rejected it for this build because it brings accounts, a secret key, and a database to back up, and the course's whole point was to choose the smallest thing that proves the system. The cost I accept: two teammates can see different boards. That is written on the README so nobody is surprised. |
| Search for the grounded feature | **In-browser BM25 keyword index** over the handbook (built at page load) | A **hosted vector store** (Pinecone-style) with embeddings | The hosted store would handle fuzzy questions better ("who do I tell when I'm away" would match "time off"). I rejected it because the corpus is twelve passages, every embedding call needs a key I would have to hide behind a server I decided not to have, and keyword search over twelve passages scores 90% on my eval set with a refusal threshold. The cost: synonyms miss. The eval report shows exactly which questions miss. |
| Agent runtime | **A fixed step loop in the browser** (plan → read → evaluate → gate → apply) with a person approving every write | Letting the agent **write on its own** within limits | Autonomous writes would make the sweep genuinely hands-off. I rejected that because the handbook (§H10) says the agent may propose but never apply without a person, and because a wrong move on the board is annoying but a wrong move I can't explain is worse. See the autonomy justification. |
| MCP server | **One read-only tool, `list_tasks`,** in a small Node server in the repo | Exposing `move_task` as a second tool | A write tool would let any connected client move tasks with no gate at all. Read-only means the worst an MCP client can do is read the board. |

## Self-taught element (declaration)

**Self-taught element: BM25 ranking, implemented by hand in `index.html`.** The course taught retrieval with embeddings and a vector store. Because I chose not to run a server, I needed a ranking method that works entirely in the browser with no model and no key. I taught myself BM25 from the original Robertson and Zaragoza paper and two blog posts, implemented the term-frequency saturation (`k1 = 1.2`) and length normalisation (`b = 0.75`) myself, and tuned the refusal threshold (`1.0`) against the eval set. The course never covered it; I can explain every line of it.

## What I would change with more time

Move the board to Supabase so the team shares one board, keep the agent gate exactly as it is, and swap keyword search for embeddings only if the eval set shows the synonym misses are hurting real people.
