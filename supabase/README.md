# Supabase setup

This project uses Supabase for the article database, authentication, publishing permissions and future serverless AI services.

## Database

Run these files in Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/schema-admin.sql`

If `schema.sql` was already run, run only `schema-admin.sql` for the publisher permissions.

## Publisher account

Create an email/password user under Supabase Authentication → Users.

Then authorize that user:

```sql
insert into public.admin_users (user_id)
values ('YOUR-AUTH-USER-UUID');
```

The publisher dashboard is `/admin/`.

## Browser configuration

The website uses the Supabase project URL and publishable key. Supabase documents publishable keys as safe for browser code because Row Level Security controls what they can access.

Never put a `sb_secret_...`, `service_role`, database password, or other elevated credential in browser code.

## Data API

Make sure the `categories`, `articles`, and `admin_users` tables are exposed through the Supabase Data API if your project requires explicit exposure settings. The SQL grants and RLS policies in this repository are intentionally least-privilege.

## AI backend

The AI assistant requires a server-side OpenAI API key. Do not put that key in `script.js` or any browser configuration.

The existing `api/chat.js` endpoint is suitable for a serverless host such as Vercel, but GitHub Pages cannot execute Node.js API routes. A Supabase Edge Function is the preferred next deployment step if the site is hosted statically from GitHub Pages.
