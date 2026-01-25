// Custom hook to gather wallet context for Lucy AI

import { useMemo } from 'react';
import { WalletContext } from '../services/lucyService';

interface UseWalletContextProps {
  totalBalance: number;
  assets: Array<{
    symbol: string;
    name: string;
    balance: number;
    value: number;
    change24h: number;
  }>;
  vaultBalance?: number;
  savingsBalance?: number;
  savingsGoals?: Array<{
    name: string;
    target: number;
    current: number;
    monthlyTarget: number;
  }>;
  transactions?: Array<{
    id: string;
    merchant: string;
    category: string;
    amount: number;
    date: string;
  }>;
  monthlyBudget?: number;
  currentSpend?: number;
}

/**
 * Hook that compiles wallet data into a context object for Lucy AI
 */
export function useWalletContext({
  totalBalance,
  assets,
  vaultBalance,
  savingsBalance,
  savingsGoals,
  transactions,
  monthlyBudget,
  currentSpend,
}: UseWalletContextProps): WalletContext {
  return useMemo(() => {
    // Extract individual asset balances
    const balances: WalletContext['balances'] = {};
    assets.forEach(asset => {
      const symbol = asset.symbol.toLowerCase();
      if (symbol === 'usdc' || symbol === 'usdt' || symbol === 'sol') {
        balances[symbol as 'usdc' | 'usdt' | 'sol'] = asset.value;
      }
    });

    // Compile vault information
    const vaults: WalletContext['vaults'] = vaultBalance
      ? [
          {
            name: 'Senti Vault',
            balance: vaultBalance,
            apy: 8.5, // Default APY, could be dynamic
          },
        ]
      : [];

    // Compile savings goals
    const goals = savingsGoals?.map(goal => ({
      name: goal.name,
      target: goal.target,
      current: goal.current,
    }));

    // Get recent transactions (last 5)
    const recentTransactions = transactions
      ?.slice(0, 5)
      .map(tx => ({
        type: tx.category,
        amount: tx.amount,
        timestamp: tx.date,
      }));

    const context: WalletContext = {
      totalBalance,
      balances,
    };

    // Add optional fields only if they exist
    if (vaults.length > 0) context.vaults = vaults;
    if (goals && goals.length > 0) context.savingsGoals = goals;
    if (monthlyBudget !== undefined) context.monthlyBudget = monthlyBudget;
    if (currentSpend !== undefined) context.currentSpend = currentSpend;
    if (recentTransactions && recentTransactions.length > 0) {
      context.recentTransactions = recentTransactions;
    }

    return context;
  }, [
    totalBalance,
    assets,
    vaultBalance,
    savingsBalance,
    savingsGoals,
    transactions,
    monthlyBudget,
    currentSpend,
  ]);
}
