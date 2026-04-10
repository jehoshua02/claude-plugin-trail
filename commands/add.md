---
description: Add a new entry to an existing trail topic. Usage: /trail:add [topic-folder]
allowed-tools: Bash
---

Gather the following information from the user before doing anything else:

1. **Topic folder** — resolve in this order:
   1. Use `$ARGUMENTS` if provided
   2. Otherwise, check conversation context for a topic folder set by a previous `/trail:head` or `/trail:select` in this session
   3. Otherwise, run `/trail:select` and use the selected topic folder
2. **Entry title** — ask for a short title (will become the filename slug and heading)
3. **Content** — ask the user to share notes, findings, links, anything. Accept free-form input.

Once you have all three, organize the content into clean, concise notes suitable for a trail entry.

**Locate the trail** — the topic folder may be a bare name or a prefixed path (e.g. `backlog/<folder>` or `active/<folder>`). If bare, search for it:
```bash
[ -d ~/trail/active/<folder> ] && echo "active/<folder>"
[ -d ~/trail/backlog/<folder> ] && echo "backlog/<folder>"
[ -d ~/trail/<folder> ] && echo "<folder>"
[ -d ~/trail/archive/<folder> ] && echo "archive/<folder>"
```
Use the first match as `<trail-path>`.

Determine the next sequence number by listing files in the topic folder:

```bash
ls ~/trail/<trail-path>/
```

The files are named like `00-trailhead.md`, `01-something.md`, etc. The next entry gets the next number (zero-padded to two digits).

Then create the entry:

```bash
cat > ~/trail/<trail-path>/<NN>-<slug>.md << 'EOF'
# <entry-title>

**Date:** <YYYY-MM-DD HH:MM>

<organized content>
EOF
```

```bash
git -C ~/trail add <trail-path>/<NN>-<slug>.md && git -C ~/trail commit -m "add: <trail-path>/<NN>-<slug>"
```

Where `<slug>` is the entry title lowercased with spaces replaced by dashes and non-alphanumeric/dash characters removed, and `<NN>` is the zero-padded sequence number.

Print the path to the new entry file when done.
