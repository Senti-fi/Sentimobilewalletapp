
# Senti Mobile Wallet App

This is a code bundle for Senti Mobile Wallet App. The original project is available at https://www.figma.com/design/S78E2nWuJBIyybaAlbUE4E/Senti-Mobile-Wallet-App.

## Running the code

### Quick Start (Recommended)

Run `pnpm i` to install the dependencies.

Run `pnpm dev` to start **both** the frontend and Lucy AI backend automatically.

This will start:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

The Lucy AI Assistant will automatically connect to the backend and be ready to use immediately!

### Alternative: Run Components Separately

If you need to run the frontend or backend separately:

```bash
# Frontend only
pnpm dev:frontend

# Backend only
pnpm dev:backend
```

## Lucy AI Assistant

The app includes Lucy, an AI assistant powered by Anthropic's Claude API. Lucy can help with:
- Checking balances and portfolio analysis
- Finding the best vaults and yield opportunities
- Sending and receiving money
- Explaining DeFi concepts in simple terms
- Managing savings goals and budgets
- Understanding fees and transactions

### Features
- **Auto-start:** Backend starts automatically with `pnpm dev`
- **Auto-reconnect:** Automatically reconnects if backend is temporarily offline
- **Smart health checks:** Retries connection with exponential backoff
- **Persistent conversations:** Chat history saved locally
- **Streaming responses:** Real-time AI responses with smooth typing effect

For detailed Lucy AI setup and customization, see [LUCY_AI_SETUP.md](./LUCY_AI_SETUP.md)
