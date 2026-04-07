#!/usr/bin/env python3
import os
import re
import subprocess
import sys
from datetime import date

TRAIL_DIR = os.path.join(os.path.expanduser("~"), "trail")


def run(cmd, cwd=None):
    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        sys.exit(result.returncode)


if len(sys.argv) < 2 or not sys.argv[1].strip():
    print("Usage: new.py <topic-name>")
    sys.exit(1)

topic = sys.argv[1].strip()
slug = re.sub(r"[^a-z0-9-]", "", topic.lower().replace(" ", "-"))
today = date.today().strftime("%Y-%m-%d")
folder = f"{today}-{slug}"
topic_dir = os.path.join(TRAIL_DIR, folder)

os.makedirs(topic_dir, exist_ok=True)

trailhead = os.path.join(topic_dir, "00-trailhead.md")
with open(trailhead, "w") as f:
    f.write(f"# {topic}\n\n")
    f.write(f"**Date:** {today}\n")
    f.write(f"**Ticket:** none\n")
    f.write(f"**Status:** active\n\n")
    f.write(f"## Context\n")
    f.write(f"<!-- why this topic exists -->\n")

run(["git", "add", "."], cwd=TRAIL_DIR)
run(["git", "commit", "-m", f"new: {folder}"], cwd=TRAIL_DIR)

print(topic_dir)
