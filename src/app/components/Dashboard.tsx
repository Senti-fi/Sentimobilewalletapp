import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
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
  PiggyBank,
  CreditCard,
  Smile,
  User,
  Activity,
  MessageCircle,
  ArrowUpRight,
  Plus,
  QrCode,
  Building2,
  X
} from 'lucide-react';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';
import SwapModal from './SwapModal';
import GrowModal from './GrowModal';
import TransactionHistory from './TransactionHistory';
import SettingsPage from './SettingsPage';
import SettingsModal from './SettingsModal';
import LucyPage from './LucyPage';
import Logo from './Logo';
import SavingsPage from './SavingsPage';
import SpendPage from './SpendPage';
import LinkPage from './LinkPage';
import PortfolioAnalyticsPage from './PortfolioAnalyticsPage';
import { useWalletContext } from '../../hooks/useWalletContext';
import { useModal, ModalStep } from '@getpara/react-sdk-lite';

type ModalType = 'send' | 'receive' | 'swap' | 'grow' | 'settings' | null;

// Format large numbers compactly to prevent overflow
function formatCompactBalance(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}T`;
  if (abs >= 1e9) return `${(value / 1e9).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
  if (abs >= 1e6) return `${(value / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

const assetIcons: Record<string, string> = {
  USDC: '/tokens/usdc.png',
  USDT: '/tokens/usdt.png',
  SOL: '/tokens/sol.png',
};

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'USD Coin',
    symbol: 'USDC',
    balance: 2847.65,
    value: 2847.65,
    change: 0,
    changePercent: 0,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    icon: assetIcons.USDC,
  },
  {
    id: '2',
    name: 'Tether',
    symbol: 'USDT',
    balance: 1523.40,
    value: 1523.40,
    change: 0,
    changePercent: 0,
    color: 'bg-white',
    gradient: 'from-teal-400 via-teal-500 to-cyan-500',
    icon: assetIcons.USDT,
  },
  {
    id: '3',
    name: 'Solana',
    symbol: 'SOL',
    balance: 12.85,
    value: 1927.50,
    change: 45.20,
    changePercent: 2.40,
    color: 'bg-black',
    gradient: 'from-purple-600 via-purple-700 to-indigo-900',
    icon: assetIcons.SOL,
  },
];

export default function Dashboard() {
  const { openModal: openParaModal } = useModal();
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
        if (key === 'senti_assets' && Array.isArray(parsed)) {
          return parsed.map((asset: Asset) => ({
            ...asset,
            icon: assetIcons[asset.symbol] || asset.icon,
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

  const [activeTab, setActiveTab] = useState<'home' | 'savings' | 'lucy' | 'spend' | 'link' | 'analytics' | 'settings'>('home');
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [totalBalance, setTotalBalance] = useState(() => loadFromStorage('senti_totalBalance', 6298.55));
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [assets, setAssets] = useState(() => loadFromStorage('senti_assets', mockAssets));
  const [selectedAsset, setSelectedAsset] = useState(0);
  const [linkUnreadCount, setLinkUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // User profile data from localStorage
  // Always capitalize first letter for display (e.g., "tomi" -> "Tomi")
  const rawUsername = localStorage.getItem('senti_username') || 'User';
  const username = rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1);
  const userHandle = localStorage.getItem('senti_user_handle') || '@user';
  const userId = localStorage.getItem('senti_user_id') || '';

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

  // Default transactions with realistic examples
  const defaultTransactions = [
    {
      id: 'tx-1',
      merchant: 'Received from @david',
      category: 'Received',
      amount: 150.00,
      date: '2 hours ago',
      icon: Download,
      color: 'text-green-600',
      bg: 'bg-green-100',
      type: 'internal' as const,
    },
    {
      id: 'tx-2',
      merchant: 'Sent to @emma',
      category: 'Send',
      amount: -75.00,
      date: '5 hours ago',
      icon: Send,
      color: 'text-red-600',
      bg: 'bg-red-100',
      type: 'send' as const,
    },
    {
      id: 'tx-3',
      merchant: 'Vault Deposit',
      category: 'Vault',
      amount: -500.00,
      date: 'Yesterday',
      icon: LockKeyhole,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      type: 'vault' as const,
    },
    {
      id: 'tx-4',
      merchant: 'Received from 0x8f3a...9c2D',
      category: 'Received',
      amount: 320.00,
      date: '2 days ago',
      icon: Download,
      color: 'text-green-600',
      bg: 'bg-green-100',
      type: 'internal' as const,
    },
    {
      id: 'tx-5',
      merchant: 'Buy USDC',
      category: 'Purchase',
      amount: 200.00,
      date: '3 days ago',
      icon: ShoppingBag,
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

  // Wallet context for Lucy AI
  const walletContext = useWalletContext({
    totalBalance,
    assets,
    vaultBalance,
    transactions: recentTransactions,
  });

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
    // Validate sufficient balance
    const assetData = assets.find(a => a.symbol === asset);
    if (!assetData || assetData.balance < amount) return;

    // Update vault balance
    setVaultBalance(prev => prev + amount);

    // Deduct from total balance (money is leaving the main wallet)
    setTotalBalance(prev => prev - amount);

    // Deduct from main wallet assets
    setAssets(prevAssets =>
      prevAssets.map(a => {
        if (a.symbol === asset) {
          const pricePerUnit = a.balance > 0 ? a.value / a.balance : 0;
          const newBalance = a.balance - amount;
          return {
            ...a,
            balance: newBalance,
            value: a.symbol === 'SOL' ? newBalance * pricePerUnit : newBalance
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
          const pricePerUnit = a.balance > 0 ? a.value / a.balance : 0;
          const newBalance = a.balance + amount;
          return {
            ...a,
            balance: newBalance,
            value: a.symbol === 'SOL' ? newBalance * pricePerUnit : newBalance
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
          const pricePerUnit = a.balance > 0 ? a.value / a.balance : 0;
          const newBalance = a.balance - totalAmount;
          return {
            ...a,
            balance: newBalance,
            value: a.symbol === 'SOL' ? newBalance * pricePerUnit : newBalance
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
          const pricePerUnit = a.balance > 0 ? a.value / a.balance : 0;
          const newBalance = a.balance + amount;
          return {
            ...a,
            balance: newBalance,
            value: a.symbol === 'SOL' ? newBalance * pricePerUnit : newBalance
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
          const pricePerUnit = a.balance > 0 ? a.value / a.balance : 0;
          const newBalance = a.balance + amount;
          return {
            ...a,
            balance: newBalance,
            value: a.symbol === 'SOL' ? newBalance * pricePerUnit : newBalance
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

  // Action sheet state for Transfer / Add Money sub-menus
  const [actionSheet, setActionSheet] = useState<'transfer' | 'add-money' | null>(null);
  // Auto-open flags for sub-page modals (triggered from Transfer action sheet)
  const [vaultAutoDeposit, setVaultAutoDeposit] = useState(false);
  const [savingsAutoDeposit, setSavingsAutoDeposit] = useState(false);

  const handleModalClose = () => {
    setOpenModal(null);
  };

  const handleOpenLucy = () => {
    setOpenModal(null);
    setActiveTab('lucy');
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30 max-w-md mx-auto overflow-x-hidden">
      {/* Minimalist Header - FIXED at top for all tabs except link/settings/lucy/analytics */}
      {activeTab !== 'link' && activeTab !== 'settings' && activeTab !== 'lucy' && activeTab !== 'analytics' && (
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
            <p className="text-gray-900">{username}<span className="text-blue-600">Senti</span></p>
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
      <div className={`flex-1 min-h-0 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
        activeTab === 'link' || activeTab === 'settings' || activeTab === 'lucy' || activeTab === 'analytics' || activeTab === 'savings' || activeTab === 'spend'
          ? 'overflow-hidden' // Prevent parent scrolling, let child pages manage their own scrolling
          : 'overflow-y-auto overflow-x-hidden overscroll-contain pb-24 px-6 space-y-5' // Full scrolling for regular tabs
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
                <h1 className="text-5xl text-gray-900 tracking-tight mb-2 truncate">
                  ${formatCompactBalance(totalBalance)}
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

            {/* Action Buttons - 3 clean buttons: Transfer, Add Money, Vault */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-3"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActionSheet('transfer')}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-sm">
                  <ArrowUpRight className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs text-gray-600 font-medium">Transfer</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActionSheet('add-money')}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-sm">
                  <Plus className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs text-gray-600 font-medium">Add Money</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenModal('grow')}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-sm">
                  <LockKeyhole className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs text-gray-600 font-medium">Vault</span>
              </motion.button>
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
                      <p className="text-xs text-gray-500 truncate">{formatCompactBalance(asset.balance)} {asset.symbol}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-gray-900 mb-0.5">${formatCompactBalance(asset.value)}</p>
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
            walletBalance={totalBalance}
            onSavingsWithdraw={handleSavingsWithdraw}
            onSavingsLock={handleSavingsLock}
            onSavingsUnlock={handleSavingsUnlock}
            onGoalContribution={handleGoalContribution}
            onExploreVaults={() => setOpenModal('grow')}
            autoOpenDeposit={savingsAutoDeposit}
          />
        )}

        {activeTab === 'lucy' && (
          <LucyPage
            walletContext={walletContext}
            onOpenSendModal={() => setOpenModal('send')}
            onOpenDepositModal={() => setOpenModal('grow')}
            onOpenSwapModal={() => setOpenModal('swap')}
            onAddTransaction={addTransaction}
            onVaultDeposit={handleVaultDeposit}
            onVaultWithdraw={handleVaultWithdraw}
          />
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
            onUnreadCountChange={setLinkUnreadCount}
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

        {activeTab === 'analytics' && (
          <PortfolioAnalyticsPage
            assets={assets}
            totalBalance={totalBalance}
            vaultBalance={vaultBalance}
            onClose={() => setActiveTab('home')}
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
              { id: 'lucy', label: 'Lucy', icon: Smile },
              { id: 'spend', label: 'Spend', icon: CreditCard },
              { id: 'link', label: 'Link', icon: MessageCircle },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const badge = tab.id === 'link' && linkUnreadCount > 0 ? linkUnreadCount : 0;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSavingsAutoDeposit(false); setActiveTab(tab.id as any); }}
                  className="flex items-center justify-center p-3 transition-all relative"
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
                  {badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 z-20 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-sm">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
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
          onClose={() => { handleModalClose(); setVaultAutoDeposit(false); }}
          vaultBalance={vaultBalance}
          vaultEarned={vaultEarned}
          onDeposit={handleVaultDeposit}
          onWithdraw={handleVaultWithdraw}
          onWithdrawToWallet={handleVaultWithdraw}
          onInvest={handlePoolInvestment}
          walletAssets={assets}
          activeInvestments={activeInvestments}
          totalWalletBalance={totalBalance}
          autoDeposit={vaultAutoDeposit}
        />
      )}
      {openModal === 'settings' && <SettingsModal onClose={handleModalClose} />}

      {/* Transfer Action Sheet */}
      <AnimatePresence>
        {actionSheet === 'transfer' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setActionSheet(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-8"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Transfer</h2>
                <button onClick={() => setActionSheet(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Send, label: 'Send to User', desc: 'Send crypto to a contact or address', action: () => { setActionSheet(null); setOpenModal('send'); } },
                  { icon: LockKeyhole, label: 'Transfer to Vault', desc: 'Move funds to your vault for yield', action: () => { setActionSheet(null); setVaultAutoDeposit(true); setOpenModal('grow'); } },
                  { icon: PiggyBank, label: 'Transfer to Savings', desc: 'Move funds into a savings goal', action: () => { setActionSheet(null); setSavingsAutoDeposit(true); setActiveTab('savings'); } },
                  { icon: CreditCard, label: 'Transfer to Spend', desc: 'Move funds to your spend card', action: () => { setActionSheet(null); setActiveTab('spend'); } },
                  { icon: Building2, label: 'Withdraw to Bank', desc: 'Send USDT and recipient gets Naira', action: () => { setActionSheet(null); setActiveTab('spend'); } },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Money Action Sheet */}
      <AnimatePresence>
        {actionSheet === 'add-money' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setActionSheet(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-8"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Add Money</h2>
                <button onClick={() => setActionSheet(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { icon: ShoppingBag, label: 'Buy Crypto', desc: 'Purchase crypto with card or bank', action: () => { setActionSheet(null); openParaModal({ step: ModalStep.ADD_FUNDS_BUY }); } },
                  { icon: QrCode, label: 'Share Address', desc: 'Show QR code or wallet address', action: () => { setActionSheet(null); setOpenModal('receive'); } },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
