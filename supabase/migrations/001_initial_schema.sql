-- ─────────────────────────────────────────────────────────────────────
-- Senti v2 — Initial Schema
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────

-- ── users ─────────────────────────────────────────────────────────────
-- One row per Senti account. id = USR-XXXXXXXX generated client-side.

create table if not exists public.users (
  id            text        primary key,
  email         text        not null,
  auth_provider text        not null,   -- 'apple' | 'google'
  username      text        not null,
  created_at    timestamptz not null default now()
);

-- ── user_state ────────────────────────────────────────────────────────
-- Full financial state stored as JSONB — one row per user.
-- Upserted after every successful wallet/savings/investment action.

create table if not exists public.user_state (
  user_id          text        primary key references public.users(id) on delete cascade,
  balances         jsonb       not null default '{}',
  transactions     jsonb       not null default '[]',
  goals            jsonb       not null default '[]',
  flexible_savings jsonb       not null default '{"balance":0,"asset":"USDC","apy":4.5,"createdAt":null}',
  locked_savings   jsonb       not null default '[]',
  investments      jsonb       not null default '[]',
  updated_at       timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────
-- The app uses simulated auth (no Supabase Auth), so we use open policies
-- scoped to the anon key. Replace with auth.uid()-based policies when
-- real authentication is added.

alter table public.users      enable row level security;
alter table public.user_state enable row level security;

-- Drop existing policies if re-running this migration
drop policy if exists "anon_all_users"      on public.users;
drop policy if exists "anon_all_user_state" on public.user_state;

create policy "anon_all_users"
  on public.users for all
  using (true)
  with check (true);

create policy "anon_all_user_state"
  on public.user_state for all
  using (true)
  with check (true);
