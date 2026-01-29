import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  TrendingUp,
  Wallet,
  HelpCircle,
  Zap,
  ArrowRight,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import lucyService, { Message, WalletContext } from '../../services/lucyService';
import chatStorage from '../../services/chatStorage';

interface LucyPageProps {
  walletContext?: WalletContext;
  onOpenSendModal?: () => void;
  onOpenDepositModal?: () => void;
  onOpenSwapModal?: () => void;
}

const quickActions = [
  {
    id: '1',
    title: 'Check Balance',
    icon: Wallet,
    query: 'What\'s my total balance?',
    gradient: 'from-cyan-400 via-blue-500 to-blue-700',
  },
  {
    id: '2',
    title: 'Best Vaults',
    icon: TrendingUp,
    query: 'Show me the best vault options',
    gradient: 'from-cyan-400 via-blue-500 to-blue-700',
  },
  {
    id: '3',
    title: 'Send Money',
    icon: Send,
    query: 'I want to send money',
    gradient: 'from-cyan-400 via-blue-500 to-blue-700',
  },
  {
    id: '4',
    title: 'Explain Fees',
    icon: HelpCircle,
    query: 'Explain network fees to me',
    gradient: 'from-cyan-400 via-blue-500 to-blue-700',
  },
];

export default function LucyPage({
  walletContext = {},
  onOpenSendModal,
  onOpenDepositModal,
  onOpenSwapModal,
}: LucyPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recentConversations = chatStorage.getRecentConversations(3);

  // Load conversation history on mount
  useEffect(() => {
    const savedMessages = chatStorage.loadCurrentConversation();
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      // Start with welcome message
      setMessages([
        {
          id: '1',
          type: 'lucy',
          text: 'Hi! I\'m Lucy, your AI assistant for Senti. I can help you send money, find the best vaults, explain DeFi concepts, or answer any questions about your wallet. What would you like to do?',
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Check backend health on mount and set up periodic checks
  useEffect(() => {
    checkBackendHealthWithRetry();

    // Set up periodic health checks every 5 seconds when offline
    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, []);

  // Set up periodic health checks when offline
  useEffect(() => {
    if (backendStatus === 'offline') {
      // Retry every 5 seconds when offline
      healthCheckIntervalRef.current = setInterval(() => {
        checkBackendHealth();
      }, 5000);
    } else {
      // Clear interval when online
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    }

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [backendStatus]);

  // Auto-scroll to bottom when messages change (debounced for performance)
  useEffect(() => {
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce scrolling to avoid excessive reflows during streaming
    scrollTimeoutRef.current = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages]);

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 1) {
      // Only save if there's more than welcome message
      chatStorage.saveConversation(messages);
    }
  }, [messages]);

  const checkBackendHealth = async () => {
    setBackendStatus('checking');
    const isHealthy = await lucyService.healthCheck();
    setBackendStatus(isHealthy ? 'online' : 'offline');
    if (isHealthy) {
      setRetryCount(0);
    }
  };

  const checkBackendHealthWithRetry = async (maxRetries = 4) => {
    setBackendStatus('checking');

    for (let i = 0; i < maxRetries; i++) {
      const isHealthy = await lucyService.healthCheck();

      if (isHealthy) {
        setBackendStatus('online');
        setRetryCount(0);
        return;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        setRetryCount(i + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setBackendStatus('offline');
    setRetryCount(0);
  };

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage;
    if (!messageText.trim() || isStreaming) return;

    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Check if action should be executed
    checkAndExecuteAction(messageText);

    // Create placeholder for Lucy's streaming response
    const lucyMessageId = (Date.now() + 1).toString();
    const lucyMessage: Message = {
      id: lucyMessageId,
      type: 'lucy',
      text: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, lucyMessage]);
    setIsStreaming(true);

    // Get conversation history for context
    const conversationHistory = [...messages, userMessage];

    // Stream response from Lucy
    lucyService.streamChat(
      conversationHistory,
      walletContext,
      // On token received
      (token: string) => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === lucyMessageId
              ? { ...msg, text: msg.text + token }
              : msg
          )
        );
      },
      // On complete
      async () => {
        setIsStreaming(false);

        // Mark message as no longer streaming
        setMessages(prev =>
          prev.map(msg =>
            msg.id === lucyMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );

        // Generate suggestions
        setIsLoadingSuggestions(true);
        try {
          const suggestions = await lucyService.generateSuggestions(
            messageText,
            walletContext
          );

          if (suggestions.length > 0) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === lucyMessageId
                  ? { ...msg, suggestions }
                  : msg
              )
            );
          }
        } catch (err) {
          console.error('Failed to generate suggestions:', err);
        } finally {
          setIsLoadingSuggestions(false);
        }
      },
      // On error
      (error: Error) => {
        setIsStreaming(false);
        setError(error.message);

        // Replace streaming message with error
        setMessages(prev =>
          prev.map(msg =>
            msg.id === lucyMessageId
              ? {
                  ...msg,
                  text: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    );
  };

  const checkAndExecuteAction = async (message: string) => {
    try {
      const actionResult = await lucyService.checkAction(message, walletContext);

      if (actionResult.confidence > 0.7) {
        // High confidence, execute action
        switch (actionResult.action) {
          case 'send':
            onOpenSendModal?.();
            break;
          case 'deposit':
            onOpenDepositModal?.();
            break;
          case 'swap':
            onOpenSwapModal?.();
            break;
        }
      }
    } catch (err) {
      console.error('Failed to check action:', err);
    }
  };

  const handleQuickAction = (query: string) => {
    handleSendMessage(query);
  };

  const handleLoadConversation = (conversationId: string) => {
    const conversation = chatStorage.getConversation(conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      sessionStorage.setItem('current_conversation_id', conversationId);
    }
  };

  const handleNewConversation = () => {
    chatStorage.startNewConversation();
    setMessages([
      {
        id: '1',
        type: 'lucy',
        text: 'Hi! I\'m Lucy, your AI assistant for Senti. I can help you send money, find the best vaults, explain DeFi concepts, or answer any questions about your wallet. What would you like to do?',
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 px-6 pt-6 pb-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Lucy Avatar */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              <div className="relative">
                <Sparkles className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Lucy
              </h1>
              <p className="text-sm text-gray-500">
                AI Assistant
              </p>
            </div>
          </div>

          {/* New conversation button */}
          {messages.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewConversation}
              className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              New Chat
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mb-4"
          >
            <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAction(action.query)}
                  className="flex flex-col items-center gap-2.5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                    <action.icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs text-gray-700">{action.title}</span>
                </motion.button>
              ))}
            </div>

            {/* Recent Conversations */}
            {recentConversations.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-3">Recent conversations:</p>
                <div className="space-y-2">
                  {recentConversations.map((conv, index) => (
                    <motion.button
                      key={conv.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleLoadConversation(conv.id)}
                      className="w-full bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-gray-100 text-left group"
                    >
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{conv.preview}</p>
                      </div>
                      <span className="text-xs text-gray-400">{conv.time}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[80%]">
              {message.type === 'lucy' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs text-gray-500">Lucy</span>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
                {message.isStreaming && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block w-2 h-4 bg-blue-500 ml-1 rounded"
                  />
                )}
              </div>

              {/* Suggestions */}
              {!message.isStreaming && (
                <>
                  {isLoadingSuggestions && index === messages.length - 1 && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                      <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-700">Generating suggestions...</span>
                    </div>
                  )}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {message.suggestions.map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickAction(suggestion)}
                          disabled={isStreaming}
                          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left group border border-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-blue-700 flex-1">{suggestion}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ))}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 pb-24 pt-3 bg-white/50 backdrop-blur-lg border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isStreaming && handleSendMessage()}
            placeholder="Ask Lucy anything..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            whileHover={!isStreaming ? { scale: 1.05 } : {}}
            whileTap={!isStreaming ? { scale: 0.95 } : {}}
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isStreaming}
            className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
