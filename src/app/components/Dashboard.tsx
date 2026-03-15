import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Send,
  Download,
  ShoppingBag,
  LockKeyhole,
  Bell,
  PiggyBank,
  Plus,
  ArrowUpFromLine,
  Activity,
  ArrowLeftRight,
  LayoutGrid,
} from 'lucide-react';
import BottomNav, { NavTab } from './ui/BottomNav';
import WalletPage from './WalletPage';
import InvestPage from './InvestPage';
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
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
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
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
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

  const [activeTab, setActiveTab] = useState<NavTab | 'lucy' | 'analytics' | 'settings'>('home');
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
  const userHandle = localStorage.getItem('senti_user_handle') || '@user.senti';
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
      merchant: 'Received from @david.senti',
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
      merchant: 'Sent to @emma.senti',
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

  const quickActions = [
    {
      id: 'send',
      label: 'Send',
      icon: Send,
      gradient: 'from-cyan-400 via-blue-500 to-blue-700',
      modal: 'send' as ModalType,
      action: null as (() => void) | null,
    },
    {
      id: 'receive',
      label: 'Receive',
      icon: Download,
      gradient: 'from-cyan-400 via-blue-500 to-blue-700',
      modal: 'receive' as ModalType,
      action: null as (() => void) | null,
    },
    {
      id: 'buy',
      label: 'Buy',
      icon: ShoppingBag,
      gradient: 'from-cyan-400 via-blue-500 to-blue-700',
      modal: 'swap' as ModalType,
      action: null as (() => void) | null,
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: LockKeyhole,
      gradient: 'from-cyan-400 via-blue-500 to-blue-700',
      modal: 'grow' as ModalType,
      action: null as (() => void) | null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Activity,
      gradient: 'from-purple-400 via-indigo-500 to-indigo-700',
      modal: null as ModalType,
      action: () => setActiveTab('analytics'),
    },
  ];

  const handleModalClose = () => {
    setOpenModal(null);
  };

  const handleOpenLucy = () => {
    setOpenModal(null);
    setActiveTab('lucy');
  };

  // ── helpers ───────────────────────────────────────────────────────────────
  const navTab = (activeTab === 'lucy' || activeTab === 'analytics' || activeTab === 'settings')
    ? null
    : activeTab as NavTab;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a142f] max-w-md mx-auto overflow-hidden font-[Urbanist,sans-serif]">

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden relative">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="flex flex-col h-full overflow-y-auto">

            {/* Header: avatar + greeting + bell */}
            <div className="flex items-center gap-3 px-6 pt-4 pb-3">
              <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center shrink-0">
                <span className="text-[#007bff] text-xl font-bold leading-none">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-base font-semibold leading-5">Gm, {username}</p>
                <p className="text-[#8ac7ff] text-sm font-medium leading-[18px]">Your money is working for you.</p>
              </div>
              <div className="relative shrink-0">
                <Bell className="w-6 h-6 text-white" strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#ff4444]" />
              </div>
            </div>

            {/* Net Worth card */}
            <div className="mx-6 mb-5 rounded-[20px] bg-[#007bff] overflow-hidden relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] left-0 w-[88%] h-[135%] rounded-[50%] bg-white/[0.09]" />
                <div className="absolute -top-[10%] left-[87%] w-full h-[135%] rounded-[50%] bg-white/[0.09]" />
              </div>
              <div className="relative px-5 pt-5 pb-4">
                <p className="text-white text-xs font-normal leading-4 mb-2">Net Worth</p>
                <p className="text-white text-[32px] font-bold leading-8 tracking-tight mb-1">
                  {balanceVisible ? `$${formatCompactBalance(totalBalance)}` : '••••••'}
                </p>
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-white text-[11px] font-semibold">Today's Earnings</span>
                  <span className="text-[#32fc65] text-[11px] font-semibold">+$146.30 (+ 2.4%)</span>
                </div>
                {/* Dots */}
                <div className="flex items-center justify-center gap-1 mb-3">
                  <div className="w-3 h-1 rounded-full bg-[#2c14dd]" />
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
                {/* Actions */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setOpenModal('swap')}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-[#b3fbff] bg-[#007bff] text-white text-xs"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} /> Deposit
                  </button>
                  <button
                    onClick={() => setOpenModal('send')}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-[#b3fbff] bg-[#007bff] text-white text-xs"
                  >
                    <ArrowUpFromLine className="w-4 h-4" strokeWidth={2} /> Send
                  </button>
                  <button
                    onClick={() => setActiveTab('wallet')}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-[#b3fbff] bg-[#007bff] text-white text-xs"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} /> Transfer
                  </button>
                </div>
              </div>
            </div>

            {/* Savings goal cards – horizontal scroll */}
            <div className="mb-4">
              <div className="flex gap-2.5 overflow-x-auto px-6 pb-1 scrollbar-hide">
                {/* Create New Goal card */}
                <div
                  onClick={() => setActiveTab('save')}
                  className="bg-[#162040] rounded-[20px] p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] shrink-0 w-[160px] flex flex-col justify-between gap-3 min-h-[134px] cursor-pointer"
                >
                  <div className="flex items-center gap-1 self-start bg-[#d9fbff] border border-[#00e6ff] rounded-full pl-2 pr-1.5 py-1">
                    <span className="text-black text-[11px] font-normal whitespace-nowrap">Create New Goal</span>
                    <span className="text-black text-[11px]">→</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium leading-[18px]">Goal-Based Savings</p>
                    <p className="text-[#8ac7ff] text-xs font-normal leading-4 mt-1">Create a savings goal and track your progress</p>
                  </div>
                </div>
                {/* Savings goal example card (Rent) */}
                <div
                  onClick={() => setActiveTab('save')}
                  className="bg-[#162040] rounded-[20px] p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] shrink-0 w-[160px] flex flex-col gap-1 min-h-[134px] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium leading-[18px]">Rent</p>
                    <div className="flex items-center gap-1 bg-[#d9fbff] border border-[#00e6ff] rounded-full pl-2 pr-1.5 py-0.5">
                      <span className="text-black text-[10px] font-normal whitespace-nowrap">View Goal</span>
                      <span className="text-black text-[10px]">→</span>
                    </div>
                  </div>
                  <p className="text-white text-xl font-bold leading-7 tracking-tight">
                    $1,200.00
                  </p>
                  <p className="text-[#02d128] text-xs font-normal leading-4">+4.2% this month</p>
                  <p className="text-[#8ac7ff] text-xs font-medium leading-4">On track and growing</p>
                </div>
              </div>
            </div>

            {/* Vault & Investment cards – horizontal scroll */}
            <div className="mb-5">
              <div className="flex gap-2.5 overflow-x-auto px-6 pb-1 scrollbar-hide">
                {/* USDC Vault card */}
                <div
                  onClick={() => setOpenModal('grow')}
                  className="bg-[#162040] rounded-[20px] p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] shrink-0 w-[160px] flex flex-col gap-1 min-h-[134px] cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium leading-[18px]">USDC Vault</p>
                  </div>
                  <div className="flex items-center gap-1 self-start bg-[#d9fbff] border border-black rounded-full pl-2 pr-1.5 py-0.5 mb-1">
                    <span className="text-black text-[10px] font-normal whitespace-nowrap">View Portfolio</span>
                    <span className="text-black text-[10px]">→</span>
                  </div>
                  <p className="text-white text-xl font-bold leading-7 tracking-tight">
                    ${formatCompactBalance(vaultBalance)}
                  </p>
                  <p className="text-[#02d128] text-xs font-normal leading-4">+8.5% this month</p>
                  <p className="text-[#8ac7ff] text-xs font-medium leading-4">Growing daily</p>
                </div>
                {/* Stablecoin LP card */}
                <div
                  onClick={() => setActiveTab('invest')}
                  className="bg-[#162040] rounded-[20px] p-5 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] shrink-0 w-[160px] flex flex-col gap-1 min-h-[134px] cursor-pointer"
                >
                  <p className="text-white text-sm font-medium leading-[18px]">Stablecoin LP</p>
                  <p className="text-white text-xl font-bold leading-7 tracking-tight">
                    ${formatCompactBalance(vaultBalance)}
                  </p>
                  <p className="text-[#02d128] text-xs font-normal leading-4">+8.5% this month</p>
                  <p className="text-[#8ac7ff] text-xs font-medium leading-4">Earning daily returns</p>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="mx-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-base font-semibold">Recent Activities</span>
                <button onClick={() => setActiveTab('wallet')} className="text-[#8ac7ff] text-sm font-medium">View All</button>
              </div>
              <div className="flex flex-col gap-4">
                {recentTransactions.slice(0, 4).map((tx, i) => {
                  const isCredit = tx.amount >= 0;
                  const isSavings = tx.type === 'savings' || tx.type === 'vault';
                  return (
                    <div key={tx.id} className={`flex items-center gap-4 ${i < 3 ? 'pb-4 border-b border-[#1a2540]' : ''}`}>
                      <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${isSavings ? 'bg-[#162040]' : 'bg-[#1a3a6b]'}`}>
                        {tx.icon && <tx.icon className="w-5 h-5 text-white" strokeWidth={1.5} />}
                        {isSavings && (
                          <span className="absolute -bottom-0.5 -left-0.5 text-[8px] text-[#02d128] font-bold">Save</span>
                        )}
                      </div>
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-white text-sm font-medium leading-[18px] truncate max-w-[180px]">{tx.merchant}</p>
                          <p className="text-[#8ac7ff] text-xs leading-4">{tx.date}</p>
                        </div>
                        <p className={`text-sm font-medium leading-[18px] whitespace-nowrap ml-2 ${isCredit ? 'text-[#02d128]' : 'text-[#ff4444]'}`}>
                          ${Math.abs(tx.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SAVE TAB */}
        {activeTab === 'save' && (
          <SavingsPage
            onOpenLucy={handleOpenLucy}
            walletBalance={totalBalance}
            onSavingsWithdraw={handleSavingsWithdraw}
            onSavingsLock={handleSavingsLock}
            onSavingsUnlock={handleSavingsUnlock}
            onGoalContribution={handleGoalContribution}
            onExploreVaults={() => setOpenModal('grow')}
          />
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <WalletPage
            totalBalance={totalBalance}
            assets={assets}
            recentTransactions={recentTransactions}
            onDeposit={() => setOpenModal('swap')}
            onSend={() => setOpenModal('send')}
            onTransfer={() => setOpenModal('send')}
            onViewAll={() => setActiveTab('wallet')}
          />
        )}

        {/* INVEST TAB */}
        {activeTab === 'invest' && (
          <InvestPage
            vaultBalance={vaultBalance}
            vaultEarned={vaultEarned}
            activeInvestments={activeInvestments}
            onAddMore={() => setOpenModal('grow')}
            onWithdraw={() => setOpenModal('grow')}
            onOpenGrow={() => setOpenModal('grow')}
          />
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <SettingsPage
            onClose={() => setActiveTab('home')}
            totalBalance={totalBalance}
            activeGoals={4}
            totalRewards={2300}
          />
        )}

        {/* Hidden / modal-triggered pages */}
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
        {activeTab === 'analytics' && (
          <PortfolioAnalyticsPage
            assets={assets}
            totalBalance={totalBalance}
            vaultBalance={vaultBalance}
            onClose={() => setActiveTab('home')}
          />
        )}
      </div>

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      {navTab !== null && (
        <BottomNav
          active={navTab}
          onChange={(tab) => setActiveTab(tab)}
        />
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
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