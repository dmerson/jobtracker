# Job Application Tracker — Implementation Plan

## Context

The user wants a personal job-application tracker that records job descriptions, application dates, contact/status updates, next steps, structured interview notes, and a per-job tailored resume + AI-generated cover letter. Login is via Google (open to any Google account, data isolated per user). The app must be deployable at $0/near-$0 cost. The user already has Vercel, Supabase, Google Cloud OAuth, and an Anthropic API key set up, so the deployment guide focuses on project-specific configuration rather than account creation.

Decisions locked in during the interview:
- **Stack**: Next.js (App Router, TypeScript) — single deployable unit on Vercel.
- **Backend/DB/Auth/Storage**: Supabase (Postgres + built-in Google OAuth + Storage for resume PDFs).
- **AI**: Anthropic Claude API, called from a server-side Next.js route, using the user's own API key — generates the tailored cover letter and resume suggestions from a base profile + pasted job description.
- **Job site credentials**: No password storage at all — only the application URL is stored (Chrome's own password manager handles login).
- **Job description input**: Manual paste (no scraping in v1).
- **Resume**: Maintain one base profile/resume in-app; per-job tailored copies are edited in-app and exported to PDF, stored in Supabase Storage.
- **Interview notes**: Structured records (date, round/type, interviewer(s), notes) — multiple per application.
- **Status pipeline**: Applied → Contacted/Screening → Interview → Offer → Rejected/Closed, plus a free-text "next step" field.

## Architecture

```
Next.js App (Vercel)
 ├─ Supabase Auth (Google OAuth provider) — session via @supabase/ssr
 ├─ Postgres (Supabase) — all app data, Row Level Security scoped to auth.uid()
 ├─ Supabase Storage — bucket "resumes", per-user folder, stores generated PDFs
 └─ /api/cover-letter, /api/resume-suggest — server routes calling Anthropic API
```

No separate backend service — Next.js API routes (App Router `route.ts` handlers) are the entire server side, calling Supabase (service done client-side via RLS-protected anon key, or server actions with the user's session) and the Anthropic SDK.

## Data Model (Postgres tables in Supabase, all with RLS: `user_id = auth.uid()`)

- `profiles` — one row per user: `user_id (pk, fk auth.users)`, `full_name`, `summary`, `skills` (text/array), `base_resume_content` (jsonb or markdown), `created_at`.
- `job_applications` — `id (uuid pk)`, `user_id`, `company`, `title`, `job_description` (text), `application_url`, `status` (enum: applied/contacted/interview/offer/rejected/closed), `next_step` (text), `applied_date`, `created_at`, `updated_at`.
- `interviews` — `id (uuid pk)`, `job_application_id (fk)`, `user_id`, `interview_date`, `round_type` (text, e.g. phone screen/technical/onsite/final), `interviewers` (text), `notes` (text), `created_at`.
- `cover_letters` — `id (uuid pk)`, `job_application_id (fk)`, `user_id`, `content` (text), `created_at`.
- `resumes` — `id (uuid pk)`, `job_application_id (fk, nullable — null = base resume copy)`, `user_id`, `title`, `content` (jsonb/markdown), `pdf_path` (Storage path), `created_at`, `updated_at`.

RLS policies: enable on all tables, policy `using (auth.uid() = user_id)` for select/insert/update/delete.

## App Structure (Next.js App Router)

```
app/
  layout.tsx                    — root layout, Supabase session provider
  page.tsx                      — dashboard: list of job applications, status filter
  login/page.tsx                — Google sign-in button (Supabase Auth)
  jobs/[id]/page.tsx            — job detail: description, status, next step, interviews, cover letter, resume
  jobs/new/page.tsx             — new application form
  profile/page.tsx              — base resume/skills profile editor
  api/cover-letter/route.ts     — POST: job_id -> calls Anthropic, saves to cover_letters
  api/resume-suggest/route.ts   — POST: job_id -> calls Anthropic, returns suggested edits
  api/resume-pdf/route.ts       — POST: resume content -> renders PDF, uploads to Storage
lib/
  supabase/client.ts, server.ts — Supabase client helpers (browser + server/RSC)
  anthropic.ts                  — Anthropic SDK client + prompt builders
  pdf.ts                        — resume -> PDF rendering (using @react-pdf/renderer)
```

Key libraries: `@supabase/supabase-js`, `@supabase/ssr`, `@anthropic-ai/sdk`, `@react-pdf/renderer` (or `pdf-lib`) for PDF generation, Tailwind CSS for styling (fast to build with, free).

## AI Integration

- `lib/anthropic.ts` builds a prompt combining `profiles.summary/skills/base_resume_content` + `job_applications.job_description`, calls Claude (model: claude-sonnet-4-6) to draft a tailored cover letter.
- A second prompt/endpoint suggests resume bullet edits per job, which the user can accept into a new `resumes` row tied to that job.
- Both endpoints are server-only routes so the Anthropic API key never reaches the browser.

## Build Order

1. Scaffold Next.js + TypeScript + Tailwind app, set up env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` if needed, `ANTHROPIC_API_KEY`).
2. Write SQL migration (one `.sql` file) creating tables + RLS policies; user runs it in Supabase SQL editor (documented in deploy guide).
3. Implement Supabase client helpers + Google sign-in flow (Supabase Auth Google provider) + auth middleware to protect routes.
4. Build dashboard + job CRUD (list/new/detail/edit/status update).
5. Build interview notes CRUD within job detail page.
6. Build profile (base resume) editor page.
7. Build cover-letter generation endpoint + UI button/result on job detail page.
8. Build resume tailoring: copy base resume into a job-scoped resume, edit, generate PDF, upload to Storage, link from job detail.
9. Polish: status pipeline UI, basic styling, empty/error states.
10. Write `DEPLOYMENT.md` — step-by-step: Supabase project + SQL migration + Storage bucket + Google OAuth redirect URI config (in both Google Cloud Console and Supabase Auth settings), Vercel env vars + deploy, Anthropic key setup. Since the user already has all four accounts, this skips account creation and focuses on linking them together.

## Verification

- Run `npm run dev` locally with a `.env.local` pointing at the user's real Supabase project (test instance or same one) and confirm: Google sign-in works, creating/editing a job application persists and is scoped to the logged-in user (test by checking RLS in Supabase table editor), interview notes save, cover letter generates via a real Anthropic API call, resume PDF generates and is retrievable from Supabase Storage.
- `npm run build` must pass before considering the app deploy-ready.
- After deploying to Vercel, do one end-to-end smoke test in production: sign in with Google, create a job, generate a cover letter, generate a resume PDF.
