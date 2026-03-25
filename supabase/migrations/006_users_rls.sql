-- ============================================================================
-- Senti v2 — Ensure users table has correct RLS policies
-- ============================================================================
-- The `users` table was created in a previous Clerk-based deployment.
-- None of the subsequent migrations defined explicit RLS policies for it,
-- meaning any INSERT ... ON CONFLICT DO UPDATE (upsert) would hang
-- indefinitely when RLS was enabled — causing the "Connection timed out"
-- error users see on the username creation screen.
--
-- PostgreSQL requires BOTH an INSERT and UPDATE policy for upsert to settle.
-- Missing either one causes the query to block permanently (it never rejects,
-- never resolves) until withTimeout fires after 15 s.
--
-- Fix: enable RLS (idempotent) and ensure open SELECT / INSERT / UPDATE
-- policies exist — matching the pattern used by all other Senti tables.
--
-- Safe to run multiple times (DO block guards against duplicate policy error).
-- Run AFTER 005_transfers_sender_username.sql.
-- Paste into: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_select'
  ) THEN
    CREATE POLICY "users_select" ON users FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_insert'
  ) THEN
    CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_update'
  ) THEN
    CREATE POLICY "users_update" ON users FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;
