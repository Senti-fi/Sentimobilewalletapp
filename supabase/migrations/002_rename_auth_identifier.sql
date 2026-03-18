-- ============================================================================
-- Senti v2 — Rename clerk_user_id → auth_user_id
-- ============================================================================
-- The users table was seeded when Clerk was the auth provider.
-- We now use Supabase Auth; the stored value (a UUID from the auth provider)
-- is unchanged — only the column name is corrected.
--
-- Also adds created_at / updated_at to users if they do not exist yet,
-- giving the table a complete, auditable schema.
--
-- Safe to run multiple times (idempotent via IF EXISTS / IF NOT EXISTS).
-- Paste into: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

-- 1. Rename the column (fails gracefully if already renamed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'clerk_user_id'
  ) THEN
    ALTER TABLE users RENAME COLUMN clerk_user_id TO auth_user_id;
  END IF;
END $$;

-- 2. Add created_at / updated_at if missing
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 3. Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- ============================================================================
-- Expected users table schema after this migration:
--
--   id           BIGSERIAL / UUID   PRIMARY KEY
--   auth_user_id TEXT               UNIQUE NOT NULL  ← Supabase auth.users.id
--   username     TEXT
--   handle       TEXT
--   email        TEXT
--   created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
--   updated_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
--
-- user_state.user_id joins on users.auth_user_id (both store the Supabase UUID).
-- ============================================================================
