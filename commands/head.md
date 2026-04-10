---
description: Start a new trail topic with a trailhead. Usage: /trail:head [topic-name]
allowed-tools: Bash
---

Gather the following information from the user before doing anything else:

1. **Topic name** — use `$ARGUMENTS` if provided, otherwise ask
2. **Ticket** — ask for a ticket number or link (press enter to skip)
3. **Context** — ask the user to share whatever context they have: paste notes, describe the problem, share links, anything. Accept free-form input.

Once you have all three, organize the context into a clean, concise paragraph or short bullet points suitable for a trailhead document.

Then create the trailhead by running the following (substituting values inline — do not use shell variables):

```bash
mkdir -p ~/trail/backlog/<YYYY-MM-DD>-<slug>
```

```bash
cat > ~/trail/backlog/<YYYY-MM-DD>-<slug>/00-trailhead.md << 'EOF'
# <topic-name>

**Date:** <YYYY-MM-DD HH:MM>
**Ticket:** <ticket or 'none'>
**Status:** active

## Context
<organized context>
EOF
```

```bash
git -C ~/trail add backlog/<YYYY-MM-DD>-<slug>/ && git -C ~/trail commit -m "new: backlog/<YYYY-MM-DD>-<slug>"
```

Where `<slug>` is the topic name lowercased with spaces replaced by dashes and non-alphanumeric/dash characters removed.

Print the path to the new topic folder when done.
