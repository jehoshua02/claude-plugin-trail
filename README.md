# claude-plugin-trail

A working log for projects, bug investigations, and ephemeral work. Organized by topic, ordered by sequence, committed to git.

## Installation

Add the jehoshua02 marketplace and install the plugin using the `/plugin` command in Claude Code:

```
/plugin add-marketplace jehoshua02
/plugin install trail
```

## Commands

### trail:init

Initialize `~/trail` as a git repository.

### trail:head

Start a new topic. Interactively collects topic name, ticket, and context, then creates a dated folder with a trailhead:

```
~/trail/2026-04-07-topic-name/
  00-trailhead.md
```

### trail:add

Add a new entry to an existing topic. Interactively collects topic, entry title, and content, then creates a new numbered file:

```
~/trail/2026-04-07-topic-name/
  00-trailhead.md
  01-entry-title.md
```

### trail:resume

Resume an existing topic. Reads all files in the topic folder and summarizes what has been done so far, then prompts to continue.

### trail:tldr

Get a brief summary of an existing topic. Outputs 3–5 bullet points covering what it was, what was found, and current status.
