export interface SendFlowData {
  method: 'link' | 'address' | null;   // "Send via Link" or "Send to Address"
  recipient: string;                    // @handle or crypto address
  asset: 'USDC' | 'USDT' | 'SOL';
  amount: string;
  note?: string;
}
