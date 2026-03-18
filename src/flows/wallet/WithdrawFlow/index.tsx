/**
 * WithdrawFlow
 *
 * Step 0 — WithdrawOptionsStep: bottom sheet over frozen WalletPage.
 *
 * Onchain path (method='onchain'):
 *   Step 1 — OnchainWithdrawalStep   (asset, address, network, amount)
 *   Step 2 — ConfirmWithdrawStep     (review + confirm)
 *   Step 3 — WithdrawInitiatedStep   (success/processing)
 *
 * Fiat path (method='fiat'):
 *   Step 1 — SellForFiatStep         (asset + big amount + exchange info + bank)
 *   Step 2 — ConfirmSaleStep         ("Confirm Sale")
 *   Step 3 — SaleInitiatedStep       (success/processing)
 *
 * Send via Link path (method='link'):
 *   Step 1 — LinkRecipientStep       (search / pick recent contact)
 *   Step 2 — LinkAmountStep          (recipient card + asset + amount + note)
 *   Step 3 — ConfirmLinkStep         ("Confirm Transfer")
 *   Step 4 — LinkSuccessStep         ("Sent Successfully")
 */
import { useFlowStepper } from '../../../hooks/useFlowStepper';
import type { WithdrawFlowData } from './types';
import { useAppStore } from '../../../store';
import WalletPage              from '../../../pages/wallet';
import WithdrawOptionsStep     from './steps/WithdrawOptionsStep';
import OnchainWithdrawalStep   from './steps/OnchainWithdrawalStep';
import ConfirmWithdrawStep     from './steps/ConfirmWithdrawStep';
import WithdrawInitiatedStep   from './steps/WithdrawInitiatedStep';
import SellForFiatStep         from './steps/SellForFiatStep';
import ConfirmSaleStep         from './steps/ConfirmSaleStep';
import SaleInitiatedStep       from './steps/SaleInitiatedStep';
import LinkRecipientStep       from './steps/LinkRecipientStep';
import LinkAmountStep          from './steps/LinkAmountStep';
import ConfirmLinkStep         from './steps/ConfirmLinkStep';
import LinkSuccessStep         from './steps/LinkSuccessStep';

// 5 steps covers both paths (longest path = link: 0→1→2→3→4)
const STEPS = ['withdraw-options', 'step1', 'step2', 'step3', 'step4'] as const;

const INITIAL: WithdrawFlowData = {
  method:    null,
  asset:     'USDC',
  address:   '',
  network:   'Solana',
  amount:    '0',
  recipient: '',
  note:      '',
};

interface WithdrawFlowProps {
  onExit: () => void;
  /** Custom frozen background. Defaults to WalletPage when omitted. */
  background?: React.ReactNode;
}

const NOOP = () => {};

export default function WithdrawFlow({ onExit, background }: WithdrawFlowProps) {
  const { stepIndex, totalSteps, data, next, back, reset } =
    useFlowStepper<WithdrawFlowData>(STEPS, INITIAL, onExit);
  const { withdrawFunds, sendFunds } = useAppStore();

  const stepProps = { data, onNext: next, onBack: back, onExit, stepIndex, totalSteps };

  // ── Step 0: Options bottom sheet over frozen background ───────────────
  if (stepIndex === 0) {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-hide">
            {background ?? <WalletPage />}
          </div>
        </div>
        <WithdrawOptionsStep {...stepProps} onBack={NOOP} />
      </div>
    );
  }

  // ── Steps 1–3: Onchain path ───────────────────────────────────────────
  if (data.method === 'onchain') {
    if (stepIndex === 1) return <OnchainWithdrawalStep {...stepProps} />;
    if (stepIndex === 2) {
      return (
        <ConfirmWithdrawStep
          {...stepProps}
          onNext={() => {
            const result = withdrawFunds({
              asset:       data.asset    ?? 'USDC',
              amount:      parseFloat(data.amount || '0'),
              destination: data.address  ?? 'External Wallet',
              network:     data.network  ?? 'Solana',
            });
            if (result.ok) next({});
          }}
        />
      );
    }
    if (stepIndex === 3) return <WithdrawInitiatedStep {...stepProps} />;
  }

  // ── Steps 1–3: Sell for Fiat path ────────────────────────────────────
  if (data.method === 'fiat') {
    if (stepIndex === 1) return <SellForFiatStep {...stepProps} />;
    if (stepIndex === 2) {
      return (
        <ConfirmSaleStep
          {...stepProps}
          onNext={() => {
            const result = withdrawFunds({
              asset:       data.asset ?? 'USDC',
              amount:      parseFloat(data.amount || '0'),
              destination: 'Bank Transfer',
              note:        'First Bank ••••7823',
            });
            if (result.ok) next({});
          }}
        />
      );
    }
    if (stepIndex === 3) return <SaleInitiatedStep {...stepProps} />;
  }

  // ── Steps 1–4: Send via Link path ─────────────────────────────────────
  if (data.method === 'link') {
    if (stepIndex === 1) {
      return (
        <div className="relative h-full">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide">
              {background ?? <WalletPage />}
            </div>
          </div>
          <LinkRecipientStep {...stepProps} />
        </div>
      );
    }
    if (stepIndex === 2) return <LinkAmountStep    {...stepProps} />;
    if (stepIndex === 3) {
      return (
        <ConfirmLinkStep
          {...stepProps}
          onNext={() => {
            const result = sendFunds({
              asset:     data.asset      ?? 'USDC',
              amount:    parseFloat(data.amount || '0'),
              recipient: data.recipient  ?? '',
              note:      data.note,
            });
            if (result.ok) next({});
          }}
        />
      );
    }
    if (stepIndex === 4) {
      return (
        <LinkSuccessStep
          {...stepProps}
          onSendMore={() => reset()}
        />
      );
    }
  }

  return null;
}
