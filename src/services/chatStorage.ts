// Chat History Local Storage Service

import { Message } from './lucyService';

const STORAGE_KEY = 'lucy_chat_history';
const MAX_CONVERSATIONS = 10; // Keep last 10 conversations
const MAX_MESSAGES_PER_CONVERSATION = 50; // Keep last 50 messages per conversation

export interface Conversation {
  id: string;
  title: string; // Auto-generated from first user message
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export class ChatStorage {
  private static instance: ChatStorage;

  static getInstance(): ChatStorage {
    if (!ChatStorage.instance) {
      ChatStorage.instance = new ChatStorage();
    }
    return ChatStorage.instance;
  }

  /**
   * Save current conversation to local storage
   */
  saveConversation(messages: Message[]): string {
    if (messages.length === 0) return '';

    const conversations = this.getAllConversations();

    // Find if we're updating an existing conversation (check if current session has ID)
    const currentId = sessionStorage.getItem('current_conversation_id');

    let conversation: Conversation;

    if (currentId) {
      // Update existing conversation
      const existing = conversations.find(c => c.id === currentId);
      if (existing) {
        existing.messages = messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
        existing.updatedAt = new Date();
        conversation = existing;
      } else {
        // Create new if not found
        conversation = this.createNewConversation(messages);
        conversations.unshift(conversation);
      }
    } else {
      // Create new conversation
      conversation = this.createNewConversation(messages);
      conversations.unshift(conversation);
    }

    // Keep only MAX_CONVERSATIONS
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    // Save current conversation ID to session
    sessionStorage.setItem('current_conversation_id', conversation.id);

    return conversation.id;
  }

  /**
   * Create a new conversation
   */
  private createNewConversation(messages: Message[]): Conversation {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate title from first user message (max 50 chars)
    const firstUserMsg = messages.find(m => m.type === 'user');
    const title = firstUserMsg
      ? firstUserMsg.text.slice(0, 50) + (firstUserMsg.text.length > 50 ? '...' : '')
      : 'New conversation';

    return {
      id,
      title,
      messages: messages.slice(-MAX_MESSAGES_PER_CONVERSATION),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get all conversations
   */
  getAllConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const conversations = JSON.parse(data);

      // Convert date strings back to Date objects
      return conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  }

  /**
   * Get a specific conversation by ID
   */
  getConversation(id: string): Conversation | null {
    const conversations = this.getAllConversations();
    return conversations.find(c => c.id === id) || null;
  }

  /**
   * Load current session's conversation
   */
  loadCurrentConversation(): Message[] | null {
    const currentId = sessionStorage.getItem('current_conversation_id');
    if (!currentId) return null;

    const conversation = this.getConversation(currentId);
    return conversation?.messages || null;
  }

  /**
   * Start a new conversation (clear current session)
   */
  startNewConversation(): void {
    sessionStorage.removeItem('current_conversation_id');
  }

  /**
   * Delete a conversation
   */
  deleteConversation(id: string): void {
    const conversations = this.getAllConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Clear current session if it's the deleted conversation
    const currentId = sessionStorage.getItem('current_conversation_id');
    if (currentId === id) {
      sessionStorage.removeItem('current_conversation_id');
    }
  }

  /**
   * Clear all conversations
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('current_conversation_id');
  }

  /**
   * Get recent conversations for quick access (last 3)
   */
  getRecentConversations(limit: number = 3): Array<{
    id: string;
    preview: string;
    time: string;
  }> {
    const conversations = this.getAllConversations();

    return conversations
      .slice(0, limit)
      .map(conv => ({
        id: conv.id,
        preview: conv.title,
        time: this.formatTimeAgo(conv.updatedAt),
      }));
  }

  /**
   * Format time ago string
   */
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  }
}

export default ChatStorage.getInstance();
