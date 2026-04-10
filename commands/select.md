---
description: Select and resume an existing trail topic. Usage: /trail:select [topic-folder]
allowed-tools: Bash
---

1. **Topic folder** — resolve in this order:
   1. Use `$ARGUMENTS` if provided
   2. Otherwise, check conversation context for a topic folder set by a previous `/trail:head` in this session
   3. Otherwise, list all active folders from all locations, then use `AskUserQuestion` to present them as options (label = folder name, description = location). "Other" is added automatically for custom input.
      ```bash
      # Collect trails from all locations with their source
      (cd ~/trail && for d in backlog/*/; do [ -d "$d" ] && echo "backlog|$(basename $d)"; done 2>/dev/null)
      (cd ~/trail && for d in active/*/; do [ -d "$d" ] && echo "active|$(basename $d)"; done 2>/dev/null)
      (cd ~/trail && ls -d */ 2>/dev/null | grep -v -E '^(backlog|active|archive|daily|\.git)/' | sed 's|/$||' | while read d; do echo "legacy|$d"; done)
      ```

2. **Resolve the full path** — based on the location prefix:
   - `backlog|<folder>` → `~/trail/backlog/<folder>`
   - `active|<folder>` → `~/trail/active/<folder>`
   - `legacy|<folder>` → lazy-migrate to backlog first:
     ```bash
     mkdir -p ~/trail/backlog
     mv ~/trail/<folder> ~/trail/backlog/<folder>
     git -C ~/trail add backlog/<folder>/ && git -C ~/trail rm -r --cached <folder>/ && git -C ~/trail commit -m "migrate: <folder> → backlog"
     ```
     Then treat as `~/trail/backlog/<folder>`.

3. Run `/trail:tldr <topic-folder>` to load and summarize the trail. Pass the **full relative path** (e.g. `backlog/<folder>` or `active/<folder>`) so tldr can find it.

4. End with: "Ready to continue. What's next?"
