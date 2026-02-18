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
  unread_count: number;
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
   * Update a message status (e.g. pending → accepted, sent → delivered)
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
   * Mark multiple messages as delivered (when they arrive in the receiver's app)
   */
  async markAsDelivered(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;

    const { error } = await supabase
      .from('messages')
      .update({ status: 'delivered' })
      .in('id', messageIds)
      .eq('status', 'sent');

    if (error) {
      console.error('Error marking messages as delivered:', error);
    }
  }

  /**
   * Mark all messages in a conversation as read (when the receiver opens the chat)
   */
  async markAsRead(myHandle: string, contactHandle: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('sender_handle', contactHandle)
      .eq('receiver_handle', myHandle)
      .in('status', ['sent', 'delivered']);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
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
   * Returns a list of contact handles with their last message and unread count.
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

    // Group by the OTHER person's handle, keep the latest message + count unreads
    const latestByContact = new Map<string, ChatMessage>();
    const unreadCounts = new Map<string, number>();

    for (const msg of data || []) {
      const otherHandle = msg.sender_handle === myHandle
        ? msg.receiver_handle
        : msg.sender_handle;

      if (!latestByContact.has(otherHandle)) {
        latestByContact.set(otherHandle, msg);
      }

      // Count messages from the OTHER person that haven't been read
      if (
        msg.sender_handle !== myHandle &&
        msg.type === 'text' &&
        (msg.status === 'sent' || msg.status === 'delivered')
      ) {
        unreadCounts.set(otherHandle, (unreadCounts.get(otherHandle) || 0) + 1);
      }
    }

    return Array.from(latestByContact.entries()).map(([handle, msg]) => ({
      contact_handle: handle,
      last_message: msg.content,
      last_message_time: msg.created_at,
      unread_count: unreadCounts.get(handle) || 0,
    }));
  }

  /**
   * Subscribe to real-time messages for the current user.
   * Listens for:
   *   - INSERT where receiver_handle = myHandle (incoming messages)
   *   - UPDATE where sender_handle = myHandle (status changes on messages I sent)
   *   - UPDATE where receiver_handle = myHandle (status changes on messages I received)
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
          // Status changes on messages I sent (e.g. sent→delivered→read)
          onMessage(payload.new as ChatMessage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_handle=eq.${myHandle}`,
        },
        (payload) => {
          // Status changes on messages I received (e.g. transaction accepted/declined)
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
