---
description: Analyze all active trails and generate a priority report. Usage: /trail:prioritize
allowed-tools: Bash, Agent
---

1. **Scan active trails** — get all active topic folders:
   ```bash
   ls ~/trail | grep -v README | grep -v "^archive" | grep -v "^daily" | grep -v "^priority-report"
   ```

2. **Process trails in parallel** — spawn one subagent per trail, all in a single message (parallel). Each subagent:
   - Run `/trail:tldr <topic-folder>` to ensure the TLDR is fresh
   - Read `~/trail/<topic-folder>/00-tldr.md`
   - Parse the `## Priority Factors` table for the 6 scores (Value, Blocking, Urgency, Momentum, Effort, Risk) and their reasoning
   - Return: topic folder name, all 6 scores with reasoning, and 2-3 sentence TLDR summary

3. **Rank trails** — collect results from all subagents. Compute priority score for each:

   ```
   Priority = (Value + Blocking + Urgency) * Momentum / (Effort + Risk)
   ```

   Do NOT re-score the factors yourself. Use the scores from `00-tldr.md` as-is. The `trail:tldr` command maintains these scores. Sort by priority score descending.

4. **Generate report** — write to `~/trail/priority-report.md` with this format:

   ```
   # Trail Priority Report

   **Generated:** <YYYY-MM-DD HH:MM>

   ## Rankings

   ### 1. <Topic Name> — Score: <X.XX>
   **Folder:** <topic-folder>

   | Factor   | Score | Reasoning |
   |----------|-------|-----------|
   | Value    | X     | <why>     |
   | Blocking | X     | <why>     |
   | Urgency  | X     | <why>     |
   | Momentum | X     | <why>     |
   | Effort   | X     | <why>     |
   | Risk     | X     | <why>     |

   **TLDR:** <2-3 sentence summary from tldr>

   ---

   ### 2. <Next Topic> — Score: <X.XX>
   ...

   ## Formula
   Priority = (Value + Blocking + Urgency) * Momentum / (Effort + Risk)
   Each factor scored 1–5. Higher score = do first.
   ```

6. **Commit the report:**
   ```bash
   git -C ~/trail add . && git -C ~/trail commit -m "prioritize: <YYYY-MM-DD>"
   ```

7. **Print summary** — show the ranked list to the user with scores. Mention the full report is at `~/trail/priority-report.md`.
