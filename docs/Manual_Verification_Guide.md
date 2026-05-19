# Manual Verification Guide

## Purpose

This guide explains how to manually verify Catalystic after Codex changes.

Use this after every ticket before committing.

## General Git Checks

From repo root:

```bash
git status
git diff --stat
git diff
```

Confirm:

- Only expected files changed.
- No real secrets were added.
- No unrelated refactors happened.
- No generated build files were committed.

## Backend Setup Verification

From repo root:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r catalystic-backend/requirements.txt
```

## Backend Tests

```bash
python -m unittest discover catalystic-backend/tests
```

Expected:

- Tests pass.
- No network calls should be required for unit tests unless already designed that way.

## Backend Runtime Verification

Only run this when local `.env` is configured:

```bash
source venv/bin/activate
python catalystic-backend/alpha_vantage_ingestor.py
```

Check:

- No API keys are printed.
- Alpha Vantage rate-limit errors are handled clearly.
- Supabase write errors are handled clearly.
- Stored rows match expected tables.

## Frontend Setup Verification

```bash
cd catalystic-frontend
npm install
```

## Frontend Lint And Build

```bash
cd catalystic-frontend
npm run lint
npm run build
```

Expected:

- Lint passes.
- Build passes.
- No TypeScript errors.

## Frontend Runtime Verification

```bash
cd catalystic-frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

Check:

- Page loads.
- No browser console errors.
- Dashboard data appears if Supabase is configured.
- Empty/loading/error states are understandable.
- Product language does not imply guaranteed returns.

## Financial Product Language Check

Avoid phrases like:

- "This stock will go up"
- "Guaranteed return"
- "Best stock to buy"
- "Buy now"
- "Risk-free"
- "Automated financial advice"

Prefer phrases like:

- "Research signal"
- "Recommendation candidate"
- "Evidence suggests"
- "Requires further research"
- "Potential risk"
- "Not financial advice"

## Before Commit Checklist

- [ ] Ticket scope followed
- [ ] `git diff --stat` reviewed
- [ ] Backend tests run if backend changed
- [ ] Frontend lint/build run if frontend changed
- [ ] No secrets committed
- [ ] Docs updated if behavior changed
- [ ] Follow-up issues noted
