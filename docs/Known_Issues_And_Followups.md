# Known Issues And Followups

## Current Known Risks

### Alpha Vantage Rate Limits

Alpha Vantage free API keys are rate limited.

Mitigation:

- Keep ticker count small during development.
- Use `ALPHA_VANTAGE_MAX_TICKERS`.
- Use `ALPHA_VANTAGE_NEWS_PER_TICKER`.
- Increase `ALPHA_VANTAGE_REQUEST_INTERVAL_SECONDS`.
- Turn off expert context fetching when needed.

### Active Flow vs Legacy Flow

The active product direction is Alpha Vantage news sentiment + analyst/company context.

Legacy SEC insider-buy scripts still exist:

- `catalystic-backend/ingestor.py`
- `catalystic-backend/signal_detector.py`

Follow-up:

- Decide whether to keep, archive, or integrate SEC insider-buy flow later.

### Financial Advice Risk

Catalystic must be positioned as a research aid.

Follow-up:

- Review frontend and README wording.
- Add disclaimers where appropriate.
- Avoid buy/sell guarantees.

### Environment Setup

Backend and frontend both require environment variables.

Current support:

- Backend placeholders live in `catalystic-backend/.env.example`.
- Frontend placeholders live in `catalystic-frontend/.env.local.example`.
- README setup instructions list the required variables.

Follow-up:

- Keep setup easy for reviewers as new environment variables are added.

### Demo Reliability

A recruiter or interviewer may not have Supabase credentials.

Follow-up:

- Add demo data mode.
- Add screenshots or GIFs.
- Add a simple hosted demo if possible.

## Candidate Future Tickets

1. Add stronger recommendation engine tests.
2. Add frontend loading/error/empty states.
3. Add frontend demo-data mode.
4. Polish README for recruiters.
5. Add screenshots to README.
6. Add architecture diagram.
7. Add Supabase migration SQL files.
8. Add GitHub Actions CI for backend tests and frontend build.
9. Add data freshness indicator to dashboard.
10. Add risk badges based on bearish/missing context.
11. Add ticker filtering/search in dashboard.
12. Add explanation panel for each recommendation score.
