#!/bin/bash
set -e

source "$HOME/.claude/trail.conf"
TRAIL_DIR="$HOME/trail"

mkdir -p "$TRAIL_DIR"

if [ ! -d "$TRAIL_DIR/.git" ]; then
  git -C "$TRAIL_DIR" init
fi

if [ ! -f "$TRAIL_DIR/README.md" ]; then
  cp "$PLUGIN_DIR/templates/README.md" "$TRAIL_DIR/README.md"
fi

cd "$TRAIL_DIR"
git add .
git diff --cached --quiet || git commit -m "init trail"

echo "trail initialized at $TRAIL_DIR"
