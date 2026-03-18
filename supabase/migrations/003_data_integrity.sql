-- ============================================================================
-- Senti v2 — Data integrity constraints
-- ============================================================================
-- Enforces uniqueness and NOT NULL on the identity columns that the auth
-- system depends on. Safe to run multiple times (idempotent).
--
-- Run AFTER 002_rename_auth_identifier.sql.
-- Paste into: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

-- 1. auth_user_id must never be NULL (every row must map to a real Supabase user)
ALTER TABLE users
  ALTER COLUMN auth_user_id SET NOT NULL;

-- 2. Unique index on auth_user_id — prevents duplicate rows per Supabase user.
--    Used by saveUserProfile's onConflict: 'auth_user_id' upsert.
CREATE UNIQUE INDEX IF NOT EXISTS unique_auth_user_id
  ON users (auth_user_id);

-- 3. Case-insensitive unique index on username.
--    Prevents two users claiming the same name in different cases (e.g. "Alice" vs "alice").
--    The ilike() check in checkUsernameAvailable uses this index for O(log n) lookups.
CREATE UNIQUE INDEX IF NOT EXISTS unique_username
  ON users (LOWER(username));

-- ============================================================================
-- Final expected users table shape:
--
--   id           BIGSERIAL / UUID   PRIMARY KEY
--   auth_user_id TEXT               NOT NULL  ← unique_auth_user_id index
--   username     TEXT                         ← unique_username index (case-insensitive)
--   handle       TEXT
--   email        TEXT
--   created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
--   updated_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
-- ============================================================================
