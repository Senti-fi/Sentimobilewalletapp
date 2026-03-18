export interface DepositFlowData {
  method: 'crypto' | 'fiat' | null;
  amount: string;
  paymentMethod: 'bank' | 'card' | 'stripe';
}
