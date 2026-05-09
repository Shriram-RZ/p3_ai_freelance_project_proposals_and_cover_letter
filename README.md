# Lumen — AI Freelance Proposal & Cover Letter Assistant

A production-ready AI SaaS that helps freelancers, developers, designers, and job
seekers generate winning proposals, cover letters, and outreach. Built with
Next.js 15, PostgreSQL/Prisma, custom JWT auth, and the Gemini Flash API.

> Win more freelance clients with AI. Generate high-converting proposals and
> personalized cover letters in seconds.

---

## ✨ Features

- **AI Proposal Generator** — analyzes the brief, matches your skills, writes a
  tailored proposal across 7 platforms (Upwork, Fiverr, LinkedIn, Freelancer,
  cold email, agency pitch, general).
- **Cover Letter Writer** — ATS-friendly, mirrors job-post keywords without
  sounding robotic.
- **Brief Analyzer** — categorizes the project, surfaces pain points, red flags,
  and suggests the right tone.
- **Conversion Scoring** — every proposal gets graded 0–100 across relevance,
  specificity, voice, conversion, length — with actionable fixes.
- **Pricing & Timeline AI** — fixed-price, hourly range, total hours, calendar
  days, with rationale and risks.
- **Streaming Chat Copilot** — token-by-token streaming via Gemini SSE, markdown
  rendering, persistent sessions.
- **Tone Presets** — 8 voices: professional, friendly, premium, confident,
  technical, persuasive, concise, startup.
- **Inline Rewrite Quick-actions** — shorter, more premium, more technical,
  punchier opener, stronger CTA, ATS keywords.
- **Templates Library** — curated proposals/cover-letters/outreach/follow-ups
  + your own custom templates.
- **Saved Jobs Pipeline** — Kanban-style: new → applied → interviewing → won/lost.
- **Analytics** — generation activity, win rate, by-platform & by-tone breakdowns.
- **PDF Export** — clean, ATS-safe layouts.
- **Custom JWT Authentication** — email/password, bcrypt, HTTP-only cookies,
  password-reset tokens, middleware-protected routes.

---

## 🏗 Architecture

```
src/
├── app/
│   ├── (auth)/            # login / signup / forgot / reset
│   ├── api/
│   │   ├── auth/          # signup, login, logout, me, forgot, reset
│   │   ├── ai/            # generate, rewrite, score, pricing, analyze
│   │   ├── chat/          # streaming SSE chat + sessions CRUD
│   │   ├── proposals/     # list / [id] CRUD
│   │   ├── cover-letters/ # list / [id] CRUD
│   │   ├── saved-jobs/    # CRUD + status updates
│   │   ├── templates/     # list / create
│   │   └── analytics/     # aggregate counts + 14-day series
│   ├── dashboard/         # full dashboard surface
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── page.tsx           # marketing landing
├── components/
│   ├── ui/                # shadcn-style primitives
│   ├── landing/           # Hero, Features, Demo, Pricing, FAQ…
│   └── dashboard/         # Sidebar, Topbar, Generators, Chat, Stats
├── lib/
│   ├── auth.ts            # bcrypt + jose JWT + cookie helpers
│   ├── prisma.ts          # singleton Prisma client
│   ├── gemini.ts          # Gemini REST + SSE streaming + JSON mode
│   ├── prompts.ts         # the entire prompt library
│   ├── api.ts             # zod-typed body parsing + standardized responses
│   ├── pdf.ts             # jsPDF export utility
│   └── utils.ts
└── middleware.ts          # JWT-aware route protection
```

The architecture deliberately uses **Next.js API routes instead of a separate
Express server** — same Node.js runtime, single deploy target, less to wire up.
Every API route returns `{ ok, data | error }` for predictable client code.

---

## 🚀 Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_freelance"
JWT_SECRET="run: openssl rand -base64 48"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY="your_key_from_aistudio.google.com/apikey"
GEMINI_MODEL="gemini-flash-latest"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database

```bash
npm run db:push       # apply schema
npm run db:seed       # seed curated templates (optional)
npm run db:studio     # open Prisma Studio
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔐 Authentication

100% custom. No Clerk, Firebase, Auth.js, or OAuth.

- `bcryptjs` (12 rounds) for password hashing.
- `jose` HS256 JWT, signed with `JWT_SECRET`.
- HTTP-only, `SameSite=Lax`, secure-in-prod cookies.
- `src/middleware.ts` protects `/dashboard/*` and bounces signed-in users away
  from auth pages.
- Password reset uses cryptographically random tokens, SHA-256 hashed at rest,
  30-min expiry, single-use. In dev mode the reset link is returned in the
  response so you can demo the flow without an email provider; in prod, hook up
  Resend/Postmark.

---

## 🤖 Gemini integration

`src/lib/gemini.ts` is a single-file client with:

- `geminiGenerate(prompt, opts)` — one-shot text.
- `geminiJSON<T>(prompt, opts)` — strict JSON-mode with parse fallback.
- `geminiStream(prompt, opts)` — SSE streaming → returns a `ReadableStream`
  ready to pipe to a client. Used by `/api/chat`.
- Built-in retries on 429 / 5xx with exponential backoff.
- `asChat([...])` helper to convert chat messages into Gemini's `Content[]`
  format.

All prompts live in `src/lib/prompts.ts` so you can tune voice in one place.
Prompts hard-block AI clichés ("leverage", "in today's fast-paced world", etc.)
to keep output sounding human.

---

## 📦 Tech stack

| Layer        | Tech                                                          |
|--------------|---------------------------------------------------------------|
| Framework    | Next.js 15 (App Router, RSC, Server Actions)                  |
| Language     | TypeScript 5                                                  |
| Styling      | Tailwind CSS 3 + custom CSS variables                         |
| UI           | Radix UI primitives, shadcn-style components, Framer Motion   |
| Icons        | Lucide                                                        |
| Database     | PostgreSQL                                                    |
| ORM          | Prisma 5                                                      |
| Auth         | bcryptjs + jose JWT (custom)                                  |
| Validation   | zod                                                           |
| AI           | Gemini Flash REST + SSE                                       |
| Markdown     | react-markdown + remark-gfm                                   |
| PDF          | jsPDF                                                         |
| Toasts       | sonner                                                        |

---

## 🌐 Deployment

### Vercel (recommended)

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add the env vars from `.env.example` in the project settings.
4. Use a managed Postgres (Neon, Supabase, Vercel Postgres, Railway).
5. After first deploy, run `npx prisma db push` against your prod URL once.

### Docker / Railway / Render

The app is a standard Next.js 15 server. `npm run build` produces a production
bundle; `npm start` runs it on port 3000. Run `prisma generate` (already in the
build script) and `prisma db push` against your database.

---

## 🧪 Manual smoke test (after install)

1. Sign up at `/signup`.
2. Open `/dashboard/proposals/new`, paste a brief, hit Generate.
3. Click "Score this", then run "Suggest pricing & timeline".
4. Open `/dashboard/chat` and type "make my last proposal more premium".
5. Save, export to PDF.
6. Visit `/dashboard/analytics` — counts and sparkline should populate.

---

## 📁 Project layout cheatsheet

- **Add a new AI feature** → create a route under `src/app/api/ai/<name>/route.ts`,
  add a prompt to `src/lib/prompts.ts`, call it from the relevant component.
- **Add a new dashboard page** → drop a folder under `src/app/dashboard/`, the
  layout (sidebar + topbar) wraps it automatically and `requireUser()` gates it.
- **Add a UI primitive** → put it in `src/components/ui/` so it can be reused.

---

## 🪪 License

MIT. Build something great with it.
