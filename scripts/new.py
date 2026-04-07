#!/usr/bin/env python3
"""
Usage: new.py <topic> [--ticket <ticket>] [--context <context>]
"""
import argparse
import os
import subprocess
import sys
from datetime import date

TRAIL_DIR = os.path.join(os.path.expanduser("~"), "trail")


def run(cmd, cwd=None):
    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        sys.exit(result.returncode)


parser = argparse.ArgumentParser()
parser.add_argument("topic")
parser.add_argument("--ticket", default="none")
parser.add_argument("--context", default="<!-- why this topic exists -->")
args = parser.parse_args()

import re
slug = re.sub(r"[^a-z0-9-]", "", args.topic.lower().replace(" ", "-"))
today = date.today().strftime("%Y-%m-%d")
folder = f"{today}-{slug}"
topic_dir = os.path.join(TRAIL_DIR, folder)

os.makedirs(topic_dir, exist_ok=True)

with open(os.path.join(topic_dir, "00-trailhead.md"), "w") as f:
    f.write(f"# {args.topic}\n\n")
    f.write(f"**Date:** {today}\n")
    f.write(f"**Ticket:** {args.ticket}\n")
    f.write(f"**Status:** active\n\n")
    f.write(f"## Context\n")
    f.write(f"{args.context}\n")

run(["git", "add", "."], cwd=TRAIL_DIR)
run(["git", "commit", "-m", f"new: {folder}"], cwd=TRAIL_DIR)

print(topic_dir)
