# AI Incident Command & Decision Intelligence (Vercel + Backend)

This project was converted from a Base44-generated app into a **Vercel-deployable** Vite + React frontend with a **real backend** using **Vercel Serverless Functions** and **PostgreSQL (via Prisma)**.

## What you get

### Frontend (Vite + React)
- Same UI you had (Dashboard, Incident Detail, Knowledge Base, Predictions, Governance, etc.)
- Data is now loaded from `/api/*` endpoints instead of the Base44 SDK.

### Backend (Vercel Serverless Functions)
- **Database models (Prisma/Postgres):**
  - `Incident`, `Decision`, `PredictiveAlert`, `KnowledgeBaseArticle`, `AuditLog`
  - `PostIncidentReview`, `IncidentAutomation`
- **AI + automation endpoints (OpenAI-backed, optional):**
  - `POST /api/ai/invoke-llm`
  - `POST /api/functions/automateIncidentResponse`
  - `POST /api/functions/generatePostIncidentReview`
  - `POST /api/functions/generatePredictions`
  - `POST /api/functions/suggestKnowledgeArticles`
  - `POST /api/functions/generateArticleFromIncident`
- **Authentication (optional but supported):**
  - Supabase Auth on the frontend (JWT passed to backend)
  - Backend verifies the JWT if you set `SUPABASE_JWT_SECRET`

> If you don’t set Supabase env vars, the app runs in **demo mode** (no login required).

---

## Run locally

### 1) Install deps
```bash
npm install
```

### 2) Create `.env` (server-side)
Vercel serverless functions use **server env vars** (not `VITE_`).

Create a local `.env` file at project root:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
OPENAI_API_KEY="your_openai_key"               # optional (enables AI features)
OPENAI_MODEL="gpt-4o-mini"                     # optional
SUPABASE_JWT_SECRET="your_supabase_jwt_secret" # optional (enables auth verification)
```

### 3) Prisma: generate + migrate
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4) Start dev server
```bash
npm run dev
```

---

## Deploy to Vercel

### 1) Push to GitHub
Commit the repo and push.

### 2) Add Vercel Environment Variables
In Vercel → Project → Settings → Environment Variables, add:

- `DATABASE_URL`
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional)
- `SUPABASE_JWT_SECRET` (optional, if using Supabase Auth)

### 3) Database migrations in production
Run migrations against your production database:
```bash
npx prisma migrate deploy
```

> Tip: Use Supabase Postgres, Neon, or any managed Postgres.

---

## Optional: Supabase Auth (recommended)

### Frontend env vars (`VITE_`)
Create `.env.local`:
```bash
VITE_SUPABASE_URL="https://YOURPROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="your_anon_key"
```

Then:
- Users log in via Supabase (you can add a dedicated login page if you want)
- The access token is attached to requests as `Authorization: Bearer <token>`
- Backend verifies the token if `SUPABASE_JWT_SECRET` is set

---

## Notes / Customization
- The frontend still imports `base44` from `src/api/base44Client.js`, but that file is now a **compatibility layer** that calls your `/api` backend.
- If you want stricter authorization (per-user data isolation), we can enforce `createdBy = userId` filters in the API handlers.
