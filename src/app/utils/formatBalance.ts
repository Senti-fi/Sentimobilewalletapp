// Format large numbers compactly to prevent overflow
export function formatCompactBalance(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}T`;
  if (abs >= 1e9) return `${(value / 1e9).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
  if (abs >= 1e6) return `${(value / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format transaction amount with proper sign and compact notation
export function formatTransactionAmount(amount: number): string {
  const formatted = formatCompactBalance(Math.abs(amount));
  return amount < 0 ? `-$${formatted}` : `+$${formatted}`;
}
