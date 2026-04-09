---
description: Get a brief summary of an existing trail topic. Usage: /trail:tldr [topic-folder]
allowed-tools: Bash
---

1. **Topic folder** — resolve in this order:
   1. Use `$ARGUMENTS` if provided
   2. Otherwise, check conversation context for a topic folder set by a previous `/trail:head`, `/trail:add`, or `/trail:select` in this session
   3. Otherwise, run `/trail:select` and use the selected topic folder

2. **Freshness check** — compare `00-tldr.md` modification time against the newest trail entry:
   ```bash
   tldr_mod=$(stat -f %m ~/trail/<topic-folder>/00-tldr.md 2>/dev/null || echo 0)
   latest_entry=$(ls -t ~/trail/<topic-folder>/*.md | grep -v 00-tldr | grep -v 00-trailhead | head -1)
   latest_mod=$(stat -f %m "$latest_entry" 2>/dev/null || echo 0)
   echo "tldr=$tldr_mod latest=$latest_mod"
   ```

   If `00-tldr.md` exists AND `tldr_mod >= latest_mod` (fresh), read and print `00-tldr.md` — skip to step 8.

   Otherwise (stale or missing), continue to step 3.

3. Read all files in the topic folder:
   ```bash
   ls ~/trail/<topic-folder>/
   cat ~/trail/<topic-folder>/*.md
   ```

4. Compose the TLDR using this fixed structure:

   - **What** — one-liner: what is this trail about
   - **Status** — one of: `active`, `blocked`, `waiting`, `done`
   - **Key Points** — 2–5 bullets covering findings, decisions, or outcomes. Each bullet that references a file must link to it (e.g. `[01-something.md](01-something.md)`). Be ruthlessly brief. No filler. Just the facts.
   - **Next Step** — the single next action to take (or "none" if done)

5. **Score the trail on 6 priority factors (1–5)** — based on the trailhead, entries, and tldr bullets, assess:

   **Numerator factors (higher = more priority):**
   - **Value (1–5):** What impact does this deliver?
     - 1 = Cosmetic tweak, minor wording fix, internal-only cleanup nobody asked for
     - 2 = Small quality-of-life improvement, fixing a rare edge case, updating stale docs
     - 3 = Meaningful feature or fix that a team or user segment will notice and use
     - 4 = Key deliverable on a roadmap, fixes a pain point affecting many users daily
     - 5 = Revenue-critical launch, security vulnerability fix, or top executive priority
   - **Blocking (1–5):** Does this block other work or people?
     - 1 = Fully standalone, nobody waiting on this
     - 2 = One person could use this eventually but has workarounds
     - 3 = A couple of downstream tasks or teammates are waiting on this to proceed
     - 4 = A team is blocked, or a release train can't move without this
     - 5 = Multiple teams stalled, a launch date slipping, or an incident ongoing until resolved
   - **Urgency (1–5):** Time pressure?
     - 1 = Backlog item with no deadline, do whenever
     - 2 = Soft goal for this quarter, no hard date
     - 3 = Committed to a sprint or iteration, expected within 1–2 weeks
     - 4 = External deadline approaching within days, demo or release date set
     - 5 = Due today/tomorrow, SLA at risk, or production on fire right now
   - **Momentum (1–5):** How far along?
     - 1 = Just an idea or trailhead, no real investigation yet
     - 2 = Some research done, problem is understood but no solution started
     - 3 = Solution designed, partially implemented, or PR in progress
     - 4 = Most of the work done, in review or final testing
     - 5 = Essentially complete, just needs merge/deploy/one last step

   **Denominator factors (higher = less priority):**
   - **Effort (1–5):** How much work remains?
     - 1 = One-liner fix or config change, done in minutes
     - 2 = A focused task, a few hours of work, one file or module
     - 3 = A day or two of work, touches several files or requires coordination
     - 4 = Multi-day effort, spans multiple systems or requires new infrastructure
     - 5 = Week-plus project, major refactor, or requires learning an unfamiliar domain
   - **Risk (1–5):** How dangerous?
     - 1 = Isolated change, easy to test, easy to revert, no shared state
     - 2 = Touches one system with good test coverage, low blast radius
     - 3 = Crosses service boundaries or changes a contract, needs careful testing
     - 4 = Touches auth, payments, data migration, or shared infrastructure with limited rollback
     - 5 = Could cause data loss, security breach, or extended outage if wrong; hard to prove correct

   For each factor, write a brief one-sentence justification for the score.

6. Check if `~/trail/<topic-folder>/00-tldr.md` exists:
   ```bash
   ls ~/trail/<topic-folder>/00-tldr.md 2>/dev/null
   ```

   - **Does not exist** — create it:
     ```bash
     cat > ~/trail/<topic-folder>/00-tldr.md << 'EOF'
     # TLDR: <topic-folder>

     ## What
     <one-liner>

     ## Status
     <active | blocked | waiting | done>

     ## Key Points
     - <finding, decision, or outcome — link to source file>
     - ...

     ## Next Step
     <the single next action to take>

     ## Priority Factors

     | Factor | Score | Reasoning |
     |--------|-------|-----------|
     | Value | X | <why> |
     | Blocking | X | <why> |
     | Urgency | X | <why> |
     | Momentum | X | <why> |
     | Effort | X | <why> |
     | Risk | X | <why> |
     EOF
     ```

   - **Exists** — read it and check that every file in the folder is mentioned. If any file is missing, update the bullets to include it. Always re-score the priority factors based on current trail content, then overwrite the file.

7. Commit:
   ```bash
   git -C ~/trail add <topic-folder>/00-tldr.md && git -C ~/trail commit -m "tldr: <topic-folder>"
   ```

8. Print the TLDR to the user.
