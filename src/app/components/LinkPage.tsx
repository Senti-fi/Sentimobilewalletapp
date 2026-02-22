import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Search,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  Plus,
  XCircle,
  Check,
  CheckCheck
} from 'lucide-react';
import LinkSendModal from './LinkSendModal';
import { userService, UserProfile } from '../../services/supabase';
import { messageService, ChatMessage } from '../../services/messageService';

// Shape used for search results and contacts
interface DiscoverableUser {
  id: string;
  name: string;
  online: boolean;
  image_url?: string;
}

const getRandomGradient = () => {
  const gradients = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-pink-400 to-pink-600',
    'from-orange-400 to-orange-600',
    'from-cyan-400 to-cyan-600',
    'from-indigo-400 to-indigo-600',
    'from-rose-400 to-rose-600',
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

interface Contact {
  id: string;
  name: string;
  avatar: string;
  color: string;
  lastMessage: string;
  lastMessageTime: string;
  online: boolean;
  image_url?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  type: 'text' | 'transaction' | 'request';
  content: string;
  sender: 'me' | 'them';
  timestamp: Date;
  amount?: number;
  asset?: string;
  status?: 'pending' | 'completed' | 'failed' | 'accepted' | 'declined' | 'sent' | 'delivered' | 'read';
}

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  change: number;
  changePercent: number;
  color: string;
  gradient: string;
  icon: string;
}

interface LinkPageProps {
  assets: Asset[];
  onSend: (amount: number, asset: string, recipient: string, recipientName: string, gasFee: number) => void;
  onReceive?: (amount: number, asset: string, sender: string, senderName: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

function toLocalMessage(msg: ChatMessage, myHandle: string): Message {
  return {
    id: msg.id,
    type: msg.type as Message['type'],
    content: msg.content,
    sender: msg.sender_handle === myHandle ? 'me' : 'them',
    timestamp: new Date(msg.created_at),
    amount: msg.amount ? Number(msg.amount) : undefined,
    asset: msg.asset || undefined,
    status: msg.status as Message['status'],
  };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

// ── Delivery / Read receipt indicator for sent messages ──
function MessageStatus({ status }: { status?: Message['status'] }) {
  if (!status) return null;

  if (status === 'read') {
    return <CheckCheck className="w-3.5 h-3.5 text-blue-400 inline-block ml-1" />;
  }
  if (status === 'delivered') {
    return <CheckCheck className="w-3.5 h-3.5 text-white/50 inline-block ml-1" />;
  }
  // 'sent' — single check
  return <Check className="w-3.5 h-3.5 text-white/50 inline-block ml-1" />;
}

export default function LinkPage({ assets, onSend, onReceive, onUnreadCountChange }: LinkPageProps) {
  const myHandle = localStorage.getItem('senti_user_handle') || '';

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);

  const loadContacts = (): Contact[] => {
    try {
      const stored = localStorage.getItem('senti_contacts');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure unreadCount exists on legacy contacts
        return parsed.map((c: any) => ({ ...c, unreadCount: c.unreadCount || 0 }));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
    return [];
  };

  const [contacts, setContacts] = useState<Contact[]>(loadContacts);
  const [searchResults, setSearchResults] = useState<DiscoverableUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep selectedContact in a ref so the realtime callback always has the latest value
  const selectedContactRef = useRef<Contact | null>(null);
  selectedContactRef.current = selectedContact;

  // Save contacts to localStorage
  useEffect(() => {
    localStorage.setItem('senti_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // ── Load conversation previews from Supabase on mount ──
  useEffect(() => {
    if (!myHandle) return;

    messageService.getConversationPreviews(myHandle).then(previews => {
      if (previews.length === 0) return;

      setContacts(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const updated = [...prev];

        for (const p of previews) {
          const idx = updated.findIndex(c => c.id === p.contact_handle);
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              lastMessage: p.last_message,
              lastMessageTime: formatTimeAgo(new Date(p.last_message_time)),
              unreadCount: p.unread_count,
            };
          } else if (!existingIds.has(p.contact_handle)) {
            const username = p.contact_handle.replace('@', '').replace('.senti', '');
            updated.unshift({
              id: p.contact_handle,
              name: username.charAt(0).toUpperCase() + username.slice(1),
              avatar: '👤',
              color: getRandomGradient(),
              lastMessage: p.last_message,
              lastMessageTime: formatTimeAgo(new Date(p.last_message_time)),
              online: true,
              unreadCount: p.unread_count,
            });
          }
        }
        return updated;
      });
    });
  }, [myHandle]);

  // ── Subscribe to real-time incoming messages ──
  useEffect(() => {
    if (!myHandle) return;

    messageService.subscribe(myHandle, (incoming: ChatMessage) => {
      const localMsg = toLocalMessage(incoming, myHandle);
      const currentContact = selectedContactRef.current;
      const isFromOther = incoming.sender_handle !== myHandle;

      // If it belongs to the currently open conversation, add/update it
      if (
        currentContact &&
        (incoming.sender_handle === currentContact.id ||
         incoming.receiver_handle === currentContact.id)
      ) {
        setMessages(prev => {
          const exists = prev.find(m => m.id === incoming.id);
          if (exists) {
            return prev.map(m => m.id === incoming.id ? localMsg : m);
          }
          return [...prev, localMsg];
        });

        // If we're viewing this conversation and it's a new incoming text, mark as read + delivered
        if (isFromOther && incoming.type === 'text' && (incoming.status === 'sent' || incoming.status === 'delivered')) {
          messageService.markAsRead(myHandle, currentContact.id);
        }
      }

      // Determine the other person's handle
      const otherHandle = incoming.sender_handle === myHandle
        ? incoming.receiver_handle
        : incoming.sender_handle;

      // Update the contact list's last message + unread count
      setContacts(prev => {
        const idx = prev.findIndex(c => c.id === otherHandle);
        if (idx >= 0) {
          const updated = [...prev];
          const isInOpenChat = currentContact?.id === otherHandle;
          const isNewUnread = isFromOther && incoming.type === 'text' &&
            (incoming.status === 'sent' || incoming.status === 'delivered') && !isInOpenChat;

          updated[idx] = {
            ...updated[idx],
            lastMessage: incoming.content,
            lastMessageTime: 'Just now',
            unreadCount: isNewUnread
              ? updated[idx].unreadCount + 1
              : updated[idx].unreadCount,
          };
          return updated;
        }
        // New contact from incoming message
        const username = otherHandle.replace('@', '').replace('.senti', '');
        return [{
          id: otherHandle,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          avatar: '👤',
          color: getRandomGradient(),
          lastMessage: incoming.content,
          lastMessageTime: 'Just now',
          online: true,
          unreadCount: isFromOther && incoming.type === 'text' ? 1 : 0,
        }, ...prev];
      });

      // Auto-mark incoming text messages as delivered (so sender sees double-check)
      if (isFromOther && incoming.type === 'text' && incoming.status === 'sent') {
        messageService.markAsDelivered([incoming.id]);
      }
    });

    return () => messageService.unsubscribe();
  }, [myHandle]);

  // ── Load messages when a contact is selected ──
  useEffect(() => {
    if (!selectedContact || !myHandle) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    messageService.getConversation(myHandle, selectedContact.id).then(msgs => {
      setMessages(msgs.map(m => toLocalMessage(m, myHandle)));
      setIsLoadingMessages(false);

      // Mark all unread messages as read when opening the conversation
      messageService.markAsRead(myHandle, selectedContact.id);

      // Clear the unread count for this contact
      setContacts(prev => prev.map(c =>
        c.id === selectedContact.id ? { ...c, unreadCount: 0 } : c
      ));
    });
  }, [selectedContact, myHandle]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => { if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current); };
  }, [messages]);

  // ── Search Supabase for real users ──
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const currentAuthId = localStorage.getItem('senti_auth_user_id') || '';
        const results = await userService.searchUsers(searchQuery, currentAuthId);
        if (abortController.signal.aborted) return;

        const contactIds = new Set(contacts.map(c => c.id));
        const filtered: DiscoverableUser[] = results
          .filter((u: UserProfile) => !contactIds.has(u.handle))
          .map((u: UserProfile) => ({
            id: u.handle,
            name: `${u.username.charAt(0).toUpperCase() + u.username.slice(1)} Senti`,
            online: true,
            image_url: u.image_url,
          }));

        setSearchResults(filtered);
      } catch (err) {
        console.error('User search failed:', err);
        setSearchResults([]);
      } finally {
        if (!abortController.signal.aborted) setIsSearching(false);
      }
    }, 350);

    return () => { clearTimeout(timer); abortController.abort(); };
  }, [searchQuery, contacts]);

  // ── Send a real message ──
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedContact || !myHandle) return;

    const content = messageInput.trim();
    setMessageInput('');

    const optimisticId = `opt-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: optimisticId, type: 'text', content, sender: 'me', timestamp: new Date(), status: 'sent',
    }]);

    const sent = await messageService.sendMessage(myHandle, selectedContact.id, content);
    if (sent) {
      setMessages(prev => prev.map(m => m.id === optimisticId ? toLocalMessage(sent, myHandle) : m));
    }

    setContacts(prev => prev.map(c =>
      c.id === selectedContact.id ? { ...c, lastMessage: content, lastMessageTime: 'Just now' } : c
    ));
  }, [messageInput, selectedContact, myHandle]);

  const handleAddContact = (user: DiscoverableUser) => {
    const newContact: Contact = {
      id: user.id, name: user.name, avatar: '👤', color: getRandomGradient(),
      lastMessage: 'Start a conversation', lastMessageTime: 'New',
      online: user.online, image_url: user.image_url, unreadCount: 0,
    };
    setContacts(prev => [newContact, ...prev]);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedContact(newContact);
  };

  const handleAcceptPayment = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message?.amount || !message?.asset) return;

    await messageService.updateMessageStatus(messageId, 'accepted');
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, status: 'accepted' as const, content: `Accepted $${msg.amount} ${msg.asset}` } : msg
    ));

    if (onReceive && selectedContact) {
      onReceive(message.amount, message.asset, selectedContact.id, selectedContact.name);
    }
  };

  const handleDeclinePayment = async (messageId: string) => {
    await messageService.updateMessageStatus(messageId, 'declined');
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, status: 'declined' as const, content: 'Declined payment' } : msg
    ));
  };

  const handleTransactionComplete = async (amount: number, asset: string, shouldFail: boolean = false, gasFee: number = 0) => {
    if (!selectedContact || !myHandle) return;

    const optimisticId = `opt-tx-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: optimisticId, type: 'transaction', content: 'Payment linking', sender: 'me',
      timestamp: new Date(), amount, asset, status: 'pending',
    }]);

    if (shouldFail) {
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === optimisticId ? { ...msg, status: 'failed' as const, content: 'Payment failed' } : msg
        ));
      }, 2000);
      return;
    }

    const sent = await messageService.sendTransaction(myHandle, selectedContact.id, amount, asset, 'pending');

    if (sent) {
      setMessages(prev => prev.map(m => m.id === optimisticId ? toLocalMessage(sent, myHandle) : m));
      onSend(amount, asset, selectedContact.id, selectedContact.name, gasFee);
      // No auto-accept — the receiver must click Accept to deposit the funds
    } else {
      setMessages(prev => prev.map(msg =>
        msg.id === optimisticId ? { ...msg, status: 'failed' as const, content: 'Payment failed' } : msg
      ));
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Total unread across all contacts — push to parent for nav badge
  const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  useEffect(() => {
    onUnreadCountChange?.(totalUnread);
  }, [totalUnread, onUnreadCountChange]);

  // ═══════════════════════════════════════════════════════════════
  // Contacts List View
  // ═══════════════════════════════════════════════════════════════
  if (!selectedContact) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 px-6 pt-6 pb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Link</h1>
            <p className="text-sm text-gray-500">Send money instantly using IDs</p>
          </div>
        </motion.div>

        <div className="flex-shrink-0 px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search @username to find friends"
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {!searchQuery && (
            <p className="text-xs text-gray-500 mt-2 text-center">Type a username to find and add friends</p>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-24 space-y-2">
          <AnimatePresence>
            {(searchResults.length > 0 || (searchQuery.length >= 2 && isSearching)) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />Find Users
                  </h3>
                  {isSearching && (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full" />
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((user, index) => (
                      <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 flex items-center gap-4 border-2 border-blue-100">
                        <div className="relative">
                          {user.image_url ? (
                            <img src={user.image_url} alt={user.name} className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center text-white font-semibold">
                              {user.name.slice(0, 2)}
                            </div>
                          )}
                          {user.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-gray-900 font-medium">{user.name}</p>
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          </div>
                          <p className="text-xs text-gray-500">{user.id}</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddContact(user)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg transition-shadow">
                          <Plus className="w-4 h-4" />Add
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 && !isSearching ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200">
                    <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No users found for "{searchQuery}"</p>
                    <p className="text-xs text-gray-400 mt-1">Try searching for @username</p>
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900">Contacts</h3>
            <span className="text-xs text-gray-500">{filteredContacts.length} contacts</span>
          </div>

          {filteredContacts.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No contacts yet</p>
              <p className="text-xs text-gray-400 mt-1">Search for users above to start chatting</p>
            </div>
          )}

          {filteredContacts.map((contact, index) => (
            <motion.div key={contact.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setSelectedContact(contact)}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
              <div className="relative">
                {contact.image_url ? (
                  <img src={contact.image_url} alt={contact.name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center text-white text-xl`}>{contact.avatar}</div>
                )}
                {contact.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900">{contact.name}</p>
                <p className="text-xs text-gray-500">{contact.id}</p>
                <p className="text-xs text-gray-400 truncate mt-1">{contact.lastMessage}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-xs text-gray-400">{contact.lastMessageTime}</p>
                {contact.unreadCount > 0 ? (
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-sm">
                    {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                  </div>
                ) : (
                  <MessageCircle className="w-5 h-5 text-gray-300" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Chat View
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Chat Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 px-6 pt-6 pb-4 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-20">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedContact(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          <div className="relative">
            {selectedContact.image_url ? (
              <img src={selectedContact.image_url} alt={selectedContact.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className={`w-10 h-10 bg-gradient-to-br ${selectedContact.color} rounded-xl flex items-center justify-center text-white`}>{selectedContact.avatar}</div>
            )}
            {selectedContact.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
          </div>
          <div className="flex-1">
            <p className="text-gray-900">{selectedContact.name}</p>
            <p className="text-xs text-gray-500">{selectedContact.id}</p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-3 z-[5] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoadingMessages && (
          <div className="flex justify-center py-8">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full" />
          </div>
        )}

        {!isLoadingMessages && messages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Say hello to start the conversation!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.5) }}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>

            {message.type === 'text' ? (
              <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] px-4 py-2.5 rounded-2xl ${
                message.sender === 'me'
                  ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-white'
                  : 'bg-white text-gray-900 border border-gray-100'
              }`}>
                <p className="text-sm">{message.content}</p>
                <div className={`flex items-center justify-end gap-0.5 mt-1 ${message.sender === 'me' ? 'text-white/70' : 'text-gray-400'}`}>
                  <span className="text-xs">{formatTimeAgo(message.timestamp)}</span>
                  {message.sender === 'me' && <MessageStatus status={message.status} />}
                </div>
              </div>
            ) : message.type === 'request' ? (
              <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%] px-4 py-3 rounded-2xl border-2 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <p className="text-sm text-gray-900">Payment Request</p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">${message.amount} <span className="text-sm text-gray-600">{message.asset}</span></p>
                <p className="text-xs text-gray-500 mb-3">{formatTimeAgo(message.timestamp)}</p>

                {message.status === 'pending' && message.sender === 'them' ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptPayment(message.id)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-shadow">Accept</button>
                    <button onClick={() => handleDeclinePayment(message.id)}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">Decline</button>
                  </div>
                ) : message.status === 'accepted' ? (
                  <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /><p className="text-sm font-medium">Payment Accepted</p></div>
                ) : message.status === 'declined' ? (
                  <div className="flex items-center gap-2 text-gray-600"><XCircle className="w-4 h-4" /><p className="text-sm font-medium">Payment Declined</p></div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600"><Clock className="w-4 h-4" /><p className="text-sm font-medium">Pending...</p></div>
                )}
              </div>
            ) : (
              <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] px-4 py-3 rounded-2xl border-2 ${
                message.status === 'accepted'
                  ? message.sender === 'me' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                  : message.status === 'declined' ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                  : message.status === 'failed' ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                  : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {message.status === 'accepted' ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : message.status === 'declined' ? <XCircle className="w-4 h-4 text-gray-600" />
                    : message.status === 'failed' ? <XCircle className="w-4 h-4 text-red-600" />
                    : <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}><Clock className="w-4 h-4 text-orange-600" /></motion.div>}
                  <p className="text-sm text-gray-900">
                    {message.status === 'pending' ? (message.sender === 'me' ? 'Linking...' : 'Payment received')
                      : message.status === 'failed' ? 'Link failed'
                      : message.status === 'accepted' ? (message.sender === 'me' ? 'Payment accepted' : 'You received')
                      : message.status === 'declined' ? 'Payment declined'
                      : message.sender === 'me' ? 'You linked' : 'You received'}
                  </p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">${message.amount} <span className="text-sm text-gray-600">{message.asset}</span></p>
                <p className="text-xs text-gray-500">{formatTimeAgo(message.timestamp)}</p>

                {/* Receiver sees Accept/Decline buttons when pending */}
                {message.status === 'pending' && message.sender === 'them' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleAcceptPayment(message.id)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-shadow">Accept</button>
                    <button onClick={() => handleDeclinePayment(message.id)}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">Decline</button>
                  </div>
                )}

                {message.status === 'failed' && <p className="text-xs text-red-600 mt-2">Transaction failed. Please try again.</p>}
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 px-6 pb-24 pt-3 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-10">
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowSendModal(true)}
            className="px-3 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-shadow whitespace-nowrap">
            <DollarSign className="w-4 h-4 text-white" /><span className="text-white font-medium text-sm">Send</span>
          </motion.button>
          <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="p-3 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {showSendModal && (
        <LinkSendModal onClose={() => setShowSendModal(false)} recipient={selectedContact} assets={assets} onTransactionComplete={handleTransactionComplete} />
      )}
    </div>
  );
}
