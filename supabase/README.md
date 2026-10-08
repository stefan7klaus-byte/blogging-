# Supabase setup

This project is prepared for Supabase-backed publishing.

1. Create a Supabase project.
2. Open SQL Editor and run `schema.sql`.
3. Copy the project URL and publishable key from the Supabase dashboard.
4. Add them to the hosting environment as `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
5. Never put a service-role key in browser JavaScript.
6. Keep Row Level Security enabled. The included policies allow public reads only for published articles.

Supabase Auth can later be used for editor/admin accounts. The current schema intentionally separates public reading from privileged publishing.
