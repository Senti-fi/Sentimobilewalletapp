import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { 
  Home, 
  TrendingUp, 
  ArrowLeftRight, 
  Wallet as WalletIcon,
  Send,
  Download,
  ShoppingBag,
  LockKeyhole,
  Eye,
  EyeOff,
  Bell,
  Settings,
  ChevronRight,
  PiggyBank,
  CreditCard,
  Sparkles,
  User,
  Activity,
  MessageCircle
} from 'lucide-react';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';
import SwapModal from './SwapModal';
import GrowModal from './GrowModal';
import TransactionHistory from './TransactionHistory';
import SettingsPage from './SettingsPage';
import LucyPage from './LucyPage';
import Logo from './Logo';
import SavingsPage from './SavingsPage';
import SpendPage from './SpendPage';
import LinkPage from './LinkPage';

type ModalType = 'send' | 'receive' | 'swap' | 'grow' | 'settings' | null;

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  change: number;
  changePercent: number;
  color: string;
  gradient: string;
  icon: string;
}

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'USD Coin',
    symbol: 'USDC',
    balance: 5420.50,
    value: 5420.50,
    change: 12.30,
    changePercent: 0.23,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  {
    id: '2',
    name: 'Tether',
    symbol: 'USDT',
    balance: 3500.00,
    value: 3500.00,
    change: 0,
    changePercent: 0,
    color: 'bg-white',
    gradient: 'from-teal-400 via-teal-500 to-cyan-500',
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  },
  {
    id: '3',
    name: 'Solana',
    symbol: 'SOL',
    balance: 45.32,
    value: 4250.00,
    change: 185.20,
    changePercent: 4.56,
    color: 'bg-black',
    gradient: 'from-purple-600 via-purple-700 to-indigo-900',
    icon: 'https://cryptologos.cc/logos/solana-sol-logo.png',
  },
];

export default function Dashboard() {
  // Load initial state from localStorage or use defaults
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle Date objects for investments
        if (key === 'senti_investments' && Array.isArray(parsed)) {
          return parsed.map(inv => ({
            ...inv,
            startDate: new Date(inv.startDate)
          })) as T;
        }
        // Handle transactions - restore icon functions
        if (key === 'senti_transactions' && Array.isArray(parsed)) {
          return parsed.map(t => ({
            ...t,
            icon: getIconFromName(t.icon)
          })) as T;
        }
        return parsed;
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
  };

  // Helper to restore icon functions from names
  const getIconFromName = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Send,
      Download,
      LockKeyhole,
      TrendingUp,
      ArrowLeftRight,
      ShoppingBag
    };
    return iconMap[iconName] || Send;
  };

  const [activeTab, setActiveTab] = useState<'home' | 'savings' | 'lucy' | 'spend' | 'link' | 'settings'>('home');
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [totalBalance, setTotalBalance] = useState(() => loadFromStorage('senti_totalBalance', 13170.50));
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [assets, setAssets] = useState(() => loadFromStorage('senti_assets', mockAssets));
  const [selectedAsset, setSelectedAsset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Vault balances
  const [vaultBalance, setVaultBalance] = useState(() => loadFromStorage('senti_vaultBalance', 0));
  const [vaultEarned, setVaultEarned] = useState(() => loadFromStorage('senti_vaultEarned', 0));

  // Active investments in specific pools
  const [activeInvestments, setActiveInvestments] = useState<Array<{
    id: string;
    name: string;
    amount: number;
    asset: string;
    apy: string;
    protocol: string;
    startDate: Date;
    earned: number;
  }>>(() => loadFromStorage('senti_investments', []));

  // Default transactions with external wallet examples
  const defaultTransactions = [
    {
      id: 'external-1',
      merchant: 'From 0x742d...0bEb',
      category: 'Received',
      amount: 250.00,
      date: '2 hours ago',
      icon: Download,
      color: 'text-green-600',
      bg: 'bg-green-100',
      type: 'internal' as const,
    },
    {
      id: 'external-2',
      merchant: 'From 0x8f3a...9c2D',
      category: 'Received',
      amount: 125.50,
      date: '5 hours ago',
      icon: Download,
      color: 'text-green-600',
      bg: 'bg-green-100',
      type: 'internal' as const,
    },
    {
      id: 'external-3',
      merchant: 'From 0x1bc7...4eF8',
      category: 'Received',
      amount: 500.00,
      date: 'Yesterday',
      icon: Download,
      color: 'text-green-600',
      bg: 'bg-green-100',
      type: 'internal' as const,
    },
  ];

  // Transactions state
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    id: string;
    merchant: string;
    category: string;
    amount: number;
    date: string;
    icon: any;
    color: string;
    bg: string;
    type: 'send' | 'vault' | 'investment' | 'swap' | 'internal' | 'savings'; // Track transaction type
  }>>(() => loadFromStorage('senti_transactions', defaultTransactions));

  // Security and limits state
  const [trustedRecipients, setTrustedRecipients] = useState<Set<string>>(new Set());
  const [dailySentAmount, setDailySentAmount] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());

  // Security limits (for MVP)
  const TRANSACTION_LIMIT_PER_TX = 5000; // $5,000 per transaction
  const TRANSACTION_LIMIT_DAILY = 10000; // $10,000 per day
  const LARGE_AMOUNT_WARNING = 1000; // Warn for amounts > $1,000
  const BIOMETRIC_THRESHOLD = 500; // Require biometric for > $500

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('senti_totalBalance', JSON.stringify(totalBalance));
  }, [totalBalance]);

  useEffect(() => {
    localStorage.setItem('senti_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('senti_vaultBalance', JSON.stringify(vaultBalance));
  }, [vaultBalance]);

  useEffect(() => {
    localStorage.setItem('senti_vaultEarned', JSON.stringify(vaultEarned));
  }, [vaultEarned]);

  useEffect(() => {
    localStorage.setItem('senti_investments', JSON.stringify(activeInvestments));
  }, [activeInvestments]);

  useEffect(() => {
    // Filter out icon functions before storing (they can't be serialized)
    const transactionsToStore = recentTransactions.map(t => ({
      ...t,
      icon: t.icon.name || 'Send' // Store icon name instead of function
    }));
    localStorage.setItem('senti_transactions', JSON.stringify(transactionsToStore));
  }, [recentTransactions]);

  // Calculate earnings for investments based on time elapsed
  useEffect(() => {
    if (activeInvestments.length === 0) return;

    const updateInvestmentEarnings = () => {
      setActiveInvestments(prev => prev.map(inv => {
        const daysSinceStart = Math.floor((Date.now() - new Date(inv.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const dailyRate = parseFloat(inv.apy) / 100 / 365;
        const totalEarned = inv.amount * dailyRate * daysSinceStart;
        return {
          ...inv,
          earned: totalEarned
        };
      }));
    };

    // Update immediately
    updateInvestmentEarnings();

    // Update every hour to simulate earnings growth
    const interval = setInterval(updateInvestmentEarnings, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [activeInvestments.length]);

  // Reset daily limit if it's a new day
  useEffect(() => {
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
      setDailySentAmount(0);
      setLastResetDate(today);
    }
  }, [lastResetDate]);

  // Add transaction function
  const addTransaction = (transaction: {
    merchant: string;
    category: string;
    amount: number;
    icon: any;
    color: string;
    bg: string;
    type: 'send' | 'vault' | 'investment' | 'swap' | 'internal' | 'savings';
  }) => {
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      date: 'Just now',
    };
    setRecentTransactions(prev => [newTransaction, ...prev]);
  };

  // Handle deposit to vault balance (topping up)
  const handleVaultDeposit = (amount: number, asset: string) => {
    // Update vault balance
    setVaultBalance(prev => prev + amount);

    // Deduct from total balance (money is leaving the main wallet)
    setTotalBalance(prev => prev - amount);

    // Deduct from main wallet assets
    setAssets(prevAssets =>
      prevAssets.map(a => {
        if (a.symbol === asset) {
          return {
            ...a,
            balance: a.balance - amount,
            value: a.symbol === 'SOL' ? (a.balance - amount) * (a.value / a.balance) : a.balance - amount
          };
        }
        return a;
      })
    );

    // Add to transaction history
    addTransaction({
      merchant: 'Vault Deposit',
      category: 'Vault',
      amount: -amount, // Negative because money is leaving main wallet
      icon: LockKeyhole,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      type: 'vault',
    });
  };

  // Handle withdrawal from vault balance to main wallet
  const handleVaultWithdraw = (amount: number, asset: string) => {
    // Deduct from vault balance
    setVaultBalance(prev => prev - amount);

    // Add to total balance (money is returning to the main wallet)
    setTotalBalance(prev => prev + amount);

    // Add to main wallet assets
    setAssets(prevAssets =>
      prevAssets.map(a => {
        if (a.symbol === asset) {
          return {
            ...a,
            balance: a.balance + amount,
            value: a.symbol === 'SOL' ? (a.balance + amount) * (a.value / a.balance) : a.balance + amount
          };
        }
        return a;
      })
    );

    // Add to transaction history
    addTransaction({
      merchant: 'Vault Withdrawal',
      category: 'Vault',
      amount: amount, // Positive because money is returning to main wallet
      icon: LockKeyhole,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      type: 'vault',
    });
  };

  // Handle investment into specific pool
  const handlePoolInvestment = (vaultName: string, amount: number, asset: string, apy: string, protocol: string) => {
    // Deduct from vault balance
    setVaultBalance(prev => prev - amount);

    // Add to active investments
    setActiveInvestments(prev => [...prev, {
      id: `inv-${Date.now()}`,
      name: vaultName,
      amount,
      asset,
      apy,
      protocol,
      startDate: new Date(),
      earned: 0
    }]);

    // Add to transaction history
    addTransaction({
      merchant: `${vaultName} Investment`,
      category: 'Investment',
      amount: -amount, // Negative because funds are being invested
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      type: 'investment',
    });
  };

  // Handle send transaction
  const handleSend = (amount: number, asset: string, recipient: string, recipientName: string, gasFee: number) => {
    const totalAmount = amount + gasFee;

    // Deduct from total balance
    setTotalBalance(prev => prev - totalAmount);

    // Deduct from specific asset
    setAssets(prevAssets =>
      prevAssets.map(a => {
        if (a.symbol === asset) {
          return {
            ...a,
            balance: a.balance - totalAmount,
            value: a.symbol === 'SOL' ? (a.balance - totalAmount) * (a.value / a.balance) : a.balance - totalAmount
          };
        }
        return a;
      })
    );

    // Add to transaction history
    addTransaction({
      merchant: recipientName || recipient,
      category: 'Send',
      amount: -amount, // Negative for outgoing
      icon: Send,
      color: 'text-red-600',
      bg: 'bg-red-100',
      type: 'send',
    });
  };

  // Handle receive transaction (money received from Link contacts)
  const handleReceive = (amount: number, asset: string, sender: string, senderName: string) => {
    // Add to total balance
    setTotalBalance(prev => prev + amount);

    // Add to specific asset
    setAssets(prevAssets =>
      prevAssets.map(a => {
        if (a.symbol === asset) {
          return {
            ...a,
            balance: a.balance + amount,
            value: a.symbol === 'SOL' ? (a.balance + amount) * (a.value / a.balance) : a.balance + amount
          };
        }
        return a;
      })
    );

    // Add to transaction history
    addTransaction({
      merchant: `From ${senderName}`,
      category: 'Received',
      amount: amount, // Positive for incoming
      icon: Download,
      color: 'text-green-600',
      bg: 'bg-green-100',
      type: 'internal',
    });
  };

  // Handle buy transaction (purchasing crypto with fiat)
  const handleBuy = (amount: number, asset: string, paidAmount: number, paidCurrency: string) => {
    // Add to total balance (crypto purchased)
    setTotalBalance(prev => prev + amount);

    // Add to specific asset
    setAssets(prevAssets =>
      prevAssets.map(a => {
        if (a.symbol === asset) {
          return {
            ...a,
            balance: a.balance + amount,
            value: a.symbol === 'SOL' ? (a.balance + amount) * (a.value / a.balance) : a.balance + amount
          };
        }
        return a;
      })
    );

    // Add to transaction history
    addTransaction({
      merchant: `Buy ${asset}`,
      category: 'Purchase',
      amount: amount, // Positive for incoming crypto
      icon: ShoppingBag,
      color: 'text-green-600',
      bg: 'bg-green-100',
      type: 'internal',
    });
  };

  // Handle savings deposit
  const handleSavingsDeposit = (amount: number) => {
    addTransaction({
      merchant: 'Savings Account',
      category: 'Deposit to Savings',
      amount: -amount, // Negative because money is leaving main wallet
      icon: PiggyBank,
      color: 'text-cyan-600',
      bg: 'bg-cyan-100',
      type: 'savings',
    });
  };

  // Handle savings withdrawal
  const handleSavingsWithdraw = (amount: number, destination: string) => {
    addTransaction({
      merchant: `To ${destination}`,
      category: 'Savings Withdrawal',
      amount: amount, // Positive because money is returning
      icon: Download,
      color: 'text-green-600',
      bg: 'bg-green-100',
      type: 'savings',
    });
  };

  // Handle locked savings (Lock & Earn)
  const handleSavingsLock = (amount: number, days: number, apy: string) => {
    addTransaction({
      merchant: `${days}-Day Lock (${apy}% APY)`,
      category: 'Locked Savings',
      amount: -amount, // Negative because money is being locked
      icon: LockKeyhole,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      type: 'savings',
    });
  };

  // Handle savings unlock
  const handleSavingsUnlock = (amount: number, penalty: number) => {
    const netAmount = amount - penalty;
    addTransaction({
      merchant: penalty > 0 ? `Unlocked (${penalty.toFixed(2)} penalty)` : 'Unlocked',
      category: 'Savings Unlock',
      amount: netAmount, // Net amount after penalty
      icon: LockKeyhole,
      color: penalty > 0 ? 'text-orange-600' : 'text-green-600',
      bg: penalty > 0 ? 'bg-orange-100' : 'bg-green-100',
      type: 'savings',
    });
  };

  // Handle goal contribution
  const handleGoalContribution = (amount: number, goalName: string) => {
    addTransaction({
      merchant: goalName,
      category: 'Goal Contribution',
      amount: -amount, // Negative because money is allocated to goal
      icon: TrendingUp,
      color: 'text-cyan-600',
      bg: 'bg-cyan-100',
      type: 'savings',
    });
  };

  const quickActions = [
    {
      id: 'send',
      label: 'Send',
      icon: Send,
      gradient: 'from-cyan-400 via-blue-500 to-blue-700',
      modal: 'send' as ModalType,
    },
    {
      id: 'receive',
      label: 'Receive',
      icon: Download,
      gradient: 'from-cyan-400 via-blue-500 to-blue-700',
      modal: 'receive' as ModalType,
    },
    {
      id: 'buy',
      label: 'Buy',
      icon: ShoppingBag,
      gradient: 'from-cyan-400 via-blue-500 to-blue-700',
      modal: 'swap' as ModalType,
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: LockKeyhole,
      gradient: 'from-cyan-400 via-blue-500 to-blue-700',
      modal: 'grow' as ModalType,
    },
  ];

  const handleModalClose = () => {
    setOpenModal(null);
  };

  const handleOpenLucy = () => {
    setOpenModal(null);
    setActiveTab('lucy');
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30 max-w-md mx-auto">
      {/* Minimalist Header - FIXED at top for all tabs except link/settings */}
      {activeTab !== 'link' && activeTab !== 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-none px-6 pt-6 pb-4 flex items-center justify-between bg-gradient-to-br from-gray-50 to-blue-50/30 z-10"
        >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border border-gray-200"
          >
            <User className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
          </motion.div>
          <div>
            <p className="text-xs text-gray-500">Welcome back</p>
            <p className="text-gray-900">OxSenti</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 hover:bg-white/80 rounded-xl transition-all"
          >
            <Bell className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('settings')}
            className="p-2.5 hover:bg-white/80 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </motion.button>
        </div>
      </motion.div>
      )}

      {/* Main Content */}
      <div className={`flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
        activeTab === 'link' || activeTab === 'settings'
          ? 'overflow-hidden' // Prevent parent scrolling, let child pages manage their own scrolling
          : 'overflow-y-auto pb-28 px-6 space-y-5' // Full scrolling for regular tabs with extra padding
      }`}>
        {activeTab === 'home' && (
          <>
            {/* Total Balance Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="pt-2 pb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-500">Total Balance</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {balanceVisible ? (
                    <Eye className="w-4 h-4 text-gray-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </motion.button>
              </div>
              {balanceVisible ? (
                <h1 className="text-5xl text-gray-900 tracking-tight mb-2">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
              ) : (
                <h1 className="text-5xl text-gray-900 tracking-tight mb-2">••••••</h1>
              )}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-green-700">+2.4%</span>
                </div>
                <span className="text-sm text-gray-500">+$197.50 today</span>
              </div>
            </motion.div>

            {/* Action Buttons Directly Under Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-4 gap-3"
            >
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenModal(action.modal)}
                  className="flex flex-col items-center gap-2.5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                    <action.icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs text-gray-700">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Assets List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-gray-900">Your Assets</h2>
              </div>
              
              {/* Single unified assets card */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {assets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}
                    className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                      index !== assets.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className={`w-12 h-12 ${asset.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <img src={asset.icon} alt={asset.symbol} className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 mb-0.5">{asset.symbol}</p>
                      <p className="text-xs text-gray-500">{asset.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {asset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 mb-0.5">${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      {asset.change !== 0 && (
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+{asset.changePercent}%</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Activity Preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <TransactionHistory transactions={recentTransactions} />
            </motion.div>
          </>
        )}

        {activeTab === 'savings' && (
          <SavingsPage
            onOpenLucy={handleOpenLucy}
            onSavingsDeposit={handleSavingsDeposit}
            onSavingsWithdraw={handleSavingsWithdraw}
            onSavingsLock={handleSavingsLock}
            onSavingsUnlock={handleSavingsUnlock}
            onGoalContribution={handleGoalContribution}
          />
        )}

        {activeTab === 'lucy' && (
          <LucyPage />
        )}

        {activeTab === 'spend' && (
          <SpendPage
            onOpenLucy={handleOpenLucy}
            recentTransactions={recentTransactions.filter(t => t.type === 'send')}
            onAddTransaction={addTransaction}
          />
        )}

        {activeTab === 'link' && (
          <LinkPage
            assets={assets}
            onSend={handleSend}
            onReceive={handleReceive}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            onClose={() => setActiveTab('home')}
            totalBalance={totalBalance}
            activeGoals={4}
            totalRewards={2300}
          />
        )}
      </div>

      {/* Floating Bottom Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40"
      >
        <div className="bg-white/80 backdrop-blur-2xl border border-gray-200 rounded-3xl px-4 py-2 shadow-2xl shadow-gray-300/50">
          <div className="flex items-center justify-around">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'savings', label: 'Savings', icon: PiggyBank },
              { id: 'lucy', label: 'Lucy', icon: Sparkles },
              { id: 'spend', label: 'Spend', icon: CreditCard },
              { id: 'link', label: 'Link', icon: MessageCircle },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex flex-col items-center gap-1 py-2.5 px-2 transition-all relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 rounded-2xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    className={`w-5 h-5 relative z-10 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <span
                    className={`text-xs relative z-10 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      {openModal === 'send' && (
        <SendModal
          onClose={handleModalClose}
          onOpenLucy={handleOpenLucy}
          assets={assets}
          totalBalance={totalBalance}
          onSend={handleSend}
        />
      )}
      {openModal === 'receive' && <ReceiveModal onClose={handleModalClose} />}
      {openModal === 'swap' && <SwapModal onClose={handleModalClose} onBuy={handleBuy} />}
      {openModal === 'grow' && (
        <GrowModal
          onClose={handleModalClose}
          vaultBalance={vaultBalance}
          vaultEarned={vaultEarned}
          onDeposit={handleVaultDeposit}
          onWithdraw={handleVaultWithdraw}
          onWithdrawToWallet={handleVaultWithdraw}
          onInvest={handlePoolInvestment}
          walletAssets={assets}
          activeInvestments={activeInvestments}
          totalWalletBalance={totalBalance}
        />
      )}
      {openModal === 'settings' && <SettingsModal onClose={handleModalClose} />}
    </div>
  );
}