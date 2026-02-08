import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AtSign, AlertCircle, CheckCircle, User, ArrowRight } from 'lucide-react';

interface UsernameSetupProps {
  onComplete: (username: string) => void;
  userImage?: string;
}

// Validate username (alphanumeric and underscores only, 3-20 chars)
const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Check if username is already taken
const isUsernameTaken = (username: string): boolean => {
  const handle = `@${username.toLowerCase()}.senti`;
  const existingUsersJson = localStorage.getItem('senti_registered_users');
  if (!existingUsersJson) return false;

  try {
    const existingUsers = JSON.parse(existingUsersJson);
    return existingUsers.some((user: { id: string }) => user.id.toLowerCase() === handle.toLowerCase());
  } catch {
    return false;
  }
};

// Format username for display (capitalize first letter)
const formatDisplayName = (username: string): string => {
  if (!username) return '';
  return username.charAt(0).toUpperCase() + username.slice(1) + 'Senti';
};

export default function UsernameSetup({ onComplete, userImage }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleUsernameChange = (value: string) => {
    // Remove spaces, special chars and convert to lowercase
    const cleanedUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanedUsername);

    if (cleanedUsername && !isValidUsername(cleanedUsername)) {
      setError('Username must be 3-20 characters (letters, numbers, underscores only)');
    } else if (cleanedUsername && isUsernameTaken(cleanedUsername)) {
      setError('This username is already taken. Please choose another.');
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      setError('Please enter a username');
      return;
    }

    if (!isValidUsername(username)) {
      setError('Username must be 3-20 characters (letters, numbers, underscores only)');
      return;
    }

    // Double-check uniqueness before submitting
    if (isUsernameTaken(username)) {
      setError('This username is already taken. Please choose another.');
      return;
    }

    setIsSubmitting(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    onComplete(username);
  };

  const isValid = username.length >= 3 && isValidUsername(username) && !isUsernameTaken(username);
  const displayName = formatDisplayName(username);

  return (
    <div className="size-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Image & Welcome */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative inline-block mb-6"
            >
              {userImage ? (
                <img
                  src={userImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-slate-900"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Create your identity
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200/80"
            >
              Choose a unique username for your Senti wallet
            </motion.p>
          </div>

          {/* Username Preview Card */}
          <AnimatePresence mode="wait">
            {username && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="mb-6"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <p className="text-xs text-blue-200/60 mb-2">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{displayName || 'YourNameSenti'}</p>
                      <p className="text-blue-300/70 text-sm">@{username || 'username'}.senti</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Username Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-blue-200/80 mb-2">Username</label>
              <div className={`relative rounded-2xl transition-all duration-300 ${
                isFocused ? 'ring-2 ring-cyan-400/50' : ''
              }`}>
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="yourname"
                  autoFocus
                  className={`w-full pl-12 pr-24 py-4 bg-white/10 backdrop-blur-xl border-2 rounded-2xl focus:outline-none transition-all text-lg text-white placeholder-blue-300/40 ${
                    error ? 'border-red-400/50' : isValid ? 'border-green-400/50' : 'border-white/10'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-blue-300/60 font-medium">.senti</span>
                  {isValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1.5 mt-3 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={!isValid || isSubmitting}
              whileHover={{ scale: isValid ? 1.02 : 1 }}
              whileTap={{ scale: isValid ? 0.98 : 1 }}
              className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-xs text-center text-blue-300/50"
          >
            Your username is permanent and will be your unique identity on Senti
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
