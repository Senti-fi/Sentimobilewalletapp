-- ============================================================================
-- Senti v2 — Referrals & Referral Points Tables
-- ============================================================================
-- Creates:
--   referrals       — one row per successful referral (unique on referred_id)
--   referral_points — individual point award events for both parties
--
-- Safe to run multiple times (idempotent).
-- Run AFTER 003_data_integrity.sql.
-- Paste into: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

-- ── referrals ────────────────────────────────────────────────────────────────
-- One row per referred user. The UNIQUE constraint on referred_id enforces
-- that a user can only be referred once (Postgres error 23505 on duplicate).

CREATE TABLE IF NOT EXISTS referrals (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id    TEXT        NOT NULL,   -- auth_user_id of the person who shared the link
  referred_id    TEXT        NOT NULL,   -- auth_user_id of the new user
  referral_code  TEXT        NOT NULL,   -- username used as the referral code
  status         TEXT        NOT NULL DEFAULT 'completed',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referred_id)                  -- one user can only be referred once
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals (referred_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Use DO blocks because CREATE POLICY has no IF NOT EXISTS syntax
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'referrals_select'
  ) THEN
    CREATE POLICY "referrals_select" ON referrals FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'referrals_insert'
  ) THEN
    CREATE POLICY "referrals_insert" ON referrals FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ── referral_points ──────────────────────────────────────────────────────────
-- Two rows per referral: 100 pts for the referrer, 50 pts for the new user.
-- referral_id is nullable so a point row is never orphaned if the parent
-- referral row is somehow missing.

CREATE TABLE IF NOT EXISTS referral_points (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  TEXT        NOT NULL,
  referral_id   UUID        REFERENCES referrals(id) ON DELETE SET NULL,
  points        INTEGER     NOT NULL DEFAULT 0,
  reason        TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_points_auth_user_id ON referral_points (auth_user_id);

ALTER TABLE referral_points ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referral_points' AND policyname = 'referral_points_select'
  ) THEN
    CREATE POLICY "referral_points_select" ON referral_points FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referral_points' AND policyname = 'referral_points_insert'
  ) THEN
    CREATE POLICY "referral_points_insert" ON referral_points FOR INSERT WITH CHECK (true);
  END IF;
END $$;
