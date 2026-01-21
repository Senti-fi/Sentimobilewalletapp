import { motion } from 'motion/react';
import { Sparkles, Send, TrendingUp, Wallet, DollarSign, HelpCircle, Zap, ArrowRight, Clock } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'lucy';
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

const quickActions = [
  {
    id: '1',
    title: 'Check Balance',
    description: 'View your total portfolio',
    icon: Wallet,
    query: 'What\'s my total balance?',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    title: 'Best Vaults',
    description: 'Find top earning options',
    icon: TrendingUp,
    query: 'Show me the best vault options',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: '3',
    title: 'Send Money',
    description: 'Transfer to someone',
    icon: Send,
    query: 'I want to send money',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: '4',
    title: 'Explain Fees',
    description: 'Understand gas costs',
    icon: HelpCircle,
    query: 'Explain network fees to me',
    gradient: 'from-orange-500 to-red-500',
  },
];

const recentConversations = [
  { id: '1', preview: 'How do I earn yield on USDC?', time: '2 hours ago' },
  { id: '2', preview: 'Send $50 to Alex', time: 'Yesterday' },
  { id: '3', preview: 'What are the best vaults?', time: '2 days ago' },
];

export default function LucyPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'lucy',
      text: 'Hi! I\'m Lucy, your AI assistant for Senti. I can help you send money, find the best vaults, explain DeFi concepts, or answer any questions about your wallet. What would you like to do?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (message?: string) => {
    const messageText = message || inputMessage;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate Lucy response with suggestions
    setTimeout(() => {
      const lucyResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'lucy',
        text: generateResponse(messageText),
        timestamp: new Date(),
        suggestions: generateSuggestions(messageText),
      };
      setMessages(prev => [...prev, lucyResponse]);
    }, 1000);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('balance')) {
      return 'Your total balance is $13,170.50. This includes:\n• USDC: $5,420.50\n• USDT: $3,500.00\n• SOL: $4,250.00\n\nYou\'re up +2.4% today! 📈';
    }
    
    if (lowerQuery.includes('vault') || lowerQuery.includes('earn') || lowerQuery.includes('yield')) {
      return 'I found 3 great vault options for you:\n\n1. USDC Vault - 8.5% APY (Low risk)\n2. Balanced Portfolio - 12.3% APY (Medium risk)\n3. High Yield Strategy - 18.9% APY (Higher risk)\n\nThe USDC Vault is perfect for beginners. Want me to help you deposit?';
    }
    
    if (lowerQuery.includes('send') || lowerQuery.includes('transfer')) {
      return 'I can help you send money! You can:\n\n• Send to a wallet address\n• Send to an email or @username\n• Use recent contacts\n\nJust tell me who you want to send to and how much. Or I can open the Send modal for you.';
    }
    
    if (lowerQuery.includes('fee') || lowerQuery.includes('gas')) {
      return 'Great question! Network fees (gas fees) are super low on Senti:\n\n• Transfers: $0.00 (we cover it!)\n• Vault deposits: $0.00\n• Swaps: ~$0.01\n\nWe use Layer 2 technology to keep costs near zero. You won\'t pay traditional Ethereum gas fees! 🎉';
    }
    
    return 'I\'m here to help! I can assist you with:\n\n• Checking your balance and portfolio\n• Finding the best vaults to earn yield\n• Sending and receiving money\n• Explaining DeFi concepts simply\n• Managing your transactions\n\nWhat would you like to know more about?';
  };

  const generateSuggestions = (query: string): string[] | undefined => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('balance')) {
      return ['Show transaction history', 'How can I grow this?'];
    }
    
    if (lowerQuery.includes('vault')) {
      return ['Tell me more about USDC Vault', 'How do I deposit?', 'What are the risks?'];
    }
    
    if (lowerQuery.includes('send')) {
      return ['Open Send modal', 'Show recent contacts'];
    }
    
    return undefined;
  };

  const handleQuickAction = (query: string) => {
    handleSendMessage(query);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-6 pb-4"
      >
        <div className="flex items-center gap-3 mb-2">
          {/* Lucy Avatar */}
          <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="relative">
              <Sparkles className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div>
            <h1 className="text-gray-900">Lucy</h1>
            <p className="text-sm text-gray-500">Your AI Assistant</p>
          </div>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mb-4"
          >
            <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction(action.query)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left group"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow`}>
                    <action.icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <p className="text-sm text-gray-900 mb-1">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </motion.button>
              ))}
            </div>

            {/* Recent Conversations */}
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
                    onClick={() => handleQuickAction(conv.preview)}
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
            <div className="max-w-[85%]">
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
              </div>
              
              {/* Suggestions */}
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
                      className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left group border border-blue-100"
                    >
                      <Zap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-700 flex-1">{suggestion}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 bg-white/50 backdrop-blur-lg border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Lucy anything..."
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}