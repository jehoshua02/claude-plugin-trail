---
description: Generate a daily trail summary for Slack. Usage: /trail:daily
allowed-tools: Bash
---

1. **Find trails touched today** — use git log to find all files committed today in `~/trail`:
   ```bash
   git -C ~/trail log --since="midnight" --name-only --pretty=format: | sort -u | grep '\.md$' | grep -v '^$'
   ```

2. **Group by topic folder** — extract the parent folder from each file path. Deduplicate to get a list of topic folders touched today. Include both active (`<topic>/`) and archived (`archive/<topic>/`) paths.

3. **Read trailheads** — for each topic folder, read `00-trailhead.md` to get:
   - Topic name (the `#` heading)
   - Ticket
   - Status (active/archived)

   For archived topics, the path is `~/trail/archive/<topic>/00-trailhead.md`.
   For active topics, the path is `~/trail/<topic>/00-trailhead.md`.

4. **Read today's entries** — for each topic, read only the files that appeared in the git log output. Extract the `#` heading from each as the entry title.

5. **Compose daily summary** — format as Slack-friendly plain text:

   ```
   *Daily Trail Summary — <YYYY-MM-DD>*

   *<Topic Name>* (<ticket>) [<status>]
   - <Entry title>
   - <Entry title>

   *<Another Topic>* (<ticket>) [<status>]
   - <Entry title>
   ```

   Rules:
   - Use `*bold*` for topic names (Slack bold)
   - Use `-` for bullet entries
   - Show ticket if not "none", omit parentheses if no ticket
   - Show status in square brackets
   - One blank line between topics
   - If a `00-tldr.md` was among today's files, list it as "Updated TLDR"
   - If a `00-trailhead.md` was among today's files, list it as "Started trail"
   - For all other entries, use the `#` heading from the file

6. **Copy to clipboard and print**:
   ```bash
   echo "<summary>" | pbcopy
   ```

   Print the summary to the user and confirm it was copied to clipboard.

   If no trails were touched today, print: "No trails touched today." and skip clipboard.
