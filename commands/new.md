---
description: Create a new trail topic. Usage: /trail:new <topic-name>
allowed-tools: Bash
---

If `$ARGUMENTS` is empty, ask the user for a topic name. Once you have it, run:

`python3 "$(ls -d ~/.claude/plugins/cache/jehoshua02/trail/*/scripts/new.py | sort -V | tail -1)" "<topic-name>"`

If `$ARGUMENTS` is provided, run immediately:

`python3 "$(ls -d ~/.claude/plugins/cache/jehoshua02/trail/*/scripts/new.py | sort -V | tail -1)" "$ARGUMENTS"`
