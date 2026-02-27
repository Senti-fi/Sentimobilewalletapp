import { motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle,
  Mail,
  Phone,
  Key,
  Copy,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  HelpCircle,
  Gift
} from 'lucide-react';
import { useState } from 'react';
import { useLogout, useWallet } from '@getpara/react-sdk-lite';
import SecurityCenterModal from './SecurityCenterModal';
import EditEmailModal from './EditEmailModal';
import HelpSupportModal from './HelpSupportModal';
import ReferralModal from './ReferralModal';
import Portal from './Portal';

interface SettingsPageProps {
  onClose: () => void;
  totalBalance: number;
  activeGoals?: number;
  totalRewards?: number;
}

export default function SettingsPage({
  onClose,
  totalBalance,
  activeGoals = 4,
  totalRewards = 2300
}: SettingsPageProps) {
  const { logoutAsync } = useLogout();
  const wallet = useWallet();
  const [showSecurityCenter, setShowSecurityCenter] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);

  // Load user data — prefer live Para wallet address, fall back to localStorage
  const fullWalletAddress = wallet?.address || localStorage.getItem('senti_wallet_address') || '';
  const walletId = fullWalletAddress ? fullWalletAddress.slice(0, 6) + '...' + fullWalletAddress.slice(-4) : 'No wallet yet';
  const userEmail = localStorage.getItem('senti_user_email') || 'user@mail.com';
  const userPhone = '+1 (415) 555-0189'; // Phone remains as placeholder
  // Always capitalize first letter for display (e.g., "tomi" -> "Tomi")
  const rawUsername = localStorage.getItem('senti_username') || 'User';
  const username = rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1);
  const handle = localStorage.getItem('senti_user_handle') || '@user';
  const userId = localStorage.getItem('senti_user_id') || '';
  const userImage = localStorage.getItem('senti_user_image') || '';

  // Get user initials from username
  const userInitials = username.slice(0, 2).toUpperCase();

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(fullWalletAddress);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopiedUserId(true);
    setTimeout(() => setCopiedUserId(false), 2000);
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out? Your wallet will remain safe.')) {
      try {
        await logoutAsync();
      } catch (error) {
        console.error('Sign out error:', error);
      }
      // Clear senti-specific keys but preserve onboarding flag
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('senti_') && key !== 'senti_onboarding_completed') {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30 max-w-md mx-auto">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <p className="text-xs text-gray-500">Account</p>
          <h1 className="text-xl text-gray-900 font-medium">Profile</h1>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-24 px-6 pt-6 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-gray-900 text-lg font-semibold">{username}</h2>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-md">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Verified</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">{handle}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Net Worth</p>
              <p className="text-gray-900 font-semibold">
                ${Number.isFinite(totalBalance) ? (totalBalance >= 1e9 ? `${(totalBalance / 1e9).toFixed(1)}B` : totalBalance >= 1e6 ? `${(totalBalance / 1e6).toFixed(1)}M` : totalBalance >= 1e3 ? `${(totalBalance / 1e3).toFixed(1)}k` : totalBalance.toFixed(0)) : '0'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Goals</p>
              <p className="text-gray-900 font-semibold">{activeGoals} Active</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Rewards</p>
              <p className="text-gray-900 font-semibold">
                {(totalRewards / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-gray-900 font-medium">Account details</h3>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 break-all leading-tight pr-2">{userEmail}</p>
                <p className="text-xs text-gray-500">Primary email</p>
              </div>
              <button
                onClick={() => setShowEditEmail(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex-shrink-0 self-start mt-0.5"
              >
                Edit
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{userPhone}</p>
                <p className="text-xs text-gray-500">Phone number</p>
              </div>
              <div className="px-2 py-1 bg-green-50 rounded-md">
                <span className="text-xs text-green-700 font-medium">Verified</span>
              </div>
            </div>

            {/* Wallet ID */}
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-mono">{walletId}</p>
                <p className="text-xs text-gray-500">Wallet Address</p>
              </div>
              <button
                onClick={handleCopyWallet}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copiedWallet ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* User ID */}
            {userId && (
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-mono">{userId}</p>
                  <p className="text-xs text-gray-500">Unique User ID</p>
                </div>
                <button
                  onClick={handleCopyUserId}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {copiedUserId ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Connected Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-lg">🔗</span>
              </div>
              <h3 className="text-gray-900 font-medium">Connected accounts</h3>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {/* Apple ID */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Apple ID</p>
                <p className="text-xs text-gray-500">Sign in enabled</p>
              </div>
              <div className="px-2 py-1 bg-green-50 rounded-md">
                <span className="text-xs text-green-700 font-medium">Connected</span>
              </div>
            </div>

            {/* Google */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Google</p>
                <p className="text-xs text-gray-500">Backup sync active</p>
              </div>
              <div className="px-2 py-1 bg-green-50 rounded-md">
                <span className="text-xs text-green-700 font-medium">Connected</span>
              </div>
            </div>

            {/* Mercury Bank */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Mercury Bank</p>
                <p className="text-xs text-gray-500">Verify micro-deposit</p>
              </div>
              <div className="px-2 py-1 bg-yellow-50 rounded-md">
                <span className="text-xs text-yellow-700 font-medium">Pending</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Security Center */}
          <button
            onClick={() => setShowSecurityCenter(true)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-gray-900 font-medium">Security Center</p>
              <p className="text-sm text-gray-500">Protect your wallet & devices</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Invite Friends */}
          <button
            onClick={() => setShowReferral(true)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-gray-900 font-medium">Invite Friends</p>
              <p className="text-sm text-gray-500">Share your referral code & earn rewards</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Smart Alerts */}
          <button className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-gray-900 font-medium">Smart Alerts</p>
              <p className="text-sm text-gray-500">Customize balance reminders</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Help & Support */}
          <button
            onClick={() => setShowHelpSupport(true)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-gray-900 font-medium">Help & Support</p>
              <p className="text-sm text-gray-500">Get help and contact us</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

        </motion.div>

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleSignOut}
          className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="flex-1 text-left">
            <p className="text-red-600 font-medium flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Sign out of Senti
            </p>
            <p className="text-sm text-gray-500">We will keep your wallet safe</p>
          </div>
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6 space-y-1"
        >
          <p className="text-sm text-gray-500">Senti Wallet v1.0.0</p>
          <p className="text-xs text-gray-400">Made with ❤️ for easy crypto</p>
        </motion.div>
      </div>

      {/* Modals - wrapped in Portal to escape stacking context */}
      {showSecurityCenter && (
        <Portal>
          <SecurityCenterModal onClose={() => setShowSecurityCenter(false)} />
        </Portal>
      )}
      {showEditEmail && (
        <Portal>
          <EditEmailModal
            currentEmail={userEmail}
            onClose={() => setShowEditEmail(false)}
          />
        </Portal>
      )}
      {showHelpSupport && (
        <Portal>
          <HelpSupportModal onClose={() => setShowHelpSupport(false)} />
        </Portal>
      )}
      {showReferral && (
        <Portal>
          <ReferralModal onClose={() => setShowReferral(false)} />
        </Portal>
      )}
    </div>
  );
}
