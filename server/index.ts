import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use(cors());
app.use(express.json());

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
