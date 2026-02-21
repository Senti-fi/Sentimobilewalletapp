import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (one level up from server directory)
const envPath = path.resolve(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error.message);
  console.error('Expected .env location:', envPath);
} else {
  console.log('✅ Loaded .env from:', envPath);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Anthropic client with validation
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey || apiKey.trim() === '') {
  console.error('❌ ANTHROPIC_API_KEY is not set in environment variables!');
  console.error('Expected .env location:', envPath);
  console.error('Please ensure .env file exists with a valid ANTHROPIC_API_KEY');
  console.error('Get your API key from: https://console.anthropic.com/');
  process.exit(1);
}

console.log('✅ Anthropic API key loaded successfully');

const anthropic = new Anthropic({
  apiKey: apiKey,
});

// Initialize Supabase client (server-side, uses same env vars as frontend)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log('✅ Supabase client initialized');
} else {
  console.warn('⚠️  Supabase not configured — migration endpoint will be unavailable');
}

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
}));
app.use(express.json({ limit: '100kb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lucy-ai-backend' });
});

// Chat endpoint with streaming support
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, walletContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Build system prompt with wallet context
    const systemPrompt = buildSystemPrompt(walletContext);

    // Create streaming response from Claude
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
    });

    // Stream tokens to client
    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        const data = {
          type: 'token',
          text: chunk.delta.text,
        };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    res.write(
      `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`
    );
    res.end();
  }
});

// Generate action suggestions endpoint
app.post('/api/suggestions', async (req, res) => {
  try {
    const { lastMessage, walletContext } = req.body;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // Use Haiku for quick suggestions (cheaper & faster)
      max_tokens: 150,
      system: `You are Lucy, an AI assistant for Senti wallet. Generate 2-3 short, actionable follow-up suggestions based on the user's last message. Return ONLY a JSON array of strings, no other text.`,
      messages: [
        {
          role: 'user',
          content: `User said: "${lastMessage}"\n\nWallet context: ${JSON.stringify(walletContext)}\n\nGenerate 2-3 follow-up suggestion buttons (short phrases, max 5 words each).`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const suggestions = JSON.parse(content.text);
        res.json({ suggestions });
      } catch {
        // Fallback if AI doesn't return valid JSON
        res.json({ suggestions: [] });
      }
    } else {
      res.json({ suggestions: [] });
    }
  } catch (error: any) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: error.message, suggestions: [] });
  }
});

// Check if action should be executed
app.post('/api/check-action', async (req, res) => {
  try {
    const { message, walletContext } = req.body;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: `You are Lucy, an AI assistant for Senti wallet. Determine if the user's message requires executing an action. Return ONLY a JSON object with this format: {"action": "send" | "deposit" | "swap" | "none", "confidence": 0-1}`,
      messages: [
        {
          role: 'user',
          content: `User message: "${message}"\n\nWallet context: ${JSON.stringify(walletContext)}\n\nShould we execute an action?`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const actionData = JSON.parse(content.text);
        res.json(actionData);
      } catch {
        res.json({ action: 'none', confidence: 0 });
      }
    } else {
      res.json({ action: 'none', confidence: 0 });
    }
  } catch (error: any) {
    console.error('Error checking action:', error);
    res.status(500).json({ error: error.message, action: 'none', confidence: 0 });
  }
});

// ============================================================================
// Clerk → Supabase user migration
// ============================================================================
// Fetches ALL users from Clerk's Backend API and inserts any that are missing
// into the Supabase `users` table.  Auto-generates a username from the Clerk
// profile (first name / email prefix) so the user appears immediately.
//
// Usage:  POST http://localhost:3001/api/migrate-clerk-users
// Requires:  CLERK_SECRET_KEY in .env
// ============================================================================

/** Fetch every user from Clerk (handles pagination). */
async function fetchAllClerkUsers(secretKey: string) {
  const allUsers: any[] = [];
  let offset = 0;
  const limit = 100; // Clerk max per page

  while (true) {
    const res = await fetch(
      `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=-created_at`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Clerk API ${res.status}: ${body}`);
    }

    const users = await res.json();
    if (!Array.isArray(users) || users.length === 0) break;

    allUsers.push(...users);
    if (users.length < limit) break; // last page
    offset += limit;
  }

  return allUsers;
}

/** Turn a Clerk profile into a safe, unique-ish username candidate. */
function deriveUsername(clerkUser: any): string {
  // Try first_name, then email prefix, then a fallback
  const firstName: string = clerkUser.first_name || '';
  const emailObj = (clerkUser.email_addresses || [])[0];
  const emailPrefix: string = emailObj?.email_address?.split('@')[0] || '';

  let base = (firstName || emailPrefix || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');

  // Ensure minimum 3 chars
  if (base.length < 3) base = base + 'senti';
  // Truncate to leave room for suffix
  if (base.length > 16) base = base.slice(0, 16);

  return base;
}

/** Generate a hex wallet address (40 hex chars). */
function generateWalletAddress(): string {
  const hex = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * 16)];
  return addr;
}

app.post('/api/migrate-clerk-users', async (req, res) => {
  try {
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret) {
      return res.status(500).json({
        error: 'CLERK_SECRET_KEY is not set in .env. Get it from https://dashboard.clerk.com → API Keys.',
      });
    }
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase is not configured.' });
    }

    console.log('⏳ Fetching all users from Clerk...');
    const clerkUsers = await fetchAllClerkUsers(clerkSecret);
    console.log(`   Found ${clerkUsers.length} Clerk user(s).`);

    // Fetch existing Supabase users so we can skip them
    const { data: existingUsers } = await supabase.from('users').select('clerk_user_id, username');
    const existingClerkIds = new Set((existingUsers || []).map((u: any) => u.clerk_user_id));
    const existingUsernames = new Set((existingUsers || []).map((u: any) => u.username));

    const toInsert = [];
    let skipped = 0;

    for (const cu of clerkUsers) {
      if (existingClerkIds.has(cu.id)) {
        skipped++;
        continue;
      }

      // Derive a unique username
      let username = deriveUsername(cu);
      let attempt = 0;
      while (existingUsernames.has(username)) {
        attempt++;
        const suffix = Math.floor(Math.random() * 9000 + 1000); // 4-digit random
        username = deriveUsername(cu).slice(0, 15) + suffix;
      }
      existingUsernames.add(username); // reserve it for subsequent iterations

      const emailObj = (cu.email_addresses || [])[0];
      const email = emailObj?.email_address || '';

      toInsert.push({
        clerk_user_id: cu.id,
        username,
        handle: `@${username}.senti`,
        wallet_address: generateWalletAddress(),
        email,
        image_url: cu.image_url || '',
      });
    }

    if (toInsert.length === 0) {
      return res.json({
        message: 'All Clerk users are already in Supabase.',
        total_clerk_users: clerkUsers.length,
        already_in_supabase: skipped,
        migrated: 0,
      });
    }

    // Batch insert (Supabase supports bulk upsert)
    const { data, error } = await supabase
      .from('users')
      .upsert(toInsert, { onConflict: 'clerk_user_id' })
      .select();

    if (error) {
      console.error('Supabase bulk insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ Migrated ${data?.length || 0} user(s) to Supabase.`);

    return res.json({
      message: 'Migration complete.',
      total_clerk_users: clerkUsers.length,
      already_in_supabase: skipped,
      migrated: data?.length || 0,
      migrated_users: (data || []).map((u: any) => ({
        clerk_user_id: u.clerk_user_id,
        username: u.username,
        handle: u.handle,
        email: u.email,
      })),
    });
  } catch (err: any) {
    console.error('Migration error:', err);
    return res.status(500).json({ error: err.message });
  }
});

function buildSystemPrompt(walletContext?: any): string {
  const basePrompt = `You are Lucy, an AI assistant for Senti - a modern crypto wallet app built on Solana. Your role is to help users:

- Check balances and understand their portfolio
- Find and recommend the best vaults/yield opportunities
- Send and receive money easily
- Understand DeFi concepts in simple terms
- Manage savings goals and budgets
- Explain fees and transactions

Key features to highlight:
- Zero transaction fees (Senti covers them)
- Layer 2 technology for fast, cheap swaps
- Easy vault deposits for earning yield
- Simple savings goals with automated tracking
- Budget insights and spending alerts

Personality:
- Friendly, helpful, and encouraging
- Use simple language, avoid jargon
- Be concise and compact - keep responses short (2-3 sentences max)
- Celebrate user wins and progress
- Proactively suggest ways to grow their money

CRITICAL FORMATTING RULES:
- NEVER use markdown formatting (no asterisks, no bold, no italic)
- NEVER use special characters for emphasis
- Use plain text only - write naturally without any markup
- Keep responses compact and to the point
- Break long responses into short, digestible sentences

IMPORTANT RULES:
- Never give specific financial advice or guarantee returns
- Always mention risks when discussing yield/vaults
- Be accurate about fees and APY rates
- If you don't know something, say so
- Format numbers as USD with $ symbol (e.g., $1,234.56)
- Avoid using emojis`;

  if (walletContext) {
    return `${basePrompt}

CURRENT WALLET CONTEXT:
${JSON.stringify(walletContext, null, 2)}

Use this context to personalize your responses. Reference actual balances, holdings, and goals when relevant.`;
  }

  return basePrompt;
}

app.listen(PORT, () => {
  console.log(`🚀 Lucy AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
