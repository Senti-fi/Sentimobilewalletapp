-- ============================================================================
-- Senti v2 — SECURITY DEFINER function for user profile upsert
-- ============================================================================
-- WHY THIS EXISTS:
--   Direct PostgREST upserts on the `users` table can hang indefinitely when
--   RLS is enabled — even with correct policies — if any legacy policy from a
--   previous deployment (Clerk era) creates a conflicting evaluation path.
--   A SECURITY DEFINER function runs with the privileges of the function owner
--   (postgres superuser), bypassing RLS entirely for that operation.
--
-- SECURITY:
--   The function checks auth.uid() === p_auth_user_id so a caller can only
--   ever upsert their OWN profile row. Any mismatch raises an exception which
--   PostgREST surfaces as a real HTTP error — it never hangs.
--
-- Safe to run multiple times (CREATE OR REPLACE).
-- Run AFTER 006_users_rls.sql.
-- Paste into: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_user_profile(
  p_auth_user_id TEXT,
  p_username     TEXT,
  p_handle       TEXT,
  p_email        TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Caller must be the user they are writing for
  IF auth.uid() IS NULL OR auth.uid()::TEXT != p_auth_user_id THEN
    RAISE EXCEPTION 'unauthorized: caller does not match target user';
  END IF;

  INSERT INTO users (auth_user_id, username, handle, email)
  VALUES (p_auth_user_id, p_username, p_handle, p_email)
  ON CONFLICT (auth_user_id)
  DO UPDATE SET
    username   = EXCLUDED.username,
    handle     = EXCLUDED.handle,
    email      = EXCLUDED.email,
    updated_at = NOW();
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION upsert_user_profile(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION upsert_user_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated;
