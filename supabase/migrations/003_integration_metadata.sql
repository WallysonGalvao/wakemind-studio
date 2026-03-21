-- Add metadata column for non-secret integration config (e.g. project IDs)
ALTER TABLE project_integrations
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
