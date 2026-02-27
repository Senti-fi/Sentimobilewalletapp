import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Shield, Check } from 'lucide-react';
import { useState } from 'react';

interface EditEmailModalProps {
  currentEmail: string;
  onClose: () => void;
}

export default function EditEmailModal({ currentEmail, onClose }: EditEmailModalProps) {
  const [step, setStep] = useState<'input' | 'verify' | 'success'>('input');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

  const [emailError, setEmailError] = useState('');

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = () => {
    setEmailError('');
    if (!newEmail) {
      setEmailError('Please enter an email address');
      return;
    }
    if (!isValidEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (newEmail === currentEmail) {
      setEmailError('New email must be different from current email');
      return;
    }
    setStep('verify');
  };

  const handleResendCode = () => {
    setVerificationCode(['', '', '', '', '', '']);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }

      // Auto-verify when all 6 digits are entered
      if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
        setTimeout(() => {
          setStep('success');
          setTimeout(() => onClose(), 2000);
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

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
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 max-h-[85dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-gray-900">Update Email</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Input Step */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Current Email</label>
                <input
                  type="email"
                  value={currentEmail}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleEmailSubmit}
                disabled={!newEmail}
                className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </motion.button>
            </div>
          )}

          {/* Verification Step */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-gray-900 font-medium mb-2">Verify your identity</h3>
                <p className="text-sm text-gray-500">
                  We've sent a 6-digit code to<br />
                  <span className="font-medium text-gray-900">{newEmail}</span>
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                  />
                ))}
              </div>

              <button
                onClick={handleResendCode}
                className="text-sm text-blue-600 hover:text-blue-700 text-center w-full"
              >
                Resend code
              </button>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
              <h3 className="text-gray-900 mb-2">Email Updated!</h3>
              <p className="text-gray-600">Your email has been successfully changed</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
