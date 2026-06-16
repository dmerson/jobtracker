# Deployment Guide

This assumes you already have accounts for **Vercel**, **Supabase**, **Google Cloud Console**, and **Anthropic** (no account creation steps below — just project-specific configuration to wire them together).

## Cost summary

- **Vercel** — Hobby plan, $0/month. Fine for personal use.
- **Supabase** — Free plan, $0/month. Covers Postgres, Auth, and Storage at this app's scale (500MB DB / 1GB storage / 50k monthly active users — wildly more than a personal job tracker needs).
- **Anthropic API** — Pay-per-use, no monthly fee. Each cover letter or resume tailoring call costs roughly $0.01–0.05 depending on resume length. You only pay when you click "Generate."

Total fixed cost: **$0/month**. Only variable cost is the few cents per AI generation you trigger.

## 1. Supabase project setup

1. In your Supabase dashboard, create a new project (or pick an existing one to dedicate to this app).
2. Open the **SQL Editor** and run the two migration files in order:
   - `supabase/migrations/0001_init.sql` (tables + Row Level Security policies)
   - `supabase/migrations/0002_storage.sql` (creates the `resumes` storage bucket + its access policies)
3. Go to **Project Settings → API** and copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Note your project's auth callback URL — it's:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
   You'll need this in the next step.

## 2. Google OAuth setup (Google Cloud Console)

1. In Google Cloud Console, open (or create) an **OAuth 2.0 Client ID** of type "Web application" under **APIs & Services → Credentials**.
2. Under **Authorized redirect URIs**, add the Supabase callback URL from step 1.4 above:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client Secret**.
4. In the Supabase dashboard, go to **Authentication → Providers → Google**, enable it, and paste in the Client ID and Client Secret from step 3. Save.
5. In the Supabase dashboard, go to **Authentication → URL Configuration** and set:
   - **Site URL**: your production URL (e.g. `https://your-app.vercel.app`) — update this after your first Vercel deploy if you don't have the domain yet.
   - **Redirect URLs**: add both `http://localhost:3000/auth/callback` (for local dev) and `https://your-app.vercel.app/auth/callback` (for production). http://localhost:3002/auth/callback for my local dev

## 3. Anthropic API key

Copy your API key from the Anthropic Console — this becomes the `ANTHROPIC_API_KEY` environment variable. No further setup needed; it's billed per request.

## 4. Local development

1. Copy `.env.local.example` to `.env.local` and fill in the three values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ANTHROPIC_API_KEY=...
   ```
2. Install dependencies and run the dev server:
   ```
   npm install
   npm run dev 
   npm run dev -- -p 3002
   ```
3. Visit `http://localhost:3002`, sign in with Google, and confirm you can create a job application, add interview notes, fill in your profile, generate a cover letter, and generate a tailored resume PDF.

## 5. Deploy to Vercel

1. Push this repository to GitHub (or your preferred Git provider) if you haven't already.
2. In Vercel, import the repository as a new project. Framework preset auto-detects as Next.js — no build settings need to change.
3. Under **Settings → Environment Variables**, add the same three variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy.
5. Once deployed, copy your production URL (e.g. `https://your-app.vercel.app`) and go back to Supabase's **Authentication → URL Configuration** to make sure the **Site URL** and **Redirect URLs** match it exactly (including `/auth/callback` for the redirect URL).

## 6. Production smoke test

Visit your production URL and confirm end-to-end:
1. Sign in with Google.
2. Create a job application with a pasted job description.
3. Fill in your base profile (summary, skills, resume content) on the Profile page.
4. On a job's detail page, click "Generate with AI" under Cover Letter — confirm a letter is generated and saved.
5. Click "Tailor with AI" or "Copy Base Resume" under Resume, then "Generate PDF" — confirm the PDF generates and "View PDF" opens it.
6. Add an interview note and confirm it persists after a page refresh.

If anything fails, check the Vercel function logs (Vercel dashboard → your project → Logs) and the Supabase logs (Supabase dashboard → Logs) for the specific error.
