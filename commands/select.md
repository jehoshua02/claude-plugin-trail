---
description: Select and resume an existing trail topic. Usage: /trail:select [topic-folder]
allowed-tools: Bash
---

1. **Topic folder** — resolve in this order:
   1. Use `$ARGUMENTS` if provided
   2. Otherwise, check conversation context for a topic folder set by a previous `/trail:head` in this session
   3. Otherwise, run the following to get all active folders, then use `AskUserQuestion` to present them as options (label = folder name, description = blank). "Other" is added automatically for custom input.
      ```bash
      ls ~/trail | grep -v README | grep -v "^archive" | grep -v "^daily" | grep -v "^priority-report"
      ```

2. Run `/trail:tldr <topic-folder>` to load and summarize the trail.

3. End with: "Ready to continue. What's next?"
