# Eval report — grounded handbook answers

**Student:** QA Demo Student · **TeamPulse Rebuild** · run 2026-10-13, re-run 2026-10-15

## What was measured

Twenty questions a teammate might ask, each with the handbook passage that should answer it (or "none", for five questions the handbook does not cover). An answer counts as **correct** when the top-ranked passage is the expected one, or when the system refuses on a question with no answer in the handbook. An answer is **grounded** when it quotes a passage and cites its section id.

## Results

| Version | Correct | Grounded | Wrong refusals | Wrong answers on no-answer questions |
|---|---|---|---|---|
| **Baseline** (first passage containing any query word) | 12 / 20 = **60%** | 15 / 15 | 0 | 0 / 5 |
| BM25 ranking, no threshold | 13 / 20 = 65% | 20 / 20 | 0 | 5 / 5 |
| **BM25 ranking + refusal threshold 1.0** (shipped) | 18 / 20 = **90%** | 19 / 19 | 1 | 0 / 5 |

The baseline number is **60%**. The shipped version scores **90%**, and every answer it gives is grounded in a cited passage.

What surprised me: ranking alone made things *worse* on the no-answer questions. Without a threshold, BM25 always returns its top passage, so all five off-topic questions got a confident, cited, wrong answer. The threshold is what fixed that, and it cost one wrong refusal.

## The two misses (shipped version)

| Question | Expected | Got | Why |
|---|---|---|---|
| "Who do I tell when I'm away?" | §H11 Time off | refused (top score 0.00) | No word overlap at all: "away" and "tell" are not in the passage. A synonym miss, the known cost of keyword search (see decision doc). |
| "Can the bot move my task?" | §H10 Who can change the board | §H2 Task board columns (score 3.31) | "move" and "task" both appear in §H2. The answer is related but not the one asked for. Adding "agent" or "bot" to the question fixes it, which tells me the passage title should say "agent". |

## Refusal check (output validation)

Five questions with no answer in the handbook ("What is the wifi password?", "How much does Pinecone cost?", "Who is the CEO?", "What's for lunch?", "How do I reset my laptop?") were all refused by the shipped version. BM25 without the threshold answered all five with an unrelated passage, which is the failure the threshold exists to stop.

## How to re-run

The twenty questions are in `data/eval-questions.json`. Open the live app, ask each one, and compare the cited section id to the expected one. The ranking code in `index.html` is the same code the eval was run against.
