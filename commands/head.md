---
description: Start a new trail topic with a trailhead. Usage: /trail:head [topic-name]
allowed-tools: Bash
---

Gather the following information from the user before doing anything else:

1. **Topic name** — use `$ARGUMENTS` if provided, otherwise ask
2. **Ticket** — ask for a ticket number or link (press enter to skip)
3. **Context** — ask the user to share whatever context they have: paste notes, describe the problem, share links, anything. Accept free-form input.

Once you have all three, organize the context into a clean, concise paragraph or short bullet points suitable for a trailhead document.

Then run:

```
python3 "$(ls -d ~/.claude/plugins/cache/jehoshua02/trail/*/scripts/new.py | sort -V | tail -1)" \
  "<topic-name>" \
  --ticket "<ticket or 'none'>" \
  --context "<organized context>"
```

Print the path to the new topic folder when done.
