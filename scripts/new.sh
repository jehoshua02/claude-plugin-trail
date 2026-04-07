#!/bin/bash
set -e

TRAIL_DIR="$HOME/trail"

if [ -z "$1" ]; then
  echo "Usage: new.sh <topic-name>"
  exit 1
fi

# Slugify: lowercase, spaces to hyphens, strip non-alphanumeric except hyphens
SLUG=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
DATE=$(date +%Y-%m-%d)
FOLDER="$DATE-$SLUG"
TOPIC_DIR="$TRAIL_DIR/$FOLDER"

mkdir -p "$TOPIC_DIR"

cat > "$TOPIC_DIR/00-trailhead.md" <<EOF
# $1

**Date:** $DATE
**Ticket:** none
**Status:** active

## Context
<!-- why this topic exists -->
EOF

cd "$TRAIL_DIR"
git add .
git commit -m "new: $FOLDER"

echo "$TOPIC_DIR"
