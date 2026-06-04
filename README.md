# Marvels Assemble ⚡

College ambassador onboarding platform — Next.js 16 + Supabase + Gemini AI.

## Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: JWT in httpOnly cookies (bcrypt passwords)
- **AI scoring**: Gemini 2.0 Flash (swap to Claude via `AI_PROVIDER=claude`)
- **Reel verification**: Apify Instagram scraper
- **Quiz verification**: Google Sheets API
- **Styling**: Tailwind CSS + shadcn/ui (Figma-swap ready)
- **Hosting**: Vercel (free hobby plan)

## Quick start

### 1. Clone and install
```bash
git clone <your-repo>
cd marvels-assemble
npm install
```

### 2. Set up Supabase
1. Go to supabase.com → New project
2. Settings → Database → copy the connection string
3. Paste into `.env.local` as `DATABASE_URL` and `DIRECT_URL`

### 3. Set up Gemini (free)
1. Go to aistudio.google.com
2. Create API key
3. Add to `.env.local` as `GEMINI_API_KEY`

### 4. Push database schema
```bash
npx prisma db push
```

### 5. Create admin user
```bash
npm run dev
# Then POST to http://localhost:3000/api/admin/seed
curl -X POST http://localhost:3000/api/admin/seed
# Login: admin@marvels.com / admin123!
```

### 6. Run
```bash
npm run dev
```

## Switching AI provider
Change one env var — no code changes needed:
```env
AI_PROVIDER=gemini   # default, free
AI_PROVIDER=claude   # needs ANTHROPIC_API_KEY
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo at vercel.com
3. Add all env vars from `.env.example` in Vercel dashboard
4. Deploy → done ✅

## Figma design swap
When designs are ready:
- Components live in `src/app/` pages — each page is self-contained
- Use **v0.dev** (paste Figma frame → get Tailwind code) or **Cursor + Figma MCP**
- Replace page UI — API routes in `src/app/api/` never need to change
- All business logic is in `src/lib/` — fully separate from UI

## Project structure
```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── login/page.tsx        # Login
│   ├── signup/page.tsx       # Signup
│   ├── onboarding/page.tsx   # Video upload + AI scoring
│   ├── dashboard/page.tsx    # Marvel activity dashboard
│   ├── admin/page.tsx        # Admin dashboard
│   └── api/
│       ├── auth/             # login, signup, logout, me
│       ├── onboarding/       # upload + score, status
│       ├── submissions/      # create + list
│       └── admin/            # marvels list, approve submissions, seed
├── lib/
│   ├── ai.ts                 # Gemini/Claude scoring (swap via env)
│   ├── auth.ts               # JWT, bcrypt, session
│   ├── prisma.ts             # DB client
│   ├── verifiers.ts          # Apify reel + Sheets quiz checkers
│   └── utils.ts              # helpers
├── middleware.ts              # Route protection
prisma/
└── schema.prisma             # DB schema — all models
```

## Activity auto-approval logic
| Activity | Verifier | Criteria |
|---|---|---|
| Reel | Apify scraper | views ≥ 300, like ratio ≥ 2% |
| Community (Quora/Reddit) | URL check | link provided = auto-approved |
| Quiz | Google Sheets API | module code found in sheet |
| Referral | DB lookup | email matches registered user |
| Others | Manual | Admin reviews in dashboard |
