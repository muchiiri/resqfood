<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Instructions for AI coding agents working in this project.

Do not add AI attribution to commits or pull requests, including AI
`Co-Authored-By` trailers or generated-by signatures. Preserve genuine human
attribution.

## What this is

ResqFood: a Next.js (App Router) web app. > TODO: one-line purpose once the project plan is written.

## Proportional engineering

Build for established requirements, not hypothetical scale, threats, or future
flexibility. Reuse existing code, the standard library, native platform features,
and installed dependencies before adding machinery.

- Unknown scale or extensibility defaults to the smaller reversible design.
- Derive trust and data-integrity boundaries from actual reachability: untrusted
  input, auth/session/ownership, shared persisted data, destructive operations,
  payments, secrets, and sensitive data.
- Add an abstraction, dependency, service, configuration surface, or security
  mechanism only for a current requirement.
- Simplicity never removes real trust-boundary validation, data-loss prevention,
  accessibility, or project rules.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Package manager: npm (`package-lock.json`)
- Source lives in `app/`
- Auth and database: Supabase. SQL migrations live in `supabase/migrations/` and are applied by hand (SQL editor or CLI).

## Environment

Set in `.env.local` (git-ignored). `.env.example` lists the names with placeholder values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deployment

The app deploys to Netlify from GitHub. `netlify.toml` and `.nvmrc` hold the build settings; the steps, the Supabase URL settings and the post-deploy checks are in `docs/deploying-to-netlify.md`.

## Scheduled jobs

Scheduled work runs inside Supabase with the `pg_cron` extension (enable it under Database, Extensions), not in the app.

- `expiry-reminders`: `select public.send_expiry_reminders();` at 04:00 UTC (08:00 UAE time) writes one expiry digest notification per user per day.
- Run it by hand: `select public.send_expiry_reminders();` in the SQL editor. It returns how many digests it created and is safe to repeat the same day.
- Stop it: `select cron.unschedule('expiry-reminders');`
- Inspect it: `select * from cron.job;` and `select * from cron.job_run_details order by start_time desc;`
- `listing-expiry`: `select public.expire_listings();` every 5 minutes marks available listings past their available-until time as `expired`. Claimed listings are left alone.
- Run it by hand: `select public.expire_listings();` in the SQL editor. It returns how many listings it changed and returns 0 when run again.
- Stop it: `select cron.unschedule('listing-expiry');`

## Commands

- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Production server: `npm run start`
- Lint: `npm run lint`

No test runner is configured yet, so there is no test gate. No combined verify
command or GitHub checks exist yet.
