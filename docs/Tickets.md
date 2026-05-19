# Catalystic Codex Tickets

## Ticket Rules

Each ticket should be implemented on its own branch.

Branch naming format:

```text
feature/t0001-short-name
```

Codex should implement one ticket only, then stop and provide a completion report.

---

# T0001 — Add Codex Manager Docs And Environment Examples

## Goal

Add repo management documentation and safe environment example files so future Codex CLI sessions have stable context and guardrails.

## Branch

```text
feature/t0001-codex-manager-docs
```

## Allowed Areas

- `AGENTS.md`
- `docs/`
- `catalystic-backend/.env.example`
- `catalystic-frontend/.env.local.example`
- `README.md` only if adding a small link to docs

## Do Not Touch

- Backend implementation files
- Frontend implementation files
- Supabase schema logic
- Real `.env` or `.env.local` files
- Package/dependency files unless absolutely necessary

## Requirements

1. Add `AGENTS.md` at the repo root.
2. Add docs:
   - `docs/Product_Overview.md`
   - `docs/MVP_Technical_Design.md`
   - `docs/Repo_Current_State.md`
   - `docs/Tickets.md`
   - `docs/Manual_Verification_Guide.md`
   - `docs/Known_Issues_And_Followups.md`
   - `docs/Codex_Prompt_Playbook.md`
3. Add backend environment example:
   - `catalystic-backend/.env.example`
4. Add frontend environment example:
   - `catalystic-frontend/.env.local.example`
5. Do not include real API keys.
6. Keep docs consistent with existing README.
7. Add a small README section pointing to the new docs if appropriate.

## Acceptance Criteria

- New docs exist.
- Example env files exist and contain placeholder values only.
- Existing tests/build behavior is unchanged.
- No real secrets are committed.
- `git diff` only shows documentation and env example changes.

## Manual Verification

```bash
git status
git diff --stat
grep -R "your_" catalystic-backend/.env.example catalystic-frontend/.env.local.example
```

Also manually confirm no real secret values were added.

---

# T0002 — Improve Recommendation Engine Tests

## Goal

Add or strengthen backend tests for recommendation scoring edge cases.

## Branch

```text
feature/t0002-recommendation-tests
```

## Allowed Areas

- `catalystic-backend/tests/`
- `catalystic-backend/recommendation_engine.py` only if a bug is found and the fix is small

## Do Not Touch

- Frontend files
- Alpha Vantage ingestion logic unless required by tests
- Database schema
- Environment files

## Requirements

Add tests covering:

1. Positive sentiment increases score.
2. Negative sentiment is surfaced as risk or lowers score.
3. Bullish expert context adds support.
4. Bearish expert context adds risk.
5. Missing context does not crash the engine.
6. Older signals score lower than recent signals if recency is part of current logic.

## Acceptance Criteria

```bash
python -m unittest discover catalystic-backend/tests
```

passes.

## Manual Verification

Review test names and confirm each test describes a product-relevant behavior.

---

# T0003 — Add Frontend Empty, Loading, And Error States

## Goal

Improve dashboard reliability by making the frontend handle empty Supabase results, loading state, and failed reads clearly.

## Branch

```text
feature/t0003-dashboard-states
```

## Allowed Areas

- `catalystic-frontend/`

## Do Not Touch

- Backend files
- Database schema
- Environment files
- Dependencies unless already present and necessary

## Requirements

1. Show a clear loading state while data is being fetched.
2. Show a clear empty state when no signals exist.
3. Show a clear error state when Supabase reads fail.
4. Keep the UI professional and simple.
5. Avoid financial-advice wording.

## Acceptance Criteria

```bash
cd catalystic-frontend
npm run lint
npm run build
```

passes.

## Manual Verification

Run:

```bash
cd catalystic-frontend
npm run dev
```

Open `http://localhost:3000` and verify dashboard behavior.

---

# T0004 — Add Demo Data Mode For Frontend

## Goal

Allow the frontend to show a realistic demo state without requiring live Supabase data.

## Branch

```text
feature/t0004-demo-data-mode
```

## Allowed Areas

- `catalystic-frontend/`

## Do Not Touch

- Backend files
- Database schema
- Real `.env.local`

## Requirements

1. Add a safe demo-data mode controlled by an environment variable.
2. Use realistic but clearly fake sample signals, market news, and expert notes.
3. Make it obvious in the UI when demo data is being shown.
4. Do not make claims of real investment performance.

Potential env variable:

```text
NEXT_PUBLIC_USE_DEMO_DATA=true
```

## Acceptance Criteria

```bash
cd catalystic-frontend
npm run lint
npm run build
```

passes.

## Manual Verification

Create local `.env.local` value:

```text
NEXT_PUBLIC_USE_DEMO_DATA=true
```

Run dev server and confirm demo dashboard works without Supabase data.

---

# T0005 — Improve README For Recruiter Demo

## Goal

Make the README more polished for recruiters and interviewers.

## Branch

```text
feature/t0005-readme-demo-polish
```

## Allowed Areas

- `README.md`
- `docs/`

## Do Not Touch

- Backend code
- Frontend code
- Package files

## Requirements

1. Add a concise "Why This Project Matters" section.
2. Add a "Technical Highlights" section.
3. Add a "Demo Flow" section.
4. Clarify that the product is a research aid, not financial advice.
5. Mention active Alpha Vantage flow vs legacy SEC flow clearly.
6. Keep it human and resume-friendly.

## Acceptance Criteria

- README is clear to a recruiter within 60 seconds.
- Setup commands remain accurate.
- No exaggerated investment claims.
