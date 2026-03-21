-- Add authorization checks to vault wrapper functions.
-- Ensures only the project owner can decrypt/delete secrets linked to their integrations.

CREATE OR REPLACE FUNCTION public.vault_decrypt_secret(secret_id uuid)
RETURNS TABLE(decrypted_secret text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verify the calling user owns the project linked to this secret
  IF NOT EXISTS (
    SELECT 1
    FROM public.project_integrations pi
    JOIN public.projects p ON pi.project_id = p.id
    WHERE pi.vault_secret_id = secret_id
      AND p.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this secret';
  END IF;

  RETURN QUERY
  SELECT ds.decrypted_secret
  FROM vault.decrypted_secrets ds
  WHERE ds.id = secret_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.vault_delete_secret(secret_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verify the calling user owns the project linked to this secret
  IF NOT EXISTS (
    SELECT 1
    FROM public.project_integrations pi
    JOIN public.projects p ON pi.project_id = p.id
    WHERE pi.vault_secret_id = secret_id
      AND p.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this secret';
  END IF;

  DELETE FROM vault.secrets WHERE id = secret_id;
END;
$$;
