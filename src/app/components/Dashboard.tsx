import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  User,
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
import BottomNav, { NavTab } from './BottomNav';
import WalletPage from './WalletPage';
import DepositCryptoPage from './DepositCryptoPage';
import BuyWithFiatPage from './BuyWithFiatPage';
import VaultDetailPage from './VaultDetailPage';
import { useWalletContext } from '../../hooks/useWalletContext';
import { useModal, ModalStep } from '@getpara/react-sdk-lite';
import { formatCompactBalance } from '../utils/formatBalance';

type ModalType = 'send' | 'receive' | 'swap' | 'grow' | 'settings' | null;
type SubPage = 'wallet' | 'deposit-crypto' | 'buy-fiat' | 'vault-detail' | null;

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
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (key === 'senti_investments' && Array.isArray(parsed)) {
          return parsed.map(inv => ({ ...inv, startDate: new Date(inv.startDate) })) as T;
        }
        if (key === 'senti_transactions' && Array.isArray(parsed)) {
          return parsed.map(t => ({ ...t, icon: getIconFromName(t.icon) })) as T;
        }
        if (key === 'senti_assets' && Array.isArray(parsed)) {
          return parsed.map((asset: Asset) => ({ ...asset, icon: assetIcons[asset.symbol] || asset.icon })) as T;
        }
        return parsed;
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
  };

  const getIconFromName = (iconName: string) => {
    const iconMap: { [key: string]: any } = { Send, Download, LockKeyhole, TrendingUp, ArrowLeftRight, ShoppingBag };
    return iconMap[iconName] || Send;
  };

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [openModal, setOpenModal] = useState<ModalType>(null);

  // Legacy tab support for internal pages
  const [legacyTab, setLegacyTab] = useState<'lucy' | 'link' | 'analytics' | 'settings' | null>(null);

  const [totalBalance, setTotalBalance] = useState(() => loadFromStorage('senti_totalBalance', 6298.55));
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [assets, setAssets] = useState(() => loadFromStorage('senti_assets', mockAssets));
  const [linkUnreadCount, setLinkUnreadCount] = useState(0);

  const rawUsername = localStorage.getItem('senti_username') || 'User';
  const username = rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1);
  const userHandle = localStorage.getItem('senti_user_handle') || '@user';

  const [vaultBalance, setVaultBalance] = useState(() => loadFromStorage('senti_vaultBalance', 0));
  const [vaultEarned, setVaultEarned] = useState(() => loadFromStorage('senti_vaultEarned', 0));

  const [activeInvestments, setActiveInvestments] = useState<Array<{
    id: string; name: string; amount: number; asset: string; apy: string; protocol: string; startDate: Date; earned: number;
  }>>(() => loadFromStorage('senti_investments', []));

  const defaultTransactions = [
    { id: 'tx-1', merchant: 'Received from @david', category: 'Received', amount: 150.00, date: '2 hours ago', icon: Download, color: 'text-green-600', bg: 'bg-green-100', type: 'internal' as const },
    { id: 'tx-2', merchant: 'Sent to @emma', category: 'Send', amount: -75.00, date: '5 hours ago', icon: Send, color: 'text-red-600', bg: 'bg-red-100', type: 'send' as const },
    { id: 'tx-3', merchant: 'Vault Deposit', category: 'Vault', amount: -500.00, date: 'Yesterday', icon: LockKeyhole, color: 'text-purple-600', bg: 'bg-purple-100', type: 'vault' as const },
    { id: 'tx-4', merchant: 'Received from 0x8f3a...9c2D', category: 'Received', amount: 320.00, date: '2 days ago', icon: Download, color: 'text-green-600', bg: 'bg-green-100', type: 'internal' as const },
    { id: 'tx-5', merchant: 'Buy USDC', category: 'Purchase', amount: 200.00, date: '3 days ago', icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-100', type: 'internal' as const },
  ];

  const [recentTransactions, setRecentTransactions] = useState<Array<{
    id: string; merchant: string; category: string; amount: number; date: string; icon: any; color: string; bg: string; type: 'send' | 'vault' | 'investment' | 'swap' | 'internal' | 'savings';
  }>>(() => loadFromStorage('senti_transactions', defaultTransactions));

  const [trustedRecipients] = useState<Set<string>>(new Set());
  const [dailySentAmount, setDailySentAmount] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());

  const walletContext = useWalletContext({ totalBalance, assets, vaultBalance, transactions: recentTransactions });

  // Persist state
  useEffect(() => { localStorage.setItem('senti_totalBalance', JSON.stringify(totalBalance)); }, [totalBalance]);
  useEffect(() => { localStorage.setItem('senti_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('senti_vaultBalance', JSON.stringify(vaultBalance)); }, [vaultBalance]);
  useEffect(() => { localStorage.setItem('senti_vaultEarned', JSON.stringify(vaultEarned)); }, [vaultEarned]);
  useEffect(() => { localStorage.setItem('senti_investments', JSON.stringify(activeInvestments)); }, [activeInvestments]);
  useEffect(() => {
    const transactionsToStore = recentTransactions.map(t => ({ ...t, icon: t.icon.name || 'Send' }));
    localStorage.setItem('senti_transactions', JSON.stringify(transactionsToStore));
  }, [recentTransactions]);

  useEffect(() => {
    if (activeInvestments.length === 0) return;
    const updateInvestmentEarnings = () => {
      setActiveInvestments(prev => prev.map(inv => {
        const daysSinceStart = Math.floor((Date.now() - new Date(inv.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const dailyRate = parseFloat(inv.apy) / 100 / 365;
        return { ...inv, earned: inv.amount * dailyRate * daysSinceStart };
      }));
    };
    updateInvestmentEarnings();
    const interval = setInterval(updateInvestmentEarnings, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeInvestments.length]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (today !== lastResetDate) { setDailySentAmount(0); setLastResetDate(today); }
  }, [lastResetDate]);

  // Transaction handler
  const addTransaction = (transaction: { merchant: string; category: string; amount: number; icon: any; color: string; bg: string; type: 'send' | 'vault' | 'investment' | 'swap' | 'internal' | 'savings'; }) => {
    setRecentTransactions(prev => [{ id: Date.now().toString(), ...transaction, date: 'Just now' }, ...prev]);
  };

  const handleVaultDeposit = (amount: number, asset: string) => {
    const assetData = assets.find(a => a.symbol === asset);
    if (!assetData || assetData.balance < amount) return;
    setVaultBalance(prev => prev + amount);
    setTotalBalance(prev => prev - amount);
    setAssets(prev => prev.map(a => {
      if (a.symbol === asset) { const pp = a.balance > 0 ? a.value / a.balance : 0; const nb = a.balance - amount; return { ...a, balance: nb, value: a.symbol === 'SOL' ? nb * pp : nb }; }
      return a;
    }));
    addTransaction({ merchant: 'Vault Deposit', category: 'Vault', amount: -amount, icon: LockKeyhole, color: 'text-purple-600', bg: 'bg-purple-100', type: 'vault' });
  };

  const handleVaultWithdraw = (amount: number, asset: string) => {
    setVaultBalance(prev => prev - amount);
    setTotalBalance(prev => prev + amount);
    setAssets(prev => prev.map(a => {
      if (a.symbol === asset) { const pp = a.balance > 0 ? a.value / a.balance : 0; const nb = a.balance + amount; return { ...a, balance: nb, value: a.symbol === 'SOL' ? nb * pp : nb }; }
      return a;
    }));
    addTransaction({ merchant: 'Vault Withdrawal', category: 'Vault', amount: amount, icon: LockKeyhole, color: 'text-purple-600', bg: 'bg-purple-100', type: 'vault' });
  };

  const handlePoolInvestment = (vaultName: string, amount: number, asset: string, apy: string, protocol: string) => {
    setVaultBalance(prev => prev - amount);
    setActiveInvestments(prev => [...prev, { id: `inv-${Date.now()}`, name: vaultName, amount, asset, apy, protocol, startDate: new Date(), earned: 0 }]);
    addTransaction({ merchant: `${vaultName} Investment`, category: 'Investment', amount: -amount, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', type: 'investment' });
  };

  const handleSend = (amount: number, asset: string, recipient: string, recipientName: string, gasFee: number) => {
    const totalAmount = amount + gasFee;
    setTotalBalance(prev => prev - totalAmount);
    setAssets(prev => prev.map(a => {
      if (a.symbol === asset) { const pp = a.balance > 0 ? a.value / a.balance : 0; const nb = a.balance - totalAmount; return { ...a, balance: nb, value: a.symbol === 'SOL' ? nb * pp : nb }; }
      return a;
    }));
    addTransaction({ merchant: recipientName || recipient, category: 'Send', amount: -amount, icon: Send, color: 'text-red-600', bg: 'bg-red-100', type: 'send' });
  };

  const handleReceive = (amount: number, asset: string, sender: string, senderName: string) => {
    setTotalBalance(prev => prev + amount);
    setAssets(prev => prev.map(a => {
      if (a.symbol === asset) { const pp = a.balance > 0 ? a.value / a.balance : 0; const nb = a.balance + amount; return { ...a, balance: nb, value: a.symbol === 'SOL' ? nb * pp : nb }; }
      return a;
    }));
    addTransaction({ merchant: `From ${senderName}`, category: 'Received', amount: amount, icon: Download, color: 'text-green-600', bg: 'bg-green-100', type: 'internal' });
  };

  const handleBuy = (amount: number, asset: string, paidAmount: number, paidCurrency: string) => {
    setTotalBalance(prev => prev + amount);
    setAssets(prev => prev.map(a => {
      if (a.symbol === asset) { const pp = a.balance > 0 ? a.value / a.balance : 0; const nb = a.balance + amount; return { ...a, balance: nb, value: a.symbol === 'SOL' ? nb * pp : nb }; }
      return a;
    }));
    addTransaction({ merchant: `Buy ${asset}`, category: 'Purchase', amount: amount, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-100', type: 'internal' });
  };

  const handleSavingsDeposit = (amount: number) => {
    addTransaction({ merchant: 'Savings Account', category: 'Deposit to Savings', amount: -amount, icon: PiggyBank, color: 'text-cyan-600', bg: 'bg-cyan-100', type: 'savings' });
  };

  const handleSavingsWithdraw = (amount: number, destination: string) => {
    addTransaction({ merchant: `To ${destination}`, category: 'Savings Withdrawal', amount: amount, icon: Download, color: 'text-green-600', bg: 'bg-green-100', type: 'savings' });
  };

  const handleSavingsLock = (amount: number, days: number, apy: string) => {
    addTransaction({ merchant: `${days}-Day Lock (${apy}% APY)`, category: 'Locked Savings', amount: -amount, icon: LockKeyhole, color: 'text-blue-600', bg: 'bg-blue-100', type: 'savings' });
  };

  const handleSavingsUnlock = (amount: number, penalty: number) => {
    const netAmount = amount - penalty;
    addTransaction({ merchant: penalty > 0 ? `Unlocked (${penalty.toFixed(2)} penalty)` : 'Unlocked', category: 'Savings Unlock', amount: netAmount, icon: LockKeyhole, color: penalty > 0 ? 'text-orange-600' : 'text-green-600', bg: penalty > 0 ? 'bg-orange-100' : 'bg-green-100', type: 'savings' });
  };

  const handleGoalContribution = (amount: number, goalName: string) => {
    addTransaction({ merchant: goalName, category: 'Goal Contribution', amount: -amount, icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-100', type: 'savings' });
  };

  const [actionSheet, setActionSheet] = useState<'transfer' | 'add-money' | null>(null);
  const [vaultAutoDeposit, setVaultAutoDeposit] = useState(false);
  const [savingsAutoDeposit, setSavingsAutoDeposit] = useState(false);

  const handleModalClose = () => setOpenModal(null);
  const handleOpenLucy = () => { setOpenModal(null); setLegacyTab('lucy'); };

  // Handle tab changes from bottom nav
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setSubPage(null);
    setLegacyTab(null);
    setSavingsAutoDeposit(false);
  };

  // Determine if we should show the bottom nav
  const showBottomNav = !subPage && !legacyTab && !openModal;

  return (
    <div className="absolute inset-0 flex flex-col bg-senti-bg max-w-md mx-auto overflow-x-hidden">
      {/* Sub-pages (full screen overlays) */}
      {subPage === 'wallet' && (
        <WalletPage
          onBack={() => setSubPage(null)}
          totalBalance={totalBalance}
          assets={assets}
          transactions={recentTransactions}
          onDeposit={() => setSubPage('deposit-crypto')}
          onSend={() => { setSubPage(null); setOpenModal('send'); }}
          onTransfer={() => setActionSheet('transfer')}
          onReceive={() => setSubPage('deposit-crypto')}
        />
      )}

      {subPage === 'deposit-crypto' && (
        <DepositCryptoPage onBack={() => setSubPage(null)} />
      )}

      {subPage === 'buy-fiat' && (
        <BuyWithFiatPage
          onBack={() => setSubPage(null)}
          onBuy={handleBuy}
        />
      )}

      {subPage === 'vault-detail' && (
        <VaultDetailPage
          onBack={() => setSubPage(null)}
          onAddMore={() => { setSubPage(null); setVaultAutoDeposit(true); setOpenModal('grow'); }}
          onWithdraw={() => { setSubPage(null); setOpenModal('grow'); }}
        />
      )}

      {/* Legacy tabs - full screen */}
      {legacyTab === 'lucy' && (
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

      {legacyTab === 'link' && (
        <LinkPage
          assets={assets}
          onSend={handleSend}
          onReceive={handleReceive}
          onUnreadCountChange={setLinkUnreadCount}
        />
      )}

      {legacyTab === 'settings' && (
        <SettingsPage
          onClose={() => setLegacyTab(null)}
          totalBalance={totalBalance}
          activeGoals={4}
          totalRewards={2300}
        />
      )}

      {legacyTab === 'analytics' && (
        <PortfolioAnalyticsPage
          assets={assets}
          totalBalance={totalBalance}
          vaultBalance={vaultBalance}
          onClose={() => setLegacyTab(null)}
        />
      )}

      {/* Main content — only show when no subpage or legacy tab */}
      {!subPage && !legacyTab && (
        <>
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-none px-5 pt-12 pb-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-senti-card border border-senti-card-border rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-senti-text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-senti-text-muted">Welcome back</p>
                    <p className="text-white">{username}<span className="text-senti-cyan">Senti</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all">
                    <Bell className="w-5 h-5 text-senti-text-secondary" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => setLegacyTab('settings')} className="p-2.5 hover:bg-white/5 rounded-xl transition-all">
                    <Settings className="w-5 h-5 text-senti-text-secondary" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>

              {/* Scrollable content */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pb-24 px-5 space-y-5">
                {/* Balance */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pt-2 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-senti-text-muted">Total Balance</p>
                    <button onClick={() => setBalanceVisible(!balanceVisible)} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                      {balanceVisible ? <Eye className="w-4 h-4 text-senti-text-muted" /> : <EyeOff className="w-4 h-4 text-senti-text-muted" />}
                    </button>
                  </div>
                  {balanceVisible ? (
                    <h1 className="text-5xl text-white tracking-tight mb-2 truncate">${formatCompactBalance(totalBalance)}</h1>
                  ) : (
                    <h1 className="text-5xl text-white tracking-tight mb-2">••••••</h1>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-senti-green/20 rounded-full">
                      <TrendingUp className="w-3.5 h-3.5 text-senti-green" />
                      <span className="text-xs text-senti-green">+2.4%</span>
                    </div>
                    <span className="text-sm text-senti-text-muted">+$197.50 today</span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActionSheet('transfer')} className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                      <ArrowUpRight className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-xs text-senti-text-secondary font-medium">Transfer</span>
                  </motion.button>

                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActionSheet('add-money')} className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                      <Plus className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-xs text-senti-text-secondary font-medium">Add Money</span>
                  </motion.button>

                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOpenModal('grow')} className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                      <LockKeyhole className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-xs text-senti-text-secondary font-medium">Vault</span>
                  </motion.button>
                </motion.div>

                {/* Assets */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-white">Your Assets</h2>
                  </div>
                  <div className="bg-senti-card border border-senti-card-border rounded-2xl overflow-hidden">
                    {assets.map((asset, index) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors ${
                          index !== assets.length - 1 ? 'border-b border-senti-card-border' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-senti-card border border-senti-card-border flex items-center justify-center flex-shrink-0">
                          <img src={asset.icon} alt={asset.symbol} className="w-6 h-6 object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white mb-0.5">{asset.symbol}</p>
                          <p className="text-xs text-senti-text-muted truncate">{formatCompactBalance(asset.balance)} {asset.symbol}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white mb-0.5">${formatCompactBalance(asset.value)}</p>
                          {asset.change !== 0 && (
                            <div className="flex items-center justify-end gap-1">
                              <TrendingUp className="w-3 h-3 text-senti-green" />
                              <span className="text-xs text-senti-green">+{asset.changePercent}%</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Activity */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <TransactionHistory transactions={recentTransactions} />
                </motion.div>
              </div>
            </>
          )}

          {/* SAVE TAB */}
          {activeTab === 'save' && (
            <div className="flex-1 min-h-0 overflow-hidden">
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
            </div>
          )}

          {/* WALLET TAB */}
          {activeTab === 'wallet' && (
            <WalletPage
              onBack={() => setActiveTab('home')}
              totalBalance={totalBalance}
              assets={assets}
              transactions={recentTransactions}
              onDeposit={() => setSubPage('deposit-crypto')}
              onSend={() => setOpenModal('send')}
              onTransfer={() => setActionSheet('transfer')}
              onReceive={() => setSubPage('deposit-crypto')}
            />
          )}

          {/* INVEST TAB */}
          {activeTab === 'invest' && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <GrowModal
                onClose={() => setActiveTab('home')}
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
            </div>
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
        </>
      )}

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {/* Modals */}
      {openModal === 'send' && (
        <SendModal onClose={handleModalClose} onOpenLucy={handleOpenLucy} assets={assets} totalBalance={totalBalance} onSend={handleSend} />
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setActionSheet(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-senti-card w-full max-w-md rounded-t-3xl p-6 pb-8 border-t border-senti-card-border"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Transfer</h2>
                <button onClick={() => setActionSheet(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-senti-text-secondary" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Send, label: 'Send to User', desc: 'Send crypto to a contact or address', action: () => { setActionSheet(null); setOpenModal('send'); } },
                  { icon: LockKeyhole, label: 'Transfer to Vault', desc: 'Move funds to your vault for yield', action: () => { setActionSheet(null); setVaultAutoDeposit(true); setOpenModal('grow'); } },
                  { icon: PiggyBank, label: 'Transfer to Savings', desc: 'Move funds into a savings goal', action: () => { setActionSheet(null); setSavingsAutoDeposit(true); setActiveTab('save'); } },
                  { icon: CreditCard, label: 'Transfer to Spend', desc: 'Move funds to your spend card', action: () => { setActionSheet(null); } },
                  { icon: Building2, label: 'Withdraw to Bank', desc: 'Send USDT and recipient gets Naira', action: () => { setActionSheet(null); } },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-senti-cyan/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-senti-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-senti-text-muted">{item.desc}</p>
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setActionSheet(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-senti-card w-full max-w-md rounded-t-3xl p-6 pb-8 border-t border-senti-card-border"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Add Money</h2>
                <button onClick={() => setActionSheet(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-senti-text-secondary" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { icon: ShoppingBag, label: 'Buy Crypto', desc: 'Purchase crypto with card or bank', action: () => { setActionSheet(null); setSubPage('buy-fiat'); } },
                  { icon: QrCode, label: 'Deposit Crypto', desc: 'Receive crypto via QR or address', action: () => { setActionSheet(null); setSubPage('deposit-crypto'); } },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-senti-cyan/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-senti-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-senti-text-muted">{item.desc}</p>
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
