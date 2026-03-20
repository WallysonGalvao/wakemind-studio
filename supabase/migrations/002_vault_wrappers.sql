-- Wrapper functions for Supabase Vault (vault schema is not accessible via PostgREST/client RPC)
-- These SECURITY DEFINER functions expose vault operations through the public schema.

CREATE OR REPLACE FUNCTION public.vault_create_secret(new_secret text, new_name text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN vault.create_secret(new_secret, new_name);
END;
$$;

CREATE OR REPLACE FUNCTION public.vault_delete_secret(secret_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM vault.secrets WHERE id = secret_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.vault_decrypt_secret(secret_id uuid)
RETURNS TABLE(decrypted_secret text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT ds.decrypted_secret
  FROM vault.decrypted_secrets ds
  WHERE ds.id = secret_id;
END;
$$;
