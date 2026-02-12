// Real-time messaging service using Supabase
// Handles sending, receiving, and subscribing to messages between users

import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  sender_handle: string;
  receiver_handle: string;
  content: string;
  type: 'text' | 'transaction' | 'request';
  amount?: number;
  asset?: string;
  status: string;
  created_at: string;
}

export interface ConversationPreview {
  contact_handle: string;
  last_message: string;
  last_message_time: string;
  unread: boolean;
}

class MessageService {
  private channel: RealtimeChannel | null = null;

  /**
   * Send a text message
   */
  async sendMessage(
    senderHandle: string,
    receiverHandle: string,
    content: string,
  ): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_handle: senderHandle,
        receiver_handle: receiverHandle,
        content,
        type: 'text',
        status: 'sent',
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    return data;
  }

  /**
   * Send a transaction message (payment linked)
   */
  async sendTransaction(
    senderHandle: string,
    receiverHandle: string,
    amount: number,
    asset: string,
    status: string = 'pending',
  ): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_handle: senderHandle,
        receiver_handle: receiverHandle,
        content: `Payment of $${amount} ${asset}`,
        type: 'transaction',
        amount,
        asset,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending transaction:', error);
      return null;
    }
    return data;
  }

  /**
   * Update a message status (e.g. pending → accepted)
   */
  async updateMessageStatus(messageId: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', messageId);

    if (error) {
      console.error('Error updating message status:', error);
      return false;
    }
    return true;
  }

  /**
   * Load conversation between two users (both directions)
   */
  async getConversation(
    handleA: string,
    handleB: string,
    limit: number = 100,
  ): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_handle.eq.${handleA},receiver_handle.eq.${handleB}),` +
        `and(sender_handle.eq.${handleB},receiver_handle.eq.${handleA})`
      )
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error loading conversation:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Get the latest message for each conversation the user is part of.
   * Returns a list of contact handles with their last message.
   */
  async getConversationPreviews(myHandle: string): Promise<ConversationPreview[]> {
    // Fetch recent messages involving this user
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_handle.eq.${myHandle},receiver_handle.eq.${myHandle}`)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('Error loading conversations:', error);
      return [];
    }

    // Group by the OTHER person's handle, keep only the latest message
    const latestByContact = new Map<string, ChatMessage>();
    for (const msg of data || []) {
      const otherHandle = msg.sender_handle === myHandle
        ? msg.receiver_handle
        : msg.sender_handle;

      if (!latestByContact.has(otherHandle)) {
        latestByContact.set(otherHandle, msg);
      }
    }

    return Array.from(latestByContact.entries()).map(([handle, msg]) => ({
      contact_handle: handle,
      last_message: msg.content,
      last_message_time: msg.created_at,
      unread: msg.sender_handle !== myHandle && msg.status === 'sent',
    }));
  }

  /**
   * Subscribe to real-time messages for the current user.
   * Calls `onMessage` whenever a new message arrives for `myHandle`.
   */
  subscribe(myHandle: string, onMessage: (msg: ChatMessage) => void): void {
    // Unsubscribe from previous channel if any
    this.unsubscribe();

    this.channel = supabase
      .channel(`messages:${myHandle}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_handle=eq.${myHandle}`,
        },
        (payload) => {
          onMessage(payload.new as ChatMessage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `sender_handle=eq.${myHandle}`,
        },
        (payload) => {
          // Notify about status updates on messages we sent
          onMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();
  }

  /**
   * Unsubscribe from real-time messages
   */
  unsubscribe(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

export const messageService = new MessageService();
