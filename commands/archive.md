---
description: Archive a trail topic. Usage: /trail:archive [topic-folder]
allowed-tools: Bash
---

1. **Topic folder** — resolve in this order:
   1. Use `$ARGUMENTS` if provided
   2. Otherwise, check conversation context for a topic folder set by a previous `/trail:head`, `/trail:add`, or `/trail:select` in this session
   3. Otherwise, run `/trail:select` and use the selected topic folder

2. **Locate the trail** — the topic folder may be a bare name or a prefixed path (e.g. `backlog/<folder>` or `active/<folder>`). If bare, search for it:
   ```bash
   [ -d ~/trail/active/<folder> ] && echo "active/<folder>"
   [ -d ~/trail/backlog/<folder> ] && echo "backlog/<folder>"
   [ -d ~/trail/<folder> ] && echo "<folder>"
   ```
   Use the first match as `<trail-path>`.

3. Run the `/trail:tldr` command for the trail to ensure the TLDR is up to date before archiving.

4. Update the trailhead status to `archived`:
   ```bash
   sed -i '' 's/^\*\*Status:\*\* .*/\*\*Status:\*\* archived/' ~/trail/<trail-path>/00-trailhead.md
   ```

5. Move the topic folder to the archive:
   ```bash
   mkdir -p ~/trail/archive
   mv ~/trail/<trail-path> ~/trail/archive/<folder>
   ```

6. Commit:
   ```bash
   git -C ~/trail add archive/<folder>/ && git -C ~/trail rm -r --cached <trail-path>/ && git -C ~/trail commit -m "archive: <folder>"
   ```

7. Print the new path to the archived topic folder when done.
