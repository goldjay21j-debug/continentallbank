# Wiring Up Supabase

Step-by-step guide to wiring Continental Bank to a real Supabase backend. **Total time: ~10 minutes** if you have a Supabase and Vercel account ready.

When you're done, real sign-ups will create real Supabase users, and every dashboard / admin page will read from your Supabase database.

---

## Step 1 — Create the Supabase project (2 min)

1. Go to **<https://supabase.com>** and sign in (or create a free account).
2. Click **New project**.
3. Name it `continental-bank` (or whatever you prefer).
4. Pick a strong database password — **save it somewhere safe**, you'll need it if you ever want to access the database directly.
5. Choose a region near your Vercel deployment region. (If your Vercel is `iad1` / US East, pick `East US (Ohio)` or `East US (N. Virginia)`.)
6. Pick the **Free** plan.
7. Click **Create new project** and wait ~2 minutes for it to provision.

## Step 2 — Run all database migrations (3 min)

1. Once the project is ready, click **SQL Editor** in the left sidebar.
2. Click **+ New query**.
3. Open each migration file from your repo and run them **in this exact order**:
   - [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql)
   - [`supabase/migrations/0002_refund_claims.sql`](supabase/migrations/0002_refund_claims.sql)
   - [`supabase/migrations/0003_profile_kyc.sql`](supabase/migrations/0003_profile_kyc.sql)
   - [`supabase/migrations/0004_documents_notifications_beneficiaries.sql`](supabase/migrations/0004_documents_notifications_beneficiaries.sql)
   - [`supabase/migrations/0005_recovery_escrow_platform.sql`](supabase/migrations/0005_recovery_escrow_platform.sql)
4. For each file, **copy the entire contents**, paste into the SQL editor, then click **Run**.

You should see "Success. No rows returned." after each migration. These create the auth-linked profiles, wallets, ledger, refunds, KYC, documents, notifications, beneficiaries, recovery cases, escrow contracts, uploaded file records, messages, withdrawal release workflow, RLS policies, and the auto-profile-creation trigger.

**Verify it worked:** click **Table Editor** in the left sidebar. You should see tables including `profiles`, `wallets`, `ledger_entries`, `transactions`, `withdrawal_requests`, `support_tickets`, `audit_logs`, `generated_documents`, `notifications`, `beneficiaries`, `refund_claims`, `cases`, `kyc_submissions`, `uploaded_files`, `escrow_contracts`, `recovered_funds_entries`, `disputes`, and `messages`.

## Step 3 — Copy your three keys (1 min)

1. Click **Project Settings** (gear icon, bottom left).
2. Click **API** in the sub-menu.
3. You'll need three values:

| Where you'll see it | Use as |
|---|---|
| **Project URL** (`https://abcdefgh.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| **Project API keys → `anon` `public`** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Project API keys → `service_role` `secret`** | `SUPABASE_SERVICE_ROLE_KEY` ⚠️ |

⚠️ **The `service_role` key bypasses Row Level Security.** It must ONLY be used server-side. Never paste it into client code, browser dev tools, or commit it to git. The `.env.local` file is gitignored.

## Step 4 — Set the keys in Vercel (2 min)

1. Open your Vercel dashboard → your `continentalbank` project.
2. Click **Settings** → **Environment Variables**.
3. Add these four entries, one at a time:

| Name | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://continentallbank.com` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | (Project URL from Step 3) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon key from Step 3) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | (service_role key from Step 3) | **Production + Preview only** ⚠️ |

For the service role key, **uncheck Development** — it should never sit on a developer's machine unless they explicitly need it.

4. Click **Save** after each one.
5. Trigger a redeploy: **Deployments** tab → click the three-dot menu on the latest deployment → **Redeploy**.

## Step 5 — Tell Supabase about your domain (1 min)

This lets the email-confirmation links sent by Supabase point back to your site.

1. In Supabase → **Authentication** → **URL Configuration**.
2. Set **Site URL** to your production domain: `https://continentallbank.com`
3. Under **Redirect URLs**, add:
   ```
   https://continentallbank.com/auth/callback
   https://*.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```
   The localhost entries let you test the flow locally during development.
4. Click **Save**.

## Step 6 — Bootstrap your first admin (2 min)

The portal has no built-in way to elevate the first user — by design (otherwise anyone could sign up as a super admin). You have to promote your account by hand once.

1. Visit your deployed site, click **Open Account** in the top right, and register a regular account.
2. Check the email you used — Supabase sends a confirmation link. Click it. You'll be redirected to `/auth/callback` then to `/pending`.
3. Back in Supabase, go to **SQL Editor** → **+ New query**, and run:
   ```sql
   update public.profiles
   set role = 'super_admin', account_status = 'approved'
   where email = 'your-email@example.com';
   ```
   (Replace with the email you registered.)
4. Refresh the site. You'll be redirected from `/pending` to `/admin`. You now have super-admin access.

From here, **all other users can be provisioned through the admin panel** — `/admin/users` → "New client" lets you create clients OR additional admins.

## Step 7 — Sanity check

| Action | Expected behaviour |
|---|---|
| Visit `/` while signed out | Marketing landing page |
| Click **Open Account** → fill the form → submit | Lands on `/pending`, "Application under review" |
| As super admin, go to `/admin/users` | The new applicant appears with status `pending` |
| Click them → click **Approve** | Status changes to `approved`, audit log entry written |
| Sign in as the approved client | Lands on `/dashboard`, all wallets at 0 |
| As super admin, open the client's detail page and post a `deposit` adjustment | Client's USD wallet now shows the credit; ledger + audit + transaction entries all written |

If any of those don't work, check:
- **Browser console** for errors (often hints at a missing env var)
- **Vercel deployment logs** for server-side errors
- **Supabase SQL Editor**: run `select count(*) from public.profiles;` to confirm rows exist

## Optional — production hardening

### Auto-confirm emails

By default Supabase requires email confirmation. To disable that during testing:
- **Authentication** → **Providers** → **Email** → toggle off **Confirm email**.

For production, leave it ON.

### Custom email templates

Supabase sends a default confirmation email. For a private bank, you'll want to customise:
- **Authentication** → **Email Templates** → edit "Confirm signup" with your branding. The HTML templates in [`src/lib/email/templates.ts`](src/lib/email/templates.ts) are a starting point.

### Rate limiting

Supabase rate-limits signups by IP. The defaults are fine for a private bank (~30 sign-ups/hour) but if you need stricter limits, configure them under **Authentication** → **Rate Limits**.

### Database backups

Supabase Free includes 7 days of daily backups. For a real bank you'd want **Point-in-Time Recovery** (PITR) on the Pro plan. **Project Settings** → **Database** → **PITR**.

### A second region

For redundancy you can add a read replica in another region. **Project Settings** → **Database** → **Read replicas**. Adds latency for writes; useful if you're holding regulated data and need geographic distribution.

---

## Troubleshooting

**"Failed to fetch" in the browser console**
→ `NEXT_PUBLIC_SUPABASE_URL` is wrong, missing, or still set to the placeholder. Triple-check Vercel env vars and redeploy.

**Login form shows "Sign-in is unavailable in preview"**
→ The app thinks Supabase isn't configured. Check that `NEXT_PUBLIC_SUPABASE_URL` does NOT contain the string `placeholder`. Redeploy after fixing.

**Sign-up succeeds but the user can't sign in**
→ Email confirmation is on. Tell the user to check their inbox.

**Admin can't post balance adjustments**
→ You're signed in as `support_admin` or `client`. Only `super_admin` and `finance_admin` can adjust balances.

**RLS error: "new row violates row-level security policy"**
→ Almost always means the action is being called without the right role. Check that the server action is calling `requireAdmin()` or `requireSuperAdmin()` first, and that the calling user's `role` is set in the database.

**Trigger error: "permission denied for schema auth"**
→ The migration's `auth.users` trigger needs the function to be `security definer`. The migration already sets this. If you've modified the function, ensure `security definer` is in place.
