import { useState } from 'react';
import { motion } from 'motion/react';
import { User, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface UsernameSetupProps {
  onComplete: (username: string) => void;
  userImage?: string;
}

// Validate username (alphanumeric and underscores only, 3-20 chars)
const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export default function UsernameSetup({ onComplete, userImage }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUsernameChange = (value: string) => {
    // Remove spaces, special chars and convert to lowercase
    const cleanedUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanedUsername);

    if (cleanedUsername && !isValidUsername(cleanedUsername)) {
      setError('Username must be 3-20 characters (letters, numbers, underscores only)');
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

    setIsSubmitting(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    onComplete(username);
  };

  const isValid = username.length >= 3 && isValidUsername(username);

  return (
    <div className="size-full flex flex-col bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            {userImage ? (
              <motion.img
                src={userImage}
                alt="Profile"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
              />
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-block mb-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </motion.div>
            )}
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Choose your username</h1>
            <p className="text-gray-600">This will be your unique identity on Senti</p>
          </div>

          {/* Username Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="yourname"
                  autoFocus
                  className={`w-full pl-12 pr-20 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg ${
                    error ? 'border-red-300' : isValid ? 'border-green-300' : 'border-gray-200'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">.senti</span>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 mt-2 text-red-500 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Success preview */}
              {isValid && !error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 mt-2 text-green-600 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Your handle: <span className="font-semibold">@{username}.senti</span></span>
                </motion.div>
              )}
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={!isValid || isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {isSubmitting ? 'Creating...' : 'Continue'}
            </motion.button>
          </form>

          {/* Info */}
          <p className="mt-6 text-xs text-center text-gray-400">
            Your username cannot be changed later. Choose wisely!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
