ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dubverse_api_key text;

alter publication supabase_realtime add table users;
