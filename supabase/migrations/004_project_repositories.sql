-- Add repositories column for per-project repo links (displayed in header)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS repositories jsonb DEFAULT '[]'::jsonb;
