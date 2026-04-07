#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys

PLUGIN_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAIL_DIR = os.path.join(os.path.expanduser("~"), "trail")


def run(cmd, cwd=None):
    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        sys.exit(result.returncode)


os.makedirs(TRAIL_DIR, exist_ok=True)

if not os.path.isdir(os.path.join(TRAIL_DIR, ".git")):
    run(["git", "init"], cwd=TRAIL_DIR)

readme = os.path.join(TRAIL_DIR, "README.md")
if not os.path.isfile(readme):
    shutil.copy(os.path.join(PLUGIN_DIR, "templates", "README.md"), readme)

run(["git", "add", "."], cwd=TRAIL_DIR)
status = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=TRAIL_DIR)
if status.returncode != 0:
    run(["git", "commit", "-m", "init trail"], cwd=TRAIL_DIR)

print(f"trail initialized at {TRAIL_DIR}")
