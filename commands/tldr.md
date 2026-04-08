---
description: Get a brief summary of an existing trail topic. Usage: /trail:tldr [topic-folder]
allowed-tools: Bash
---

1. **Topic folder** — resolve in this order:
   1. Use `$ARGUMENTS` if provided
   2. Otherwise, check conversation context for a topic folder set by a previous `/trail:head`, `/trail:add`, or `/trail:resume` in this session
   3. Otherwise, run the following to get the most recent folders, then use `AskUserQuestion` to present them as options (up to 4, label = folder name, description = blank). "Other" is added automatically for custom input.
      ```bash
      ls ~/trail | grep -v README | grep -v "^archive" | tail -4
      ```

2. Read all files in the topic folder:
   ```bash
   ls ~/trail/<topic-folder>/
   cat ~/trail/<topic-folder>/*.md
   ```

3. Compose the TLDR — 3–5 bullet points max. Cover:
   - What the topic is about
   - What was tried or discovered
   - Current status or outcome

   Each bullet that references a file must link to it (e.g. `[01-something.md](01-something.md)`).
   Be ruthlessly brief. No filler. Just the facts.

4. Check if `~/trail/<topic-folder>/00-tldr.md` exists:
   ```bash
   ls ~/trail/<topic-folder>/00-tldr.md 2>/dev/null
   ```

   - **Does not exist** — create it:
     ```bash
     cat > ~/trail/<topic-folder>/00-tldr.md << 'EOF'
     # TLDR

     <bullets>
     EOF
     ```

   - **Exists** — read it and check that every file in the folder is mentioned. If any file is missing, update the bullets to include it, then overwrite the file.

5. Commit:
   ```bash
   git -C ~/trail add . && git -C ~/trail commit -m "tldr: <topic-folder>"
   ```

6. Print the TLDR to the user.
