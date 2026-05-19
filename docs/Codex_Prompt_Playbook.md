# Codex Prompt Playbook

## Standard CLI Start

From repo root:

```bash
git status
git checkout main
git pull
git checkout -b feature/t0001-codex-manager-docs
codex
```

## Inspect-First Prompt

Use this inside Codex CLI before implementation:

```text
We are working on the Catalystic repository.

You are running locally through Codex CLI.

Before coding, inspect the repository but do not edit files yet.

Read:
- AGENTS.md, if present
- README.md
- docs/Repo_Current_State.md, if present
- docs/Tickets.md, if present

Ticket:
T0001 — Add Codex Manager Docs And Environment Examples

Goal:
Add repo management documentation and safe environment example files so future Codex CLI sessions have stable context and guardrails.

Allowed areas:
- AGENTS.md
- docs/
- catalystic-backend/.env.example
- catalystic-frontend/.env.local.example
- README.md only if adding a small link to docs

Do not touch:
- Backend implementation files
- Frontend implementation files
- Supabase schema logic
- Real .env or .env.local files
- Package/dependency files unless absolutely necessary

Tell me:
1. Files you plan to create or modify
2. Why each file is needed
3. Commands you plan to run
4. Risks or assumptions

Do not modify files until I approve.
```

## Implementation Approval Prompt

After Codex gives a good plan:

```text
Approved. Implement T0001 only.

Use the exact scope described above.

After implementation, provide:
1. Summary of changes
2. Files changed
3. Commands run
4. Build/test results
5. Manual verification steps
6. Risks or assumptions
7. Follow-up tickets
8. Docs that should be updated
```

## Review Prompt To Paste Back Into ChatGPT

After Codex finishes, paste this to ChatGPT:

```text
Review this Codex output according to our Codex manager workflow.

Ticket:
[paste ticket]

Codex completion report:
[paste report]

git diff --stat:
[paste output]

Important diffs or files:
[paste key sections]

Questions:
1. Did Codex follow the ticket scope?
2. Did it over-engineer anything?
3. Are there risks before I commit?
4. What manual checks should I run?
5. What should the next ticket be?
```
