---
description: Resume an existing trail topic. Usage: /trail:resume [topic-folder]
allowed-tools: Bash
---

1. **Topic folder** — resolve in this order:
   1. Use `$ARGUMENTS` if provided
   2. Otherwise, check conversation context for a topic folder set by a previous `/trail:head` in this session
   3. Otherwise, run the following to get the most recent folders, then use `AskUserQuestion` to present them as options (up to 4, label = folder name, description = blank). "Other" is added automatically for custom input.
      ```bash
      ls ~/trail | grep -v README | grep -v "^archive" | tail -4
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
