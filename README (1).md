# Supabase setup

Run `schema.sql` and then `schema-admin.sql` in Supabase SQL Editor.

Create an Authentication email/password user and add its UUID to `public.admin_users`.

The browser uses only the Supabase project URL and publishable key. Never put a Supabase secret/service-role key or OpenAI API key in frontend files.

Deploy `supabase/functions/chat/index.ts` as the `chat` Edge Function and store `OPENAI_API_KEY` in Supabase project secrets.
