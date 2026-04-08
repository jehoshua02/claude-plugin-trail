---
description: Get a brief summary of an existing trail topic. Usage: /trail:tldr [topic-folder]
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

3. Output a TLDR — 3–5 bullet points max. Cover:
   - What the topic is about
   - What was tried or discovered
   - Current status or outcome

   Be ruthlessly brief. No filler. Just the facts.
