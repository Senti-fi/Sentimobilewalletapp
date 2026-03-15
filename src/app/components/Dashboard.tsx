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
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>

            {/* Header: avatar + greeting + bell */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 24px 12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#00e6ff', fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'white', fontSize: '16px', fontWeight: 600, lineHeight: '20px', margin: 0 }}>Gm, {username}</p>
                <p style={{ color: '#8ac7ff', fontSize: '14px', fontWeight: 500, lineHeight: '18px', margin: 0 }}>Your money is working for you.</p>
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Bell style={{ width: '24px', height: '24px', color: 'white' }} strokeWidth={1.5} />
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: '#ff4444' }} />
              </div>
            </div>

            {/* Net Worth / Balance card */}
            <div id="senti-balance-card" data-testid="balance-card" style={{ margin: '0 24px 20px', borderRadius: '20px', background: '#0096c7', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              {/* Wave decorations */}
              <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '90%', height: '140%', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '80%', height: '140%', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ color: 'white', fontSize: '13px', margin: '0 0 8px' }}>Net Worth</p>
                <p style={{ color: 'white', fontSize: '34px', fontWeight: 700, lineHeight: '40px', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
                  {balanceVisible ? `$${formatCompactBalance(totalBalance)}` : '\u2022\u2022\u2022\u2022\u2022\u2022'}
                </p>
                <p style={{ margin: '0 0 16px', fontSize: '12px' }}>
                  <span style={{ color: 'white', fontWeight: 600 }}>{"Today's Earnings "}</span>
                  <span style={{ color: '#32fc65', fontWeight: 600 }}>+$146.30 (+ 2.4%)</span>
                </p>
                {/* Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '16px' }}>
                  <span style={{ display: 'block', width: '14px', height: '5px', borderRadius: '100px', background: '#1d4ed8' }} />
                  <span style={{ display: 'block', width: '5px', height: '5px', borderRadius: '100px', background: 'white' }} />
                  <span style={{ display: 'block', width: '5px', height: '5px', borderRadius: '100px', background: 'white' }} />
                  <span style={{ display: 'block', width: '5px', height: '5px', borderRadius: '100px', background: 'rgba(255,255,255,0.5)' }} />
                </div>
                {/* Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button onClick={() => setOpenModal('swap')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '100px', border: '1.5px solid rgba(179,251,255,0.5)', background: 'none', color: 'white', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Plus size={16} strokeWidth={2} /> Deposit
                  </button>
                  <button onClick={() => setOpenModal('send')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '100px', border: '1.5px solid rgba(179,251,255,0.5)', background: 'none', color: 'white', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <ArrowUpFromLine size={16} strokeWidth={2} /> Send
                  </button>
                  <button onClick={() => setActiveTab('wallet')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '100px', border: '1.5px solid rgba(179,251,255,0.5)', background: 'none', color: 'white', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Send size={16} strokeWidth={2} /> Transfer
                  </button>
                </div>
              </div>
            </div>

            {/* Savings goal cards – horizontal scroll */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '4px' }}>
                {/* Create New Goal card */}
                <div
                  onClick={() => setActiveTab('save')}
                  style={{ width: '200px', minWidth: '200px', minHeight: '150px', background: '#162040', borderRadius: '20px', padding: '20px', boxShadow: '0px 4px 16px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', background: '#d9fbff', border: '1px solid #00e6ff', borderRadius: '9999px', padding: '4px 6px 4px 8px' }}>
                    <span style={{ color: 'black', fontSize: '11px', whiteSpace: 'nowrap' }}>Create New Goal</span>
                    <span style={{ color: 'black', fontSize: '11px' }}>→</span>
                  </div>
                  <div>
                    <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, lineHeight: '18px', margin: 0 }}>Goal-Based Savings</p>
                    <p style={{ color: '#8ac7ff', fontSize: '12px', lineHeight: '16px', marginTop: '4px', margin: '4px 0 0' }}>Create a savings goal and track your progress</p>
                  </div>
                </div>
                {/* Rent goal card */}
                <div
                  onClick={() => setActiveTab('save')}
                  style={{ width: '200px', minWidth: '200px', minHeight: '150px', background: '#162040', borderRadius: '20px', padding: '20px', boxShadow: '0px 4px 16px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, lineHeight: '18px', margin: 0 }}>Rent</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#d9fbff', border: '1px solid #00e6ff', borderRadius: '9999px', padding: '2px 6px 2px 8px' }}>
                      <span style={{ color: 'black', fontSize: '10px', whiteSpace: 'nowrap' }}>View Goal</span>
                      <span style={{ color: 'black', fontSize: '10px' }}>→</span>
                    </div>
                  </div>
                  <p style={{ color: 'white', fontSize: '22px', fontWeight: 700, lineHeight: '28px', letterSpacing: '-0.3px', margin: 0 }}>$1,200.00</p>
                  <p style={{ color: '#02d128', fontSize: '12px', lineHeight: '16px', margin: 0 }}>+4.2% this month</p>
                  <p style={{ color: '#8ac7ff', fontSize: '12px', lineHeight: '16px', margin: 0 }}>On track and growing</p>
                </div>
              </div>
            </div>

            {/* Vault & Investment cards – horizontal scroll */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '4px' }}>
                {/* USDC Vault card */}
                <div
                  onClick={() => setOpenModal('grow')}
                  style={{ width: '200px', minWidth: '200px', minHeight: '150px', background: '#162040', borderRadius: '20px', padding: '20px', boxShadow: '0px 4px 16px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, lineHeight: '18px', margin: 0 }}>USDC Vault</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#d9fbff', border: '1px solid #000', borderRadius: '9999px', padding: '2px 6px 2px 8px' }}>
                      <span style={{ color: 'black', fontSize: '10px', whiteSpace: 'nowrap' }}>View Portfolio</span>
                      <span style={{ color: 'black', fontSize: '10px' }}>→</span>
                    </div>
                  </div>
                  <p style={{ color: 'white', fontSize: '22px', fontWeight: 700, lineHeight: '28px', letterSpacing: '-0.3px', margin: 0 }}>${formatCompactBalance(vaultBalance)}</p>
                  <p style={{ color: '#02d128', fontSize: '12px', lineHeight: '16px', margin: 0 }}>+8.5% this month</p>
                  <p style={{ color: '#8ac7ff', fontSize: '12px', lineHeight: '16px', margin: 0 }}>Growing daily</p>
                </div>
                {/* Stablecoin LP card */}
                <div
                  onClick={() => setActiveTab('invest')}
                  style={{ width: '200px', minWidth: '200px', minHeight: '150px', background: '#162040', borderRadius: '20px', padding: '20px', boxShadow: '0px 4px 16px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, lineHeight: '18px', margin: 0 }}>Stablecoin LP</p>
                  <p style={{ color: 'white', fontSize: '22px', fontWeight: 700, lineHeight: '28px', letterSpacing: '-0.3px', margin: 0 }}>${formatCompactBalance(vaultBalance)}</p>
                  <p style={{ color: '#02d128', fontSize: '12px', lineHeight: '16px', margin: 0 }}>+8.5% this month</p>
                  <p style={{ color: '#8ac7ff', fontSize: '12px', lineHeight: '16px', margin: 0 }}>Earning daily returns</p>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div style={{ margin: '0 24px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}>Recent Activities</span>
                <button onClick={() => setActiveTab('wallet')} style={{ color: '#8ac7ff', fontSize: '14px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {recentTransactions.slice(0, 4).map((tx, i) => {
                  const isCredit = tx.amount >= 0;
                  return (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: i < 3 ? '16px' : '0', marginBottom: i < 3 ? '16px' : '0', borderBottom: i < 3 ? '1px solid #1a2540' : 'none' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#162040' }}>
                        {tx.icon && <tx.icon style={{ width: '20px', height: '20px', color: 'white' }} strokeWidth={1.5} />}
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, lineHeight: '18px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{tx.merchant}</p>
                          <p style={{ color: '#8ac7ff', fontSize: '12px', lineHeight: '16px', margin: 0 }}>{tx.date}</p>
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: '18px', whiteSpace: 'nowrap', marginLeft: '8px', margin: 0, color: isCredit ? '#02d128' : '#ff4444' }}>
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