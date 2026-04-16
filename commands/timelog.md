---
description: Generate a chronological timelog of trail activity for a given day. Usage: /trail:timelog [YYYY-MM-DD]
allowed-tools: Bash
---

1. **Determine the date** — use `$ARGUMENTS` if a date is provided, otherwise default to today:
   ```bash
   date '+%Y-%m-%d'
   ```

2. **Collect timestamped events** — scan all trail folders for entries with `**Created:**` timestamps or `## Edit Log` entries matching the target date:
   ```bash
   grep -rn '^\*\*Created:\*\*' ~/trail/active/ ~/trail/backlog/ ~/trail/archive/ 2>/dev/null | grep "<YYYY-MM-DD>"
   grep -rn '^\- <YYYY-MM-DD>' ~/trail/active/ ~/trail/backlog/ ~/trail/archive/ 2>/dev/null
   ```

   Replace `<YYYY-MM-DD>` with the target date.

3. **Parse each event** — for each match, extract:
   - **Time** — the `HH:MM` portion of the timestamp
   - **Topic** — the topic folder name (e.g. `2026-04-15-saas-6567`)
   - **File** — the entry filename (e.g. `01-initial-investigation.md`)
   - **Action** — one of:
     - For `**Created:**` matches on `00-trailhead.md`: "Started trail"
     - For `**Created:**` matches on other files: the `#` heading from that file
     - For edit log matches: the description after the `—` dash

4. **Read headings** — for each `**Created:**` match that isn't a trailhead, read the `#` heading from the file:
   ```bash
   head -1 ~/trail/<path-to-file>
   ```

5. **Sort chronologically** — sort all events by time (HH:MM).

6. **Estimate time per topic** — for each topic, calculate the span from its first event to its last event of the day. If a topic has only one event, count it as 15 minutes (minimum session). Sum all topic spans for a daily total.

7. **Format the timelog**:

   ```
   # Timelog — <YYYY-MM-DD>

   | Time  | Topic | Activity |
   |-------|-------|----------|
   | 09:15 | saas-6567 | Started trail |
   | 09:32 | saas-6567 | Initial investigation |
   | 10:05 | saas-6230 | Updated conclusion based on new findings |
   | 11:20 | saas-6567 | Snowflake query results |

   ## Time Estimates

   | Topic | First | Last | Estimated |
   |-------|-------|------|-----------|
   | saas-6567 | 09:15 | 11:20 | 2h 5m |
   | saas-6230 | 10:05 | 10:05 | 15m |

   **Total: ~2h 20m**
   ```

   Rules:
   - Strip the date prefix from topic folder names for brevity (e.g. `2026-04-15-saas-6567` becomes `saas-6567`)
   - Sort by time ascending
   - Single-event topics get a 15m minimum estimate
   - Format durations as `Xh Ym` (omit hours if under 60m)
   - If no events found for the date, print: "No trail activity found for <YYYY-MM-DD>."

8. **Print the timelog** to the user.
