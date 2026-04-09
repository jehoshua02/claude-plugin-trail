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
   - If `00-tldr.md` does not exist OR `latest_mod > tldr_mod` (stale), **regenerate it** before scoring:
     1. Read all `.md` files in the topic folder
     2. Compose 3–5 bullet TLDR (same rules as `trail:tldr` command — each bullet links to source file, ruthlessly brief)
     3. Write/overwrite `~/trail/<topic-folder>/00-tldr.md`
     4. Commit: `git -C ~/trail add <topic-folder>/00-tldr.md && git -C ~/trail commit -m "tldr: <topic-folder> (auto-refresh from prioritize)"`
   - Read the (now fresh) `00-tldr.md` for scoring

3. **Score each trail on 6 factors (1–5)** — based on the trailhead and tldr content, assess:

   **Numerator factors (higher = more priority):**
   - **Value (1–5):** What impact does this deliver? 1 = nice-to-have, 5 = game-changer
   - **Blocking (1–5):** Does this block other work or people? 1 = standalone, 5 = others stuck waiting
   - **Urgency (1–5):** Time pressure? 1 = whenever, 5 = deadline looming
   - **Momentum (1–5):** How far along? 1 = just an idea, 5 = almost done

   **Denominator factors (higher = less priority):**
   - **Effort (1–5):** How much work remains? 1 = quick win, 5 = massive undertaking
   - **Risk (1–5):** How dangerous? 1 = isolated safe change, 5 = could break everything, hard to prove correct

   **Formula:**
   ```
   Priority = (Value + Blocking + Urgency + Momentum) / (Effort + Risk)
   ```

   For each factor, write a brief one-sentence justification for the score.

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
