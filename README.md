# claude-plugin-trail

A working log for projects, bug investigations, and ephemeral work. Organized by topic, ordered by sequence, committed to git.

## Installation

Add the jehoshua02 marketplace and install the plugin using the `/plugin` command in Claude Code:

```
/plugin add-marketplace jehoshua02
/plugin install claude-plugin-trail
```

## Commands

### trail:init

Initialize `~/trail` as a git repository.

### trail:head

Create a new topic with a trailhead. Topics are created as dated folders:

```
~/trail/2026-04-07-topic-name/
  00-trailhead.md
```
