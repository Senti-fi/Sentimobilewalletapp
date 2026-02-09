-- ============================================================================
-- Senti Users Table — Complete Schema
-- ============================================================================
-- Safe to run multiple times (fully idempotent).
-- Paste the ENTIRE file into Supabase SQL Editor → Run.
-- https://supabase.com/dashboard/project/jojmowapzlurrnhtezcu/sql
-- ============================================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS users (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id  TEXT        UNIQUE NOT NULL,
  username       TEXT        UNIQUE NOT NULL,
  handle         TEXT        UNIQUE NOT NULL,
  wallet_address TEXT,
  email          TEXT,
  image_url      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username      ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_handle        ON users(handle);
CREATE INDEX IF NOT EXISTS idx_users_email         ON users(email);

-- 3. Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop-then-create so this script never fails on "already exists"
DROP POLICY IF EXISTS "Users are viewable by everyone"    ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (true);

-- 4. Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
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
  EXECUTE FUNCTION update_updated_at_column();
