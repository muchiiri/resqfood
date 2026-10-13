# Deploying ResQfood to Netlify

This guide takes the app from this repository to a live Netlify site that deploys from GitHub. The repository
already has the files Netlify needs ([netlify.toml](../netlify.toml), [.nvmrc](../.nvmrc) and
[.env.example](../.env.example)). The steps below are things only you can do: pushing the code, connecting
Netlify and setting the Supabase options.

## What you need

- A GitHub account with this repository (`origin` is `https://github.com/muchiiri/resqfood.git`).
- A Netlify account.
- Your Supabase project (the same one you use locally, or a separate one for production).

## 1. Push the code to GitHub

Netlify deploys what is on GitHub, not what is on your computer.

```bash
git push -u origin main
```

Deploy from the `main` branch. Other branches can get preview deploys later.

## 2. Prepare Supabase

1. In the Supabase dashboard, open **SQL Editor** and run every file in `supabase/migrations/` in order, from
   `0001_profiles.sql` to `0015_waste_stats.sql`. Skip any you have already run on this project. The
   `0009_listings.sql` file also creates the `listing-photos` storage bucket.
2. Open **Database, Extensions** and turn on `pg_cron` before running `0007_expiry_reminders.sql` and
   `0011_listing_expiry.sql`. These two files schedule the `expiry-reminders` and `listing-expiry` jobs. They run
   inside Supabase, so Netlify has no scheduled jobs to set up.
3. Open **Project Settings, API** and keep the **Project URL** and the **anon public** key handy. Do not use the
   `service_role` key anywhere in this app.

## 3. Create the Netlify site

1. In Netlify choose **Add new project, Import an existing project, GitHub**, allow access, and pick the
   `resqfood` repository.
2. Choose the `main` branch. Netlify reads [netlify.toml](../netlify.toml), so the build command shows as
   `npm run build`. Leave the publish directory empty: Netlify's Next.js support sets it up itself.
3. **Before the first deploy**, open **Site configuration, Environment variables** and add these two variables
   (use the values from step 2.3, and keep the scope on all deploy contexts so previews work too):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | the Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the Supabase anon public key |

   The `NEXT_PUBLIC_` values are baked into the build. If you change them later, trigger a new deploy.
4. Click **Deploy**. When it finishes, note the site address (for example `https://your-site.netlify.app`).

## 4. Tell Supabase about the Netlify address

The app does not set an email redirect itself, so confirmation emails link to the Supabase **Site URL**.

1. In Supabase open **Authentication, URL Configuration**.
2. Set **Site URL** to your Netlify address (or your custom domain once you have one).
3. Under **Redirect URLs** add `https://your-site.netlify.app/**`. To allow deploy previews, also add
   `https://*--your-site.netlify.app/**`. Replace `your-site` with your real site name.

## 5. Check the live site

- The home page loads after you sign in, and `/login` loads when you are signed out.
- Sign up and log in work. If you use email confirmation, the link in the email opens your Netlify address.
- Create a listing with a photo, and open it from Find Food with a second account.
- Notifications, the pickup bar and `/waste-stats` charts load.
- Scanning a receipt in Add item fills in dates.

## Day to day

- Every push to `main` deploys automatically. Pushes to other branches and pull requests get a preview deploy.
- When a feature adds a SQL migration, run it in the Supabase SQL Editor **before** you deploy the code that needs it.
- To undo a bad deploy open **Deploys** in Netlify, pick an earlier good deploy and choose **Publish deploy**.

## If something goes wrong

| Symptom | Likely cause and fix |
|---|---|
| Pages fail or show errors right after login | The two environment variables are missing or wrong. Fix them in Netlify and redeploy with **Clear cache and deploy site**. |
| Confirmation email opens `localhost` or the wrong address | The Supabase **Site URL** is not set to the Netlify address (step 4). |
| You log in but are logged out on the next page | Session cookies are not being refreshed. See the note below. |
| Listing photos do not show | The `listing-photos` bucket from `0009_listings.sql` is missing, or the migration was not run. |
| Expiry reminders or listing expiry never run | `pg_cron` is off or the migrations that schedule the jobs were not run (step 2). |

## Notes

- Netlify's documentation says its Next.js support covers the App Router, Server Actions and Cache Components, and
  runs middleware as Edge Functions. This project's session refresh lives in `proxy.ts`, the Next.js 16 name for
  middleware, which Netlify's page does not name. It could not be tested before the first deploy, so if login
  works but sessions do not persist, report it: the fix belongs in a follow-up, not in this setup.
- `netlify.toml` pins Node 24 to match `.nvmrc` and local development. Next.js 16 needs Node 20.9 or newer.
- No secrets belong in this repository. `.env.example` holds placeholders only, and `.env.local` stays ignored.
