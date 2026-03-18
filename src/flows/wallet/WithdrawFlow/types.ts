export interface WithdrawFlowData {
  method:    'onchain' | 'fiat' | 'link' | null;
  asset:     'USDC' | 'USDT' | 'SOL';
  // onchain fields
  address:   string;
  network:   'Solana' | 'Ethereum' | 'BNB Chain';
  // shared
  amount:    string;
  // link (Send via Link) fields
  recipient: string;   // e.g. "@magnifico"
  note:      string;   // optional note
}
