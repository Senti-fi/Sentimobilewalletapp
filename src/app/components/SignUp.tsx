import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Sparkles, User, AlertCircle } from 'lucide-react';

interface SignUpProps {
  onComplete: (userData: { email: string; username: string; userId: string }) => void;
}

// Generate a unique user ID
const generateUserId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SENTI-${timestamp}-${randomPart}`;
};

// Validate username (alphanumeric and underscores only, 3-20 chars)
const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export default function SignUp({ onComplete }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleUsernameChange = (value: string) => {
    // Remove spaces and convert to lowercase
    const cleanedUsername = value.toLowerCase().replace(/\s/g, '');
    setUsername(cleanedUsername);

    if (cleanedUsername && !isValidUsername(cleanedUsername)) {
      setUsernameError('Username must be 3-20 characters (letters, numbers, underscores only)');
    } else {
      setUsernameError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUsername(username)) {
      setUsernameError('Please enter a valid username');
      return;
    }

    setIsCreating(true);

    // Generate unique user ID
    const userId = generateUserId();

    // Simulate wallet creation with delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    onComplete({ email, username, userId });
  };

  const handleSocialSignIn = async (provider: string) => {
    // For social sign-in, generate a username from provider
    const generatedUsername = `user_${Math.random().toString(36).substring(2, 10)}`;
    const userId = generateUserId();

    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    onComplete({ email: `${generatedUsername}@${provider}.com`, username: generatedUsername, userId });
  };

  if (isCreating) {
    return (
      <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-gray-900 text-center"
        >
          Creating Your Wallet
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-center mb-8"
        >
          Setting up your secure digital wallet...
        </motion.p>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl text-white">S</span>
              </div>
            </motion.div>
            <h1 className="mb-2 text-gray-900">Welcome to Senti</h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Choose a username"
                  required
                  className={`w-full pl-12 pr-20 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    usernameError ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">.senti</span>
              </div>
              {usernameError && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{usernameError}</span>
                </div>
              )}
              {username && !usernameError && (
                <p className="mt-1 text-sm text-gray-500">
                  Your handle will be: <span className="text-blue-600 font-medium">@{username}.senti</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              Create Wallet
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500">or continue with</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Social Sign In */}
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialSignIn('google')}
              className="w-full py-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700">Google</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialSignIn('apple')}
              className="w-full py-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-gray-700">Apple</span>
            </motion.button>
          </div>

          {/* Privacy note */}
          <p className="mt-6 text-xs text-center text-gray-500">
            By creating an account, your wallet is automatically generated and secured. No seed phrases needed!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
