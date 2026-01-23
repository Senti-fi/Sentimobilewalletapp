import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Mail, FileText, ExternalLink, BookOpen, AlertCircle } from 'lucide-react';

interface HelpSupportModalProps {
  onClose: () => void;
}

export default function HelpSupportModal({ onClose }: HelpSupportModalProps) {
  const handleContactSupport = () => {
    window.open('mailto:support@senti.com', '_blank');
  };

  const handleOpenChat = () => {
    // In a real app, this would open a live chat widget
    alert('Live chat feature coming soon!');
  };

  const handleOpenDocs = () => {
    window.open('https://docs.senti.com', '_blank');
  };

  const handleOpenFAQ = () => {
    window.open('https://senti.com/faq', '_blank');
  };

  const helpOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      color: 'from-blue-400 to-cyan-500',
      onClick: handleOpenChat,
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email at support@senti.com',
      color: 'from-purple-400 to-purple-600',
      onClick: handleContactSupport,
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Browse our comprehensive guides',
      color: 'from-green-400 to-emerald-500',
      onClick: handleOpenDocs,
    },
    {
      icon: AlertCircle,
      title: 'FAQ',
      description: 'Find answers to common questions',
      color: 'from-orange-400 to-orange-600',
      onClick: handleOpenFAQ,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-gray-900 text-xl font-semibold">Help & Support</h2>
              <p className="text-sm text-gray-500 mt-1">We're here to help you</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Help Options */}
          <div className="space-y-3 mb-6">
            {helpOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={option.onClick}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-900 font-medium">{option.title}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </motion.button>
              );
            })}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-700 text-white rounded-2xl font-medium hover:shadow-lg transition-shadow"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
