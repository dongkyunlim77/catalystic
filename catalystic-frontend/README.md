# Catalystic Frontend

Next.js dashboard for Catalystic market recommendations.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

The dashboard reads the required `signals` table and optionally uses `market_news` and `expert_notes` if they exist.

## Validate

```bash
npm run lint
npm run build
```
