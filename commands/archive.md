---
description: Archive a trail topic. Usage: /trail:archive [topic-folder]
allowed-tools: Bash
---

1. **Topic folder** — resolve in this order:
   1. Use `$ARGUMENTS` if provided
   2. Otherwise, check conversation context for a topic folder set by a previous `/trail:head`, `/trail:add`, or `/trail:resume` in this session
   3. Otherwise, run the following to get the most recent non-archive folders, then use `AskUserQuestion` to present them as options (up to 4, label = folder name, description = blank). "Other" is added automatically for custom input.
      ```bash
      ls ~/trail | grep -v README | grep -v "^archive" | tail -4
      ```

2. Run the `/trail:tldr` command for the topic folder to ensure the TLDR is up to date before archiving.

3. Update the trailhead status to `archived`:
   ```bash
   sed -i '' 's/^**Status:** .*/**Status:** archived/' ~/trail/<topic-folder>/00-trailhead.md
   ```

4. Move the topic folder to the archive:
   ```bash
   mkdir -p ~/trail/archive
   mv ~/trail/<topic-folder> ~/trail/archive/<topic-folder>
   ```

5. Commit:
   ```bash
   git -C ~/trail add . && git -C ~/trail commit -m "archive: <topic-folder>"
   ```

6. Print the new path to the archived topic folder when done.
