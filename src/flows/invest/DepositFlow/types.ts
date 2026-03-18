import type { StepProps } from '../../savings/types';
import type { Asset } from '../../../store/types';

export interface VaultConfig {
  name: string;         // "USDC Vault" | "USDT Vault" | "Stablecoin LP"
  asset: Asset;         // asset used for deposit / balance lookup
  riskLabel: string;    // "LOW" | "MED"
  apy: number;          // 8.5 | 12.3 (used for calculations)
  withdrawal: string;   // "Instant anytime" | "1-2 hours"
  minDeposit: number;   // 10 | 50
  lucyConfirm: string;  // Lucy message on confirm screen
  lucySuccess: string;  // Lucy message on success screen
}

export interface DepositFlowData {
  amount: string;       // string form of the chosen amount, e.g. "100"
}

export type DepositStepProps = StepProps<DepositFlowData> & {
  vault: VaultConfig;
};
