---
description: Start actively working on a trail topic (moves from backlog to active). Usage: /trail:start [topic-folder]
allowed-tools: Bash
---

1. **Topic folder** — resolve in this order:
   1. Use `$ARGUMENTS` if provided
   2. Otherwise, check conversation context for a topic folder set by a previous `/trail:head`, `/trail:select`, or `/trail:add` in this session
   3. Otherwise, run `/trail:select` and use the selected topic folder

2. **Locate the trail** — find which location it's in:
   ```bash
   [ -d ~/trail/backlog/<folder> ] && echo "backlog"
   [ -d ~/trail/active/<folder> ] && echo "active"
   [ -d ~/trail/<folder> ] && echo "legacy"
   ```

3. **Handle based on location:**
   - **Already in `active/`** — print "Trail already active." and stop.
   - **In `backlog/`** — move to active:
     ```bash
     mkdir -p ~/trail/active
     mv ~/trail/backlog/<folder> ~/trail/active/<folder>
     git -C ~/trail add active/<folder>/ && git -C ~/trail rm -r --cached backlog/<folder>/ && git -C ~/trail commit -m "start: <folder> → active"
     ```
   - **In top-level (legacy)** — move directly to active:
     ```bash
     mkdir -p ~/trail/active
     mv ~/trail/<folder> ~/trail/active/<folder>
     git -C ~/trail add active/<folder>/ && git -C ~/trail rm -r --cached <folder>/ && git -C ~/trail commit -m "start: <folder> → active"
     ```

4. Run `/trail:tldr active/<folder>` to summarize.

5. End with: "Trail is now active. What's the plan?"
