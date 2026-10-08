# Zenith Hackers Intelligence

GitHub-ready static website with Supabase CMS/authentication and a Supabase Edge Function for the AI assistant.

## Upload to GitHub
Extract this ZIP, then upload all files to the root of your repository, or use the GitHub web uploader.

## Supabase
Run:
1. `supabase/schema.sql`
2. `supabase/schema-admin.sql`

Create an email/password user in Supabase Authentication, then authorize it:
`insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');`

## AI
Deploy `supabase/functions/chat/index.ts` as the `chat` Edge Function and configure `OPENAI_API_KEY` as a Supabase secret. Do not put an OpenAI secret in browser code. Supabase Edge Functions are designed for server-side integrations such as OpenAI. See the official Supabase Edge Functions documentation.

## Background
Place the supplied artwork at:
`assets/ethical-zenith-blog.jpg`

The site will work without the image, but the intended floating background effect uses that file.

## Admin
Open `/admin/` after deployment and sign in with the authorized Supabase user.
