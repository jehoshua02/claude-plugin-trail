---
description: Create a new trail topic. Usage: /trail:new <topic-name>
allowed-tools: Bash
---

If `$ARGUMENTS` is empty, ask the user for a topic name. Once you have it, run:

`bash "$(ls -d ~/.claude/plugins/cache/jehoshua02/claude-plugin-trail/*/scripts/new.sh | sort -V | tail -1)" "<topic-name>"`

If `$ARGUMENTS` is provided, run immediately:

`bash "$(ls -d ~/.claude/plugins/cache/jehoshua02/claude-plugin-trail/*/scripts/new.sh | sort -V | tail -1)" "$ARGUMENTS"`
