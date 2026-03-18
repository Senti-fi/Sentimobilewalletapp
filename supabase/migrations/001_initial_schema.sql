-- ============================================================================
-- Senti v2 — Financial State Table
-- ============================================================================
-- The `users` table already exists from the previous deployment (150+ rows).
-- This migration only adds the new `user_state` table for financial data.
--
-- Safe to run multiple times (fully idempotent).
-- Paste into: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

-- user_state
-- One row per Senti user. Stores the full financial state as JSONB.
-- Upserted after every successful wallet / savings / investment action.
-- user_id = users.auth_user_id  (TEXT — joins on the Supabase auth UUID,
--           not the table pk, to avoid storing an extra field client-side)

CREATE TABLE IF NOT EXISTS user_state (
  user_id          TEXT        PRIMARY KEY,
  balances         JSONB       NOT NULL DEFAULT '{}',
  transactions     JSONB       NOT NULL DEFAULT '[]',
  goals            JSONB       NOT NULL DEFAULT '[]',
  flexible_savings JSONB       NOT NULL DEFAULT '{"balance":0,"asset":"USDC","apy":4.5,"createdAt":null}',
  locked_savings   JSONB       NOT NULL DEFAULT '[]',
  investments      JSONB       NOT NULL DEFAULT '[]',
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every UPSERT/UPDATE
CREATE OR REPLACE FUNCTION update_user_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_state_updated_at ON user_state;
CREATE TRIGGER update_user_state_updated_at
  BEFORE UPDATE ON user_state
  FOR EACH ROW
  EXECUTE FUNCTION update_user_state_updated_at();

-- Row Level Security (matching the open policies on the existing users table)
ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_state_select" ON user_state;
DROP POLICY IF EXISTS "user_state_insert" ON user_state;
DROP POLICY IF EXISTS "user_state_update" ON user_state;

CREATE POLICY "user_state_select" ON user_state FOR SELECT USING (true);
CREATE POLICY "user_state_insert" ON user_state FOR INSERT WITH CHECK (true);
CREATE POLICY "user_state_update" ON user_state FOR UPDATE USING (true);
