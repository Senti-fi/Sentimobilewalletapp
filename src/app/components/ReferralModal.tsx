import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle, Users, Gift, Share2 } from 'lucide-react';
import { referralService } from '../../services/referralService';

interface ReferralModalProps {
  onClose: () => void;
}

export default function ReferralModal({ onClose }: ReferralModalProps) {
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const authUserId = localStorage.getItem('senti_auth_user_id') || '';
  const username = localStorage.getItem('senti_username') || 'user';

  useEffect(() => {
    async function loadReferralData() {
      if (!authUserId) {
        setLoading(false);
        return;
      }

      const [code, count] = await Promise.all([
        referralService.getOrCreateReferralCode(authUserId, username),
        referralService.getReferralCount(authUserId),
      ]);

      if (code) setReferralCode(code);
      setReferralCount(count);
      setLoading(false);
    }

    loadReferralData();
  }, [authUserId, username]);

  const handleCopy = () => {
    const shareText = `Join me on Senti! Use my referral code: ${referralCode}\n\nDownload Senti and start your financial journey.`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join Senti',
      text: `Join me on Senti! Use my referral code: ${referralCode}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled sharing
      }
    } else {
      handleCopy();
    }
  };

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
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Invite Friends</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center border border-blue-100">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{referralCount}</p>
                  <p className="text-xs text-gray-600">Friends Invited</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center border border-green-100">
                  <Gift className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{referralCount * 50}</p>
                  <p className="text-xs text-gray-600">Points Earned</p>
                </div>
              </div>

              {/* Referral Code */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 mb-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Your Referral Code</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-gray-200">
                    <p className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                      {referralCode || 'Loading...'}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Share Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-2 mb-4"
              >
                <Share2 className="w-5 h-5" />
                Share Invite Link
              </motion.button>

              {/* How it works */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900">How it works</p>
                <div className="space-y-2">
                  {[
                    { step: '1', text: 'Share your unique referral code with friends' },
                    { step: '2', text: 'They sign up on Senti using your code' },
                    { step: '3', text: 'Both of you earn 50 reward points' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">{item.step}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
