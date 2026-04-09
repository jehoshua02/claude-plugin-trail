---
description: Analyze all active trails and generate a priority report. Usage: /trail:prioritize
allowed-tools: Bash
---

1. **Scan active trails** — get all active topic folders:
   ```bash
   ls ~/trail | grep -v README | grep -v "^archive" | grep -v "^daily" | grep -v "^priority-report"
   ```

2. **Read each trail's data** — for each topic folder:
   - Read `~/trail/<topic-folder>/00-trailhead.md` for status, date, ticket, context
   - **Count trail entries** (exclude `00-trailhead.md` and `00-tldr.md`):
     ```bash
     entry_count=$(ls ~/trail/<topic>/*.md | grep -v 00-tldr | grep -v 00-trailhead | wc -l | tr -d ' ')
     ```
     If `entry_count` is 0, flag the trail as **low-info** — only a trailhead exists, no real work entries. Include a `⚠️ Low info` note next to the trail in the report. Score from trailhead only.
   - **TLDR freshness check** — compare `00-tldr.md` modification time against the newest trail entry:
     ```bash
     tldr_mod=$(stat -f %m ~/trail/<topic>/00-tldr.md 2>/dev/null || echo 0)
     latest_entry=$(ls -t ~/trail/<topic>/*.md | grep -v 00-tldr | grep -v 00-trailhead | head -1)
     latest_mod=$(stat -f %m "$latest_entry" 2>/dev/null || echo 0)
     ```
   - If `00-tldr.md` does not exist OR `latest_mod > tldr_mod` (stale), **run `/trail:tldr <topic-folder>`** to regenerate it before scoring.
   - Read the (now fresh) `00-tldr.md` for scoring

3. **Read priority factors from each `00-tldr.md`** — parse the `## Priority Factors` table for the 6 scores (Value, Blocking, Urgency, Momentum, Effort, Risk) and their reasoning. Compute the priority score using:

   ```
   Priority = (Value + Blocking + Urgency + Momentum) / (Effort + Risk)
   ```

   Do NOT re-score the factors yourself. Use the scores from `00-tldr.md` as-is. The `trail:tldr` command maintains these scores.

4. **Rank trails** — sort by priority score descending.

5. **Generate report** — write to `~/trail/priority-report.md` with this format:

   ```
   # Trail Priority Report

   **Generated:** <YYYY-MM-DD HH:MM>

   ## Rankings

   ### 1. <Topic Name> — Score: <X.XX> <flags>
   **Folder:** <topic-folder>
   **Ticket:** <ticket or none>
   **Date started:** <date from trailhead>

   Where `<flags>` can include: `⚠️ Low info` (only trailhead, no work entries)

   | Factor   | Score | Reasoning |
   |----------|-------|-----------|
   | Value    | X     | <why>     |
   | Blocking | X     | <why>     |
   | Urgency  | X     | <why>     |
   | Momentum | X     | <why>     |
   | Effort   | X     | <why>     |
   | Risk     | X     | <why>     |

   **TLDR:** <2-3 sentence summary from tldr or trailhead context>

   ---

   ### 2. <Next Topic> — Score: <X.XX>
   ...

   ## Formula
   Priority = (Value + Blocking + Urgency + Momentum) / (Effort + Risk)
   Each factor scored 1–5. Higher score = do first.
   ```

6. **Commit the report:**
   ```bash
   git -C ~/trail add . && git -C ~/trail commit -m "prioritize: <YYYY-MM-DD>"
   ```

7. **Print summary** — show the ranked list to the user with scores. Mention the full report is at `~/trail/priority-report.md`.
