// Lucy AI Service - Handles communication with backend API

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Message {
  id: string;
  type: 'user' | 'lucy';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  isStreaming?: boolean;
}

export interface WalletContext {
  totalBalance?: number;
  balances?: {
    usdc?: number;
    usdt?: number;
    sol?: number;
  };
  vaults?: Array<{
    name: string;
    balance: number;
    apy: number;
  }>;
  savingsGoals?: Array<{
    name: string;
    target: number;
    current: number;
  }>;
  monthlyBudget?: number;
  currentSpend?: number;
  recentTransactions?: Array<{
    type: string;
    amount: number;
    timestamp: string;
  }>;
}

export interface ActionResponse {
  action: 'send' | 'deposit' | 'swap' | 'none';
  confidence: number;
}

export class LucyService {
  private static instance: LucyService;
  private abortController: AbortController | null = null;

  static getInstance(): LucyService {
    if (!LucyService.instance) {
      LucyService.instance = new LucyService();
    }
    return LucyService.instance;
  }

  /**
   * Send a message and stream the response
   */
  async streamChat(
    messages: Message[],
    walletContext: WalletContext,
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    // Cancel any existing stream
    this.cancelStream();

    this.abortController = new AbortController();

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map((msg) => ({
            type: msg.type,
            text: msg.text,
          })),
          walletContext,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        // Decode and process SSE data
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'token') {
                onToken(data.text);
              } else if (data.type === 'done') {
                onComplete();
                return;
              } else if (data.type === 'error') {
                onError(new Error(data.message || 'Unknown error'));
                return;
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Stream was cancelled, this is expected
        return;
      }
      onError(error);
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Cancel the current streaming request
   */
  cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Generate follow-up suggestions for a message
   */
  async generateSuggestions(
    lastMessage: string,
    walletContext: WalletContext
  ): Promise<string[]> {
    try {
      const response = await fetch(`${API_URL}/api/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastMessage,
          walletContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  }

  /**
   * Check if a message requires an action (send, deposit, etc.)
   */
  async checkAction(
    message: string,
    walletContext: WalletContext
  ): Promise<ActionResponse> {
    try {
      const response = await fetch(`${API_URL}/api/check-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          walletContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to check action:', error);
      return { action: 'none', confidence: 0 };
    }
  }

  /**
   * Health check for the backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default LucyService.getInstance();
