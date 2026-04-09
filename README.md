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

### trail:select

Select and resume an existing topic. Shows all active trail folders, reads all files in the chosen topic, and summarizes what has been done so far. Other commands (`add`, `tldr`, `archive`) automatically invoke `select` when no topic is specified.

### trail:daily

Generate a daily summary of all trails touched today (active and archived). Formats output as Slack-friendly text and copies to clipboard via `pbcopy`.

### trail:tldr

Get a brief summary of an existing topic. Outputs 3–5 bullet points covering what it was, what was found, and current status.

### trail:prioritize

Analyze all active trails and generate a priority report. Scores each trail on six factors — Value, Blocking, Urgency, Momentum, Effort, and Risk — using the formula `Priority = (Value + Blocking + Urgency + Momentum) / (Effort + Risk)`. Saves a ranked report to `~/trail/priority-report.md` with scores, reasoning, and summaries.
