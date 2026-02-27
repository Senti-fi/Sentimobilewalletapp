# Senti Mobile Wallet App

A modern crypto wallet with real-time peer-to-peer payments, AI-powered assistance, and social user discovery.

## Features

- Zero-fee instant payments via user handles (`@username.senti`)
- Real-time messaging between users
- User discovery and search
- Lucy AI Assistant for portfolio analysis and DeFi guidance
- Sign in with Google, Apple, or Passkeys

## Setup

```bash
pnpm install
cp .env.example .env
```

Fill in your keys in `.env` (see `.env.example` for required variables).

Run `supabase/schema.sql` in your Supabase project's SQL Editor to set up the database.

## Running

```bash
pnpm dev
```

Starts the frontend at http://localhost:5173 and backend at http://localhost:3001.

## License

Private — All rights reserved.
