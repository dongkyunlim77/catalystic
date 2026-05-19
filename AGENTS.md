# AGENTS.md

## Role

You are the implementation agent for the Catalystic repository.

ChatGPT is being used as the project manager, product planner, architecture reviewer, and code reviewer.
Codex CLI should act as a scoped implementation worker.

Your job is to implement exactly one assigned ticket at a time.

## Project Summary

Catalystic is a market intelligence dashboard that turns market news sentiment, analyst context, and market activity into transparent stock research recommendations.

The project is evidence-first. Recommendations should be explainable from stored signals, market news, and expert/analyst context. This project is a research aid, not financial advice.

## Current Architecture

Repository structure:

- `catalystic-backend/`
  - Python backend scripts
  - Alpha Vantage ingestion
  - Supabase writes
  - Recommendation engine
  - Backend tests
  - Legacy SEC insider-buy scripts

- `catalystic-frontend/`
  - Next.js frontend
  - React
  - TypeScript
  - Tailwind CSS
  - Supabase client reads

- Root `README.md`
  - Project overview
  - Setup instructions
  - Database schema
  - Running/testing commands

Active data flow:

```text
Alpha Vantage NEWS_SENTIMENT + OVERVIEW
    -> catalystic-backend/alpha_vantage_ingestor.py
    -> Supabase market_news + expert_notes tables
    -> Supabase signals table
    -> catalystic-backend/recommendation_engine.py
    -> catalystic-frontend dashboard
```

Legacy flow:

```text
SEC scripts
    -> catalystic-backend/ingestor.py
    -> catalystic-backend/signal_detector.py
```

Treat the Alpha Vantage + Supabase + frontend dashboard flow as the current primary product direction unless a ticket explicitly asks to work on the legacy SEC flow.

## Hard Rules

- Implement one ticket only.
- Do not implement future-ticket features.
- Do not refactor unrelated systems.
- Do not rename files, folders, functions, database tables, or public APIs unless the ticket explicitly requires it.
- Do not change project architecture unless the ticket explicitly requires it.
- Do not introduce new dependencies unless the ticket explicitly allows it.
- Do not edit `.env`, `.env.local`, secrets, credentials, API keys, or local machine configuration.
- Do not commit generated build artifacts.
- Do not remove legacy SEC scripts unless a ticket explicitly says to archive or delete them.
- Do not make investment claims or financial-advice language stronger than the existing product positioning.
- Keep changes small, focused, and reviewable.
- Prefer readable, boring code over clever abstractions.

## Before Editing

Before making changes, inspect:

- `README.md`
- `docs/Repo_Current_State.md`, if present
- `docs/Tickets.md`, if present
- The files directly related to the assigned ticket

Then provide a brief plan:

1. Files you expect to change
2. Why those files need to change
3. Commands you expect to run
4. Risks or assumptions

Do not make edits until the user approves if the prompt says "inspect first."

## Backend Rules

Backend code lives under `catalystic-backend/`.

- Use Python.
- Preserve existing script-based workflow unless the ticket explicitly introduces an API server.
- Use environment variables for external keys and Supabase credentials.
- Do not hardcode API keys or Supabase credentials.
- Handle Alpha Vantage rate-limit and missing-data cases gracefully.
- Keep recommendation logic transparent and easy to explain.
- Add or update tests when changing recommendation scoring or parsing behavior.

Preferred backend validation:

```bash
python -m unittest discover catalystic-backend/tests
```

## Frontend Rules

Frontend code lives under `catalystic-frontend/`.

- Use Next.js, React, TypeScript, and Tailwind CSS.
- Do not expose private Supabase service keys in frontend code.
- Only use public `NEXT_PUBLIC_*` variables on the frontend.
- Keep UI focused on evidence, transparency, and risk context.
- Avoid making the product look like automated financial advice.
- Keep components simple unless the ticket asks for a larger refactor.

Preferred frontend validation:

```bash
cd catalystic-frontend
npm run lint
npm run build
```

## Database Rules

Current important tables:

- `signals`
- `market_news`
- `expert_notes`
- `form4_filings` for legacy SEC flow

Do not change table schemas unless the assigned ticket explicitly asks for schema work.

If schema work is needed, provide SQL migration instructions separately and clearly explain whether the frontend/backend need matching changes.

## Completion Report Required

After implementation, always report:

1. Summary of changes
2. Files changed
3. Commands run
4. Build/test results
5. Manual verification steps
6. Risks or assumptions
7. Follow-up tickets
8. Docs that should be updated

## Session And Exit Behavior

- Use one Codex CLI session per ticket.
- For the same unfinished ticket, continue the existing Codex session when possible.
- If the user exits accidentally or needs to return to the same ticket, they should use:

```bash
codex resume --last
```

- Use `codex resume` to pick from recent sessions.
- Use `codex resume --all` only when the needed session may not belong to the current working directory.
- Use a fresh `codex` session for each new ticket to reduce context drift.
- At the end of every ticket, provide a concise completion report before the user exits.
- The completion report must include:
  1. Summary of changes
  2. Files changed
  3. Commands run
  4. Build/test results
  5. Manual verification steps
  6. Risks or assumptions
  7. Follow-up tickets
  8. Docs that should be updated
- Do not rely only on chat/session memory. Durable project memory should live in:
  - `AGENTS.md`
  - `docs/Repo_Current_State.md`
  - `docs/Tickets.md`
  - Git commits / PRs

## Git Safety

The user should work on a branch per ticket.

Do not assume changes are committed.
Do not run destructive Git commands.
Do not force push.
Do not reset the branch unless explicitly asked.
