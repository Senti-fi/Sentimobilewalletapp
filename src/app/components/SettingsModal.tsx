import { motion, AnimatePresence } from 'motion/react';
import { X, User, Bell, Shield, HelpCircle, LogOut, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const handleReset = () => {
    if (confirm('Are you sure you want to reset the app? This will clear all data and show the onboarding again.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const settingsItems = [
    {
      icon: User,
      label: 'Account',
      description: 'Manage your profile and preferences',
      action: () => alert('Account settings coming soon!'),
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Control your notification preferences',
      action: () => alert('Notification settings coming soon!'),
    },
    {
      icon: Shield,
      label: 'Security',
      description: 'Password, 2FA, and security settings',
      action: () => alert('Security settings coming soon!'),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help and contact support',
      action: () => alert('Help center coming soon!'),
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[85dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl shadow-md flex-shrink-0">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 mb-0.5">Senti User</p>
              <p className="text-sm text-gray-600 truncate">user@example.com</p>
            </div>
          </div>

          {/* Settings List */}
          <div className="space-y-2 mb-6">
            {settingsItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={item.action}
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-0.5">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="w-full py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reset App
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to log out?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full py-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>

          {/* App Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Senti Wallet v1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">Made with ❤️ for easy crypto</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}