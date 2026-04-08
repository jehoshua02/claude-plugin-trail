---
description: Resume an existing trail topic. Usage: /trail:resume [topic-folder]
allowed-tools: Bash
---

1. **Topic folder** — use `$ARGUMENTS` if provided. Otherwise, list folders in `~/trail` and ask the user to pick one:
   ```bash
   ls ~/trail
   ```

2. Read all files in the topic folder:
   ```bash
   ls ~/trail/<topic-folder>/
   cat ~/trail/<topic-folder>/*.md
   ```

3. Summarize the topic for the user:
   - Restate the topic name, ticket, and status from the trailhead
   - Give a short summary of what has been found/done so far (from the entries)
   - End with: "Ready to continue. What's next?"
