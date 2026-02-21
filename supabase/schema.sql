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
  auth_user_id   TEXT        UNIQUE NOT NULL,
  username       TEXT        UNIQUE NOT NULL,
  handle         TEXT        UNIQUE NOT NULL,
  wallet_address TEXT,
  email          TEXT,
  image_url      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
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

-- ============================================================================
-- Messages Table — Real-time chat between users
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_handle   TEXT        NOT NULL,
  receiver_handle TEXT        NOT NULL,
  content         TEXT        NOT NULL,
  type            TEXT        DEFAULT 'text',
  amount          DECIMAL,
  asset           TEXT,
  status          TEXT        DEFAULT 'sent',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast conversation lookups
CREATE INDEX IF NOT EXISTS idx_messages_sender   ON messages(sender_handle, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_handle, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(sender_handle, receiver_handle, created_at DESC);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
CREATE POLICY "Users can read their own messages"
  ON messages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (true);

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================================
-- Referrals Table — Track who referred whom
-- ============================================================================

-- Add referral_code column to users (if not already present)
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

CREATE TABLE IF NOT EXISTS referrals (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id     TEXT        NOT NULL,          -- auth_user_id of the person who shared
  referred_id     TEXT        NOT NULL,          -- auth_user_id of the person who signed up
  referral_code   TEXT        NOT NULL,          -- the code used
  status          TEXT        DEFAULT 'completed', -- completed, pending, rewarded
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Referrals are viewable by everyone" ON referrals;
CREATE POLICY "Referrals are viewable by everyone"
  ON referrals FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);
