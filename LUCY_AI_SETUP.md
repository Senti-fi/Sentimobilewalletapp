# Lucy AI Integration - Setup Guide

This document explains how to set up and use the **real AI integration** for Lucy, powered by Anthropic's Claude API.

## Features Implemented

✅ **Streaming Responses** - Real-time token streaming with typing indicators
✅ **Action Execution** - Lucy can trigger Send/Deposit/Swap modals automatically
✅ **Wallet Context** - Personalized responses using real wallet data
✅ **Conversation Memory** - AI remembers context throughout the conversation
✅ **Local Storage** - Chat history persists across sessions
✅ **Health Monitoring** - Backend status indicator with retry logic
✅ **Error Handling** - Graceful fallbacks and user-friendly error messages

---

## Prerequisites

1. **Anthropic API Key**
   - Sign up at https://console.anthropic.com/
   - Create an API key
   - You'll need this for the backend to work

2. **Node.js** - Version 18+ recommended
3. **pnpm** - Package manager (already installed)

---

## Setup Instructions

### 1. Configure Environment Variables

Open the `.env` file in the project root and add your Anthropic API key:

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
PORT=3001
VITE_API_URL=http://localhost:3001
```

**⚠️ Important:** Never commit your `.env` file to git! It's already in `.gitignore`.

### 2. Run the Application

You have two options:

#### Option A: Run Everything at Once (Recommended)

```bash
pnpm dev:all
```

This starts both the frontend (Vite) and backend (Express) servers concurrently.

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

#### Option B: Run Separately

Terminal 1 - Frontend:
```bash
pnpm dev
```

Terminal 2 - Backend:
```bash
pnpm server
```

---

## How It Works

### Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Frontend  │ ───> │   Backend    │ ───> │  Anthropic API  │
│  (React)    │ <─── │  (Express)   │ <─── │    (Claude)     │
└─────────────┘      └──────────────┘      └─────────────────┘
     │
     ├─ LucyPage.tsx       - Chat UI
     ├─ lucyService.ts     - API client
     ├─ chatStorage.ts     - Local storage
     └─ useWalletContext   - Wallet data hook
```

### Backend API Endpoints

1. **POST `/api/chat`** - Streaming chat responses
   - Accepts: `{ messages, walletContext }`
   - Returns: Server-Sent Events (SSE) stream

2. **POST `/api/suggestions`** - Generate follow-up suggestions
   - Accepts: `{ lastMessage, walletContext }`
   - Returns: `{ suggestions: string[] }`

3. **POST `/api/check-action`** - Detect if action needed
   - Accepts: `{ message, walletContext }`
   - Returns: `{ action: 'send'|'deposit'|'swap'|'none', confidence: 0-1 }`

4. **GET `/health`** - Backend health check
   - Returns: `{ status: 'ok', service: 'lucy-ai-backend' }`

### Wallet Context

Lucy receives real-time wallet data for personalized responses:

```typescript
{
  totalBalance: 13170.50,
  balances: {
    usdc: 5420.50,
    usdt: 3500.00,
    sol: 4250.00
  },
  vaults: [{
    name: "Senti Vault",
    balance: 2500.00,
    apy: 8.5
  }],
  recentTransactions: [...]
}
```

---

## Usage

### Testing Lucy

1. **Open the app** at http://localhost:5173
2. **Navigate to Lucy tab** (center icon in bottom nav)
3. **Check the status indicator:**
   - 🟢 Green = Backend online (ready to use)
   - 🔴 Red = Backend offline (start server)
   - 🟡 Yellow = Checking...

4. **Try these queries:**
   - "What's my total balance?"
   - "Show me the best vault options"
   - "I want to send $50 to a friend"
   - "Explain network fees to me"
   - "How can I grow my money?"

### Action Execution

When Lucy detects high-confidence actions, she'll automatically open the relevant modal:

- **"I want to send money"** → Opens Send modal
- **"Help me deposit to a vault"** → Opens Grow modal
- **"Swap USDC to SOL"** → Opens Swap modal

You can still confirm/cancel these actions in the modal.

### Chat History

- **Auto-save:** Conversations save automatically to localStorage
- **Load previous chats:** Click on recent conversations
- **New conversation:** Click "New Chat" button
- **Persistence:** Survives page refreshes
- **Limits:** Keeps last 10 conversations, 50 messages each

---

## Models Used

- **Chat:** `claude-3-5-sonnet-20241022` - High quality, conversational
- **Suggestions:** `claude-3-5-haiku-20241022` - Fast, cost-efficient
- **Actions:** `claude-3-5-haiku-20241022` - Quick decision making

### Cost Optimization

The system uses:
- Haiku for quick tasks (suggestions, action detection) - **cheaper**
- Sonnet for main chat - **higher quality**
- Streaming for better UX

Estimated cost: ~$0.01-0.05 per conversation depending on length.

---

## Customization

### Changing Lucy's Personality

Edit `server/index.ts`, function `buildSystemPrompt()`:

```typescript
const basePrompt = `You are Lucy, an AI assistant...
Personality:
- Friendly, helpful, and encouraging
- Use simple language, avoid jargon
- Be concise but informative
...`;
```

### Adjusting Action Confidence Threshold

Edit `src/app/components/LucyPage.tsx`, line 229:

```typescript
if (actionResult.confidence > 0.7) {  // Default: 70% confidence
  // Execute action
}
```

Lower = more proactive (may trigger incorrectly)
Higher = more cautious (may miss opportunities)

### Adding More Context

Edit `src/hooks/useWalletContext.ts` to include additional data:

```typescript
if (savingsGoals) context.savingsGoals = savingsGoals;
if (monthlyBudget) context.monthlyBudget = monthlyBudget;
// Add your own data here
```

---

## Troubleshooting

### Backend Won't Start

**Issue:** `Error: Missing ANTHROPIC_API_KEY`

**Solution:**
1. Check `.env` file exists in project root
2. Verify API key is correct and starts with `sk-ant-api03-`
3. Restart the server: `pnpm server`

---

### No Streaming Responses

**Issue:** Messages appear all at once instead of streaming

**Solution:**
1. Check backend is running (`http://localhost:3001/health`)
2. Verify `VITE_API_URL` in `.env` is correct
3. Check browser console for CORS errors
4. Try refreshing the page

---

### Chat History Not Saving

**Issue:** Conversations disappear on page refresh

**Solution:**
1. Check localStorage is enabled in browser
2. Open DevTools → Application → Local Storage
3. Look for `lucy_chat_history` key
4. Clear and try again if corrupted

---

### Action Modals Not Opening

**Issue:** Lucy detects actions but modals don't open

**Solution:**
1. Check Dashboard passes modal handlers to LucyPage
2. Verify `onOpenSendModal`, `onOpenDepositModal`, `onOpenSwapModal` props
3. Check console for errors

---

## Production Deployment

### Environment Variables

For production, update `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-production-key
PORT=3001
VITE_API_URL=https://your-backend.com
```

### Backend Hosting

Deploy the backend separately:

**Recommended platforms:**
- Railway.app
- Render.com
- Fly.io
- AWS Lambda (serverless)

**Example: Railway.app**
1. Connect your GitHub repo
2. Set environment variable: `ANTHROPIC_API_KEY`
3. Deploy the `server/` directory
4. Update `VITE_API_URL` to Railway URL

### Frontend Hosting

Deploy frontend as usual:
- Vercel
- Netlify
- Cloudflare Pages

Make sure to set `VITE_API_URL` to your backend URL.

---

## Security Notes

⚠️ **Never expose your API key in the frontend code!**

- API key is only used in the backend
- Backend proxies requests to Anthropic
- Frontend only talks to your backend
- CORS is enabled for development (restrict in production)

---

## File Structure

```
/
├── server/
│   └── index.ts              # Backend API server
├── src/
│   ├── app/components/
│   │   ├── LucyPage.tsx      # Main chat UI
│   │   ├── LucyChip.tsx      # Reusable Lucy button
│   │   └── Dashboard.tsx     # Updated with wallet context
│   ├── services/
│   │   ├── lucyService.ts    # API client (streaming, suggestions, actions)
│   │   └── chatStorage.ts    # Local storage manager
│   └── hooks/
│       └── useWalletContext.ts  # Wallet data compiler
├── .env                       # Environment variables (DO NOT COMMIT)
├── .env.example               # Template for .env
└── LUCY_AI_SETUP.md          # This file
```

---

## Next Steps

### Suggested Enhancements

1. **Voice Input** - Add speech-to-text for hands-free chat
2. **Rich Responses** - Display charts, tables, transaction previews
3. **Proactive Notifications** - Lucy suggests optimizations based on spending
4. **Multi-language** - Support for non-English conversations
5. **Analytics** - Track popular queries and improve responses
6. **Smart Contracts** - Lucy can explain vault mechanics in detail

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Anthropic docs: https://docs.anthropic.com/
3. Check browser console for errors
4. Verify backend logs for API errors

---

## License

This integration is part of the Senti mobile wallet app.

---

**Enjoy your AI-powered wallet assistant! 🚀**
