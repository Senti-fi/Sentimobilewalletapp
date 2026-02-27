import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Smartphone, Key, Lock, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SecurityCenterModalProps {
  onClose: () => void;
}

export default function SecurityCenterModal({ onClose }: SecurityCenterModalProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('senti_2fa_enabled') === 'true';
  });
  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    const stored = localStorage.getItem('senti_biometric_enabled');
    return stored !== null ? stored === 'true' : true;
  });

  const handleToggle2FA = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    localStorage.setItem('senti_2fa_enabled', String(enabled));
  };

  const handleToggleBiometric = (enabled: boolean) => {
    setBiometricEnabled(enabled);
    localStorage.setItem('senti_biometric_enabled', String(enabled));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center"
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-gray-900">Security Center</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            {/* 2FA Toggle */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-1">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add extra security with 2FA</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => handleToggle2FA(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Biometric Authentication */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Key className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-1">Biometric Authentication</p>
                  <p className="text-sm text-gray-500">Use Face ID or Touch ID</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={(e) => handleToggleBiometric(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Change Password */}
            <button className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-500 transition-all flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 font-medium mb-1">Change Password</p>
                <p className="text-sm text-gray-500">Update your password</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Security Tip:</span> Enable 2FA for maximum protection of your wallet and funds.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
