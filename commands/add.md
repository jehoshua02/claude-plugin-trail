---
description: Add a new entry to an existing trail topic. Usage: /trail:add [topic-folder]
allowed-tools: Bash
---

Gather the following information from the user before doing anything else:

1. **Topic folder** — use `$ARGUMENTS` if provided. Otherwise, list folders in `~/trail` and ask the user to pick one:
   ```bash
   ls ~/trail
   ```
2. **Entry title** — ask for a short title (will become the filename slug and heading)
3. **Content** — ask the user to share notes, findings, links, anything. Accept free-form input.

Once you have all three, organize the content into clean, concise notes suitable for a trail entry.

Determine the next sequence number by listing files in the topic folder:

```bash
ls ~/trail/<topic-folder>/
```

The files are named like `00-trailhead.md`, `01-something.md`, etc. The next entry gets the next number (zero-padded to two digits).

Then create the entry:

```bash
cat > ~/trail/<topic-folder>/<NN>-<slug>.md << 'EOF'
# <entry-title>

**Date:** <YYYY-MM-DD>

<organized content>
EOF
```

```bash
git -C ~/trail add . && git -C ~/trail commit -m "add: <topic-folder>/<NN>-<slug>"
```

Where `<slug>` is the entry title lowercased with spaces replaced by dashes and non-alphanumeric/dash characters removed, and `<NN>` is the zero-padded sequence number.

Print the path to the new entry file when done.
