
# Senti Mobile Wallet App

A modern crypto wallet built on Solana with real-time peer-to-peer payments, AI-powered assistance, and social user discovery.

**Design:** [Figma](https://www.figma.com/design/S78E2nWuJBIyybaAlbUE4E/Senti-Mobile-Wallet-App)

## Features

- **Zero-fee payments** — Send and receive crypto instantly via user handles (`@username.senti`)
- **Real-time messaging** — Live chat with contacts powered by Supabase Realtime
- **User discovery** — Search and connect with other Senti users by username or handle
- **Lucy AI Assistant** — Conversational AI (Claude) for portfolio analysis, DeFi guidance, and transaction help
- **Social identity** — Persistent user profiles with usernames, avatars, and wallet addresses
- **Auth with passkeys** — Sign in with Google, Apple, or Passkeys via Clerk

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS 4, Framer Motion |
| Auth | Clerk (`@clerk/clerk-react`) — Google OAuth, Apple OAuth, Passkeys |
| Database | Supabase (PostgreSQL + Realtime) |
| AI Backend | Express + Anthropic Claude API (streaming SSE) |
| UI | Radix UI, Lucide icons, MUI |

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── App.tsx                  # App state machine (auth flow + routing)
│   │   └── components/
│   │       ├── Dashboard.tsx        # Main wallet dashboard
│   │       ├── LinkPage.tsx         # Social chat + payments (real-time)
│   │       ├── LinkSendModal.tsx    # In-chat payment modal
│   │       ├── SendModal.tsx        # Standalone send modal
│   │       ├── SignUp.tsx           # Clerk sign-up/sign-in
│   │       ├── SSOCallback.tsx      # OAuth redirect handler
│   │       ├── UsernameSetup.tsx    # New user identity creation
│   │       ├── SettingsModal.tsx    # App settings
│   │       ├── Onboarding.tsx       # First-launch onboarding
│   │       └── LoadingScreen.tsx    # Loading state
│   └── services/
│       ├── supabase.ts             # User CRUD, search, discovery
│       └── messageService.ts       # Real-time messaging (send, receive, subscribe)
├── server/
│   └── index.ts                    # Express backend (Lucy AI + Clerk migration)
├── supabase/
│   └── schema.sql                  # Full database schema (users + messages)
└── .env.example                    # Required environment variables
```

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Source |
|---|---|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com/) |
| `VITE_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk Dashboard > API Keys (server-side, needed for migration) |
| `VITE_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard > Project Settings > API |

### 3. Set up the database

Open your Supabase project's SQL Editor and run the entire contents of `supabase/schema.sql`. This creates:

- **`users`** table — profiles with clerk_user_id, username, handle, wallet_address
- **`messages`** table — real-time chat messages between users
- Row Level Security policies
- Indexes for fast lookups
- Realtime publication for the messages table

The schema is fully idempotent and safe to run multiple times.

### 4. Migrate existing Clerk users (optional)

If you have users who signed up via Clerk but don't yet have Supabase profiles:

```bash
# Start the backend
pnpm dev:backend

# In another terminal, trigger the migration
curl -X POST http://localhost:3001/api/migrate-clerk-users
```

This fetches all users from the Clerk Backend API and bulk-inserts them into Supabase with auto-generated usernames and wallet addresses.

## Running the App

```bash
# Start both frontend and backend concurrently
pnpm dev
```

This starts:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

To run them separately:

```bash
pnpm dev:frontend   # Vite dev server only
pnpm dev:backend    # Express API only
```

## Architecture

### Authentication Flow

```
User opens app
  → Clerk loads (isLoaded)
  → Signed in?
     YES → Check Supabase for existing profile
           → Found: restore to localStorage, go to Dashboard
           → Not found: check localStorage for migration candidate
              → Found: migrate to Supabase, go to Dashboard
              → Not found: go to UsernameSetup (new user)
     NO  → Show Onboarding or SignUp
```

Identity is resolved with a 3-tier fallback: **Supabase** (primary) > **user-specific localStorage** > **legacy localStorage**. A `useRef` guard ensures the profile check runs exactly once per Clerk user ID, preventing re-render loops.

### Real-Time Messaging

Messages are stored in the Supabase `messages` table and delivered in real-time via Supabase Realtime (`postgres_changes`). The `messageService` subscribes to:

- `INSERT` on `receiver_handle` — incoming messages
- `UPDATE` on `sender_handle` — status changes on sent messages (e.g., pending → accepted)

Messages appear optimistically in the UI and are reconciled when the server confirms.

### User Discovery

The Link page searches Supabase for users matching a query against `username` or `handle` (case-insensitive). The current user is excluded from results. Adding a contact starts a real conversation backed by the messages table.

### Lucy AI

Lucy is a conversational AI assistant powered by Claude. The Express backend streams responses via Server-Sent Events (SSE). Endpoints:

- `POST /api/chat` — Streaming conversation (Claude Sonnet)
- `POST /api/suggestions` — Quick follow-up suggestions (Claude Haiku)
- `POST /api/check-action` — Intent detection for wallet actions (Claude Haiku)

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/chat` | Lucy AI chat (streaming SSE) |
| `POST` | `/api/suggestions` | AI follow-up suggestions |
| `POST` | `/api/check-action` | AI action intent detection |
| `POST` | `/api/migrate-clerk-users` | Bulk migrate Clerk users to Supabase |

## License

Private — All rights reserved.
