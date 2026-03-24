-- ============================================================================
-- Senti v2 — Add sender_username to transfers table
-- ============================================================================
-- The recordTransfer() function in src/lib/sync.ts writes sender_username
-- so the recipient can display who sent the funds. This column was added
-- to the application code but never added to the DB schema.
--
-- Safe to run multiple times (IF NOT EXISTS).
-- ============================================================================

ALTER TABLE transfers ADD COLUMN IF NOT EXISTS sender_username TEXT;
