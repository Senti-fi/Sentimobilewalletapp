/**
 * DepositFlow
 * Figma frames: 302:1389 → 302:1706 (crypto) | 302:2380 → 302:2548 → 302:2638 (fiat)
 *
 * Step 0 — AddMoneyStep: bottom sheet over frozen WalletPage
 * Step 1 — DepositCryptoStep (method='crypto') or BuyWithFiatStep (method='fiat')
 * Step 2 — ConfirmPurchaseStep  (fiat path only)
 * Step 3 — PurchaseSuccessfulStep (fiat path only; "Deposit More" resets to step 0)
 */
import { useFlowStepper } from '../../../hooks/useFlowStepper';
import type { DepositFlowData } from '../types';
import { useAppStore } from '../../../store';
import WalletPage from '../../../pages/wallet';
import AddMoneyStep          from './steps/AddMoneyStep';
import DepositCryptoStep     from './steps/DepositCryptoStep';
import BuyWithFiatStep       from './steps/BuyWithFiatStep';
import ConfirmPurchaseStep   from './steps/ConfirmPurchaseStep';
import PurchaseSuccessfulStep from './steps/PurchaseSuccessfulStep';

const STEPS = ['add-money', 'method', 'confirm', 'success'] as const;

const INITIAL: DepositFlowData = {
  method:        null,
  amount:        '100',
  paymentMethod: 'bank',
};

interface DepositFlowProps {
  onExit: () => void;
  /** Custom frozen background. Defaults to WalletPage when omitted. */
  background?: React.ReactNode;
}

const NOOP = () => {};

const PAYMENT_SOURCE: Record<string, string> = {
  bank:   'Bank Transfer',
  card:   'Visa / Mastercard',
  stripe: 'Stripe / MoonPay',
};

export default function DepositFlow({ onExit, background }: DepositFlowProps) {
  const { stepIndex, totalSteps, data, next, back, reset } =
    useFlowStepper<DepositFlowData>(STEPS, INITIAL, onExit);
  const { depositFunds } = useAppStore();

  const stepProps = { data, onNext: next, onBack: back, onExit, stepIndex, totalSteps };

  // Step 0: Add Money bottom sheet overlaid on frozen background
  if (stepIndex === 0) {
    return (
      <div className="relative h-full">
        {/* Frozen background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-hide">
            {background ?? <WalletPage />}
          </div>
        </div>
        {/* Add Money bottom sheet */}
        <AddMoneyStep {...stepProps} onBack={NOOP} />
      </div>
    );
  }

  // Step 1a: Deposit Crypto (no further steps; back → step 0)
  if (stepIndex === 1 && data.method === 'crypto') {
    return <DepositCryptoStep {...stepProps} />;
  }

  // Step 1b: Buy with Fiat → step 2
  if (stepIndex === 1 && data.method === 'fiat') {
    return <BuyWithFiatStep {...stepProps} />;
  }

  // Step 2: Confirm Purchase — write transaction to store before advancing
  if (stepIndex === 2) {
    return (
      <ConfirmPurchaseStep
        {...stepProps}
        onNext={() => {
          const result = depositFunds({
            asset:   'USDC',
            amount:  parseFloat(data.amount || '0'),
            source:  PAYMENT_SOURCE[data.paymentMethod ?? 'bank'] ?? 'Bank Transfer',
            txType:  'fiat_purchase',
          });
          if (result.ok) next({});
        }}
      />
    );
  }

  // Step 3: Purchase Successful
  // "Deposit More" calls next() which would exceed length — use reset instead
  if (stepIndex === 3) {
    return (
      <PurchaseSuccessfulStep
        {...stepProps}
        onNext={() => reset()}
      />
    );
  }

  return null;
}
