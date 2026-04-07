#!/bin/bash
# Install claude-plugin-trail commands by symlinking into ~/.claude/commands/trail/

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/commands/trail"
TARGET_DIR="$HOME/.claude/commands/trail"

mkdir -p "$TARGET_DIR"

for file in "$SOURCE_DIR"/*.md; do
  name="$(basename "$file")"
  target="$TARGET_DIR/$name"

  if [ -L "$target" ]; then
    rm "$target"
  elif [ -e "$target" ]; then
    echo "Warning: $target exists and is not a symlink, skipping"
    continue
  fi

  ln -s "$file" "$target"
  echo "Linked $name"
done

echo "PLUGIN_DIR=$SCRIPT_DIR" > "$HOME/.claude/trail.conf"
echo "Wrote $HOME/.claude/trail.conf"

echo "Done. Commands available as /trail:init and /trail:new in Claude Code."
