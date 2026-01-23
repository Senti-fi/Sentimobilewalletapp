import { useState, useEffect, useRef } from 'react';
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
  XCircle
} from 'lucide-react';
import LinkSendModal from './LinkSendModal';

// Mock contacts data
export const mockContacts = [
  {
    id: '@alex.senti',
    name: 'Alex Rivera',
    avatar: '👤',
    color: 'from-blue-400 to-blue-600',
    lastMessage: 'Thanks for the payment!',
    lastMessageTime: '2m ago',
    online: true,
  },
  {
    id: '@sarah.senti',
    name: 'Sarah Chen',
    avatar: '👤',
    color: 'from-purple-400 to-purple-600',
    lastMessage: 'Received $50',
    lastMessageTime: '1h ago',
    online: true,
  },
  {
    id: '@mike.senti',
    name: 'Mike Johnson',
    avatar: '👤',
    color: 'from-green-400 to-green-600',
    lastMessage: 'Can you send me $100?',
    lastMessageTime: '3h ago',
    online: false,
  },
  {
    id: '@emma.senti',
    name: 'Emma Davis',
    avatar: '👤',
    color: 'from-pink-400 to-pink-600',
    lastMessage: 'Perfect, got it!',
    lastMessageTime: '1d ago',
    online: false,
  },
];

interface Message {
  id: string;
  type: 'text' | 'transaction' | 'request';
  content: string;
  sender: 'me' | 'them';
  timestamp: Date;
  amount?: number;
  asset?: string;
  status?: 'pending' | 'completed' | 'failed' | 'accepted' | 'declined';
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
}

export default function LinkPage({ assets, onSend, onReceive }: LinkPageProps) {
  const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  const loadMessages = (): Record<string, Message[]> => {
    try {
      const stored = localStorage.getItem('senti_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const messagesWithDates: Record<string, Message[]> = {};
        Object.keys(parsed).forEach(contactId => {
          messagesWithDates[contactId] = parsed[contactId].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        });
        return messagesWithDates;
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
    // Return default messages if nothing in storage
    return {
      '@alex.senti': [
        {
          id: '1',
          type: 'text',
          content: 'Hey! How are you?',
          sender: 'them',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          type: 'text',
          content: 'I\'m doing great! Thanks for asking.',
          sender: 'me',
          timestamp: new Date(Date.now() - 3500000),
        },
        {
          id: '3',
          type: 'transaction',
          content: 'Payment linked',
          sender: 'me',
          timestamp: new Date(Date.now() - 2900000),
          amount: 150,
          asset: 'USDC',
          status: 'accepted',
        },
      ],
      '@sarah.senti': [],
      '@mike.senti': [],
      '@emma.senti': [],
    };
  };

  // Store messages per contact using contact ID as key
  const [messagesByContact, setMessagesByContact] = useState<Record<string, Message[]>>(loadMessages);

  // Get messages for the selected contact
  const messages = selectedContact ? (messagesByContact[selectedContact.id] || []) : [];

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('senti_messages', JSON.stringify(messagesByContact));
  }, [messagesByContact]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate contact responses with contextual awareness
  const generateAutoResponse = (userMessage: string) => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Greetings
    if (lowerMsg.match(/^(hey|hi|hello|sup|what'?s up|yo)/)) {
      const greetingResponses = [
        "Hey! I'm doing great, thanks! How about you?",
        "Hi there! All good here! 😊",
        "Hey! Pretty good! What's up?",
        "Hello! Doing well, thanks for asking!",
        "Hey! I'm good! How are things with you?",
      ];
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }
    
    // How are you / How's it going
    if (lowerMsg.match(/how (are|r) (you|u)|how'?s it going|how have you been|what'?s up/)) {
      const statusResponses = [
        "I'm doing great, thanks! How about you?",
        "Pretty good! Just been busy lately. You?",
        "All good here! What have you been up to?",
        "Doing well! Thanks for asking! 😊",
        "Can't complain! How's everything on your end?",
      ];
      return statusResponses[Math.floor(Math.random() * statusResponses.length)];
    }
    
    // Thanks / Appreciation
    if (lowerMsg.match(/thank|thanks|appreciate|thx/)) {
      const thanksResponses = [
        "You're welcome! 😊",
        "No problem at all!",
        "Anytime! Happy to help!",
        "Of course! 👍",
        "My pleasure!",
      ];
      return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
    }
    
    // Questions (with question mark)
    if (userMessage.includes('?')) {
      const questionResponses = [
        "Let me think about that!",
        "Good question! I'd say yes!",
        "Hmm, I'm not entirely sure tbh",
        "Yeah, I think so!",
        "Probably! Let me get back to you on that",
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }
    
    // Agreements / Confirmations
    if (lowerMsg.match(/^(ok|okay|cool|nice|awesome|great|perfect|sounds good|alright|sure)/)) {
      const agreementResponses = [
        "Great! 👍",
        "Awesome!",
        "Perfect!",
        "Cool cool!",
        "Sounds good!",
      ];
      return agreementResponses[Math.floor(Math.random() * agreementResponses.length)];
    }
    
    // Money/payment mentions (but not requests)
    if (lowerMsg.match(/money|payment|pay|cash|\$/)) {
      const moneyResponses = [
        "Yeah, for sure!",
        "Totally understand!",
        "No worries about that!",
        "Got it!",
      ];
      return moneyResponses[Math.floor(Math.random() * moneyResponses.length)];
    }
    
    // Default responses for general statements
    const defaultResponses = [
      "Got it, sounds good!",
      "Awesome, thanks for letting me know!",
      "Perfect!",
      "That makes sense!",
      "Cool, appreciate the update!",
      "Nice! Thanks for sharing!",
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Parse message for payment requests
  const parsePaymentRequest = (message: string): { amount: number; asset: string } | null => {
    const lowerMsg = message.toLowerCase();
    
    // Patterns: "link me $50", "send me 50", "can you link 50", etc.
    const patterns = [
      /(?:link|send|transfer|pay)(?:\s+me)?\s+\$?(\d+(?:\.\d+)?)\s*(usdc|usdt|sol)?/i,
      /\$?(\d+(?:\.\d+)?)\s*(usdc|usdt|sol)?/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const asset = match[2]?.toUpperCase() || 'USDC';
        
        if (amount > 0 && amount <= 10000) { // Reasonable limit
          return { amount, asset };
        }
      }
    }
    
    return null;
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: messageInput,
      sender: 'me',
      timestamp: new Date(),
    };

    setMessagesByContact(prev => ({
      ...prev,
      [selectedContact!.id]: [...prev[selectedContact!.id], newMessage],
    }));

    // Check if message contains a payment request
    const paymentRequest = parsePaymentRequest(messageInput);
    
    setMessageInput('');

    // Simulate contact response
    if (selectedContact?.online) {
      setTimeout(() => {
        if (paymentRequest) {
          // Contact acknowledges the request
          const ackMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'text',
            content: `Sure! Linking you $${paymentRequest.amount} ${paymentRequest.asset} now! 💸`,
            sender: 'them',
            timestamp: new Date(),
          };
          
          setMessagesByContact(prev => ({
            ...prev,
            [selectedContact!.id]: [...prev[selectedContact!.id], ackMessage],
          }));

          // Contact sends the payment after acknowledgment
          setTimeout(() => {
            handleIncomingTransaction(paymentRequest.amount, paymentRequest.asset);
          }, 1500);
        } else {
          // Regular text response
          const responseMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'text',
            content: generateAutoResponse(messageInput),
            sender: 'them',
            timestamp: new Date(),
          };
          setMessagesByContact(prev => ({
            ...prev,
            [selectedContact!.id]: [...prev[selectedContact!.id], responseMessage],
          }));
        }
      }, 1500 + Math.random() * 1500);
    }
  };

  // Handle incoming transactions from contacts (creates a request)
  const handleIncomingTransaction = (amount: number, asset: string) => {
    const requestId = Date.now().toString();
    const requestMessage: Message = {
      id: requestId,
      type: 'request',
      content: `Wants to send you $${amount} ${asset}`,
      sender: 'them',
      timestamp: new Date(),
      amount,
      asset,
      status: 'pending',
    };

    setMessagesByContact(prev => ({
      ...prev,
      [selectedContact!.id]: [...prev[selectedContact!.id], requestMessage],
    }));
  };

  // Handle accepting a payment request
  const handleAcceptPayment = (messageId: string) => {
    const message = messagesByContact[selectedContact!.id].find(m => m.id === messageId);
    if (!message || !message.amount || !message.asset) return;

    // Update message status to accepted
    setMessagesByContact(prev => ({
      ...prev,
      [selectedContact!.id]: prev[selectedContact!.id].map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            status: 'accepted',
            content: `Accepted $${msg.amount} ${msg.asset}`,
          };
        }
        return msg;
      }),
    }));

    // Add to account balance via Dashboard callback
    if (onReceive && selectedContact) {
      onReceive(message.amount, message.asset, selectedContact.id, selectedContact.name);
    }

    // Send thank you message
    setTimeout(() => {
      const thankYouMessage: Message = {
        id: Date.now().toString(),
        type: 'text',
        content: 'Thank you! 🙏',
        sender: 'me',
        timestamp: new Date(),
      };
      setMessagesByContact(prev => ({
        ...prev,
        [selectedContact!.id]: [...prev[selectedContact!.id], thankYouMessage],
      }));
    }, 500);
  };

  // Handle declining a payment request
  const handleDeclinePayment = (messageId: string) => {
    setMessagesByContact(prev => ({
      ...prev,
      [selectedContact!.id]: prev[selectedContact!.id].map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            status: 'declined',
            content: `Declined payment`,
          };
        }
        return msg;
      }),
    }));
  };

  const handleTransactionComplete = (amount: number, asset: string, shouldFail: boolean = false, gasFee: number = 0) => {
    // Create pending transaction first
    const pendingId = Date.now().toString();
    const pendingTransaction: Message = {
      id: pendingId,
      type: 'transaction',
      content: 'Payment linking',
      sender: 'me',
      timestamp: new Date(),
      amount,
      asset,
      status: 'pending',
    };

    setMessagesByContact(prev => ({
      ...prev,
      [selectedContact!.id]: [...prev[selectedContact!.id], pendingTransaction],
    }));

    // Simulate transaction processing (2-4 seconds)
    const processingTime = 2000 + Math.random() * 2000;

    setTimeout(() => {
      // Update Dashboard balance AFTER transaction completes if successful
      if (!shouldFail && selectedContact) {
        onSend(amount, asset, selectedContact.id, selectedContact.name, gasFee);
      }

      // Simulate recipient accepting or declining (95% accept, 5% decline)
      const recipientAccepts = Math.random() > 0.05 && !shouldFail;

      setMessagesByContact(prev => ({
        ...prev,
        [selectedContact!.id]: prev[selectedContact!.id].map(msg => {
          if (msg.id === pendingId) {
            return {
              ...msg,
              status: shouldFail ? 'failed' : recipientAccepts ? 'accepted' : 'declined',
              content: shouldFail ? 'Payment failed' : recipientAccepts ? 'Payment accepted' : 'Payment declined',
            };
          }
          return msg;
        }),
      }));

      // If accepted and contact is online, send a thank you message
      if (recipientAccepts && selectedContact?.online) {
        setTimeout(() => {
          const thankYouMessages = [
            "Got it! Thanks! 🙏",
            "Received! Thank you!",
            "Perfect, thank you so much!",
            "Awesome, thanks for linking!",
          ];
          const responseMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'text',
            content: thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)],
            sender: 'them',
            timestamp: new Date(),
          };
          setMessagesByContact(prev => ({
            ...prev,
            [selectedContact!.id]: [...prev[selectedContact!.id], responseMessage],
          }));
        }, 1000);
      } else if (!recipientAccepts && !shouldFail && selectedContact?.online) {
        // If declined, send a message explaining why
        setTimeout(() => {
          const declineMessages = [
            "Sorry, I can't accept this right now.",
            "Thanks, but I'll have to decline.",
            "I appreciate it, but I can't accept this.",
          ];
          const responseMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'text',
            content: declineMessages[Math.floor(Math.random() * declineMessages.length)],
            sender: 'them',
            timestamp: new Date(),
          };
          setMessagesByContact(prev => ({
            ...prev,
            [selectedContact!.id]: [...prev[selectedContact!.id], responseMessage],
          }));
        }, 1000);
      }
    }, processingTime);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Contacts List View
  if (!selectedContact) {
    return (
      <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-none px-6 pt-6 pb-4"
        >
          <h1 className="text-gray-900 mb-2">Link</h1>
          <p className="text-sm text-gray-500">Send money instantly using IDs</p>
        </motion.div>

        {/* Search Bar */}
        <div className="flex-none px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts or @ID"
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900">Contacts</h3>
            <span className="text-xs text-gray-500">{filteredContacts.length} contacts</span>
          </div>

          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedContact(contact)}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer"
            >
              <div className="relative">
                <div className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                  {contact.avatar}
                </div>
                {contact.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-gray-900">{contact.name}</p>
                </div>
                <p className="text-xs text-gray-500">{contact.id}</p>
                <p className="text-xs text-gray-400 truncate mt-1">{contact.lastMessage}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{contact.lastMessageTime}</p>
                <MessageCircle className="w-5 h-5 text-gray-300 ml-auto mt-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Chat Header - Fixed */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none px-6 pt-6 pb-4 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-20"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedContact(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br ${selectedContact.color} rounded-xl flex items-center justify-center text-white`}>
              {selectedContact.avatar}
            </div>
            {selectedContact.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1">
            <p className="text-gray-900">{selectedContact.name}</p>
            <p className="text-xs text-gray-500">{selectedContact.id}</p>
          </div>
        </div>
      </motion.div>

      {/* Messages - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-3 z-[5] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'text' ? (
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  message.sender === 'me'
                    ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-white'
                    : 'bg-white text-gray-900 border border-gray-100'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-white/70' : 'text-gray-400'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            ) : message.type === 'request' ? (
              <div className="max-w-[75%] px-4 py-3 rounded-2xl border-2 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <p className="text-sm text-gray-900">Payment Request</p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">
                  ${message.amount} <span className="text-sm text-gray-600">{message.asset}</span>
                </p>
                <p className="text-xs text-gray-500 mb-3">{formatTime(message.timestamp)}</p>

                {message.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptPayment(message.id)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-shadow"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclinePayment(message.id)}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                ) : message.status === 'accepted' ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">Payment Accepted</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <XCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">Payment Declined</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl border-2 ${
                  message.status === 'accepted'
                    ? message.sender === 'me'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                    : message.status === 'declined'
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                    : message.status === 'failed'
                    ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                    : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.status === 'accepted' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : message.status === 'declined' ? (
                    <XCircle className="w-4 h-4 text-gray-600" />
                  ) : message.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Clock className="w-4 h-4 text-orange-600" />
                    </motion.div>
                  )}
                  <p className="text-sm text-gray-900">
                    {message.status === 'pending'
                      ? 'Linking...'
                      : message.status === 'failed'
                      ? 'Link failed'
                      : message.status === 'accepted'
                      ? message.sender === 'me'
                        ? 'Payment accepted'
                        : 'You received'
                      : message.status === 'declined'
                      ? 'Payment declined'
                      : message.sender === 'me'
                      ? 'You linked'
                      : 'You received'}
                  </p>
                </div>
                <p className="text-2xl text-gray-900 mb-1">
                  ${message.amount} <span className="text-sm text-gray-600">{message.asset}</span>
                </p>
                <p className="text-xs text-gray-500">{formatTime(message.timestamp)}</p>
                {message.status === 'failed' && (
                  <p className="text-xs text-red-600 mt-2">Transaction failed. Please try again.</p>
                )}
                {message.status === 'declined' && message.sender === 'me' && (
                  <p className="text-xs text-gray-600 mt-2">Recipient declined this payment.</p>
                )}
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="flex-none px-6 pb-6 pt-3 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-10">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSendModal(true)}
            className="px-3 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
          >
            <DollarSign className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">Send</span>
          </motion.button>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="p-3 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <LinkSendModal
          onClose={() => setShowSendModal(false)}
          recipient={selectedContact}
          assets={assets}
          onTransactionComplete={handleTransactionComplete}
        />
      )}
    </div>
  );
}