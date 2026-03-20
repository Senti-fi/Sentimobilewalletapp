/**
 * SendFlow
 *
 * Step 0 — SendOptionsStep: bottom sheet over frozen WalletPage
 * Step 1 — EnterRecipientStep
 * Step 2 — EnterAmountStep
 * Step 3 — ConfirmSendStep
 * Step 4 — TransferSuccessfulStep ("Send More" resets to step 0)
 */
import { useEffect } from 'react';
import { useFlowStepper } from '../../../hooks/useFlowStepper';
import type { SendFlowData } from './types';
import { useAppStore } from '../../../store';
import { track } from '../../../lib/analytics';
import { recordTransfer } from '../../../lib/sync';
import WalletPage from '../../../pages/wallet';
import SendOptionsStep        from './steps/SendOptionsStep';
import EnterRecipientStep     from './steps/EnterRecipientStep';
import EnterAmountStep        from './steps/EnterAmountStep';
import ConfirmSendStep        from './steps/ConfirmSendStep';
import TransferSuccessfulStep from './steps/TransferSuccessfulStep';

const STEPS = ['send-options', 'recipient', 'amount', 'confirm', 'success'] as const;

const INITIAL: SendFlowData = {
  method:    null,
  recipient: '',
  asset:     'USDC',
  amount:    '0',
};

interface SendFlowProps {
  onExit: () => void;
  /** Custom frozen background. Defaults to WalletPage when omitted. */
  background?: React.ReactNode;
}

const NOOP = () => {};

export default function SendFlow({ onExit, background }: SendFlowProps) {
  const { stepIndex, totalSteps, data, next, back, reset } =
    useFlowStepper<SendFlowData>(STEPS, INITIAL, onExit);
  const { sendFunds }  = useAppStore();
  const selfId         = useAppStore(s => s.userProfile?.id) ?? '';

  useEffect(() => { track('send_flow_started'); }, []);

  const stepProps = { data, onNext: next, onBack: back, onExit, stepIndex, totalSteps };

  // Step 0: Send Options bottom sheet over frozen background
  if (stepIndex === 0) {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-hide">
            {background ?? <WalletPage />}
          </div>
        </div>
        <SendOptionsStep {...stepProps} onBack={NOOP} />
      </div>
    );
  }

  // Step 1: Enter Recipient
  if (stepIndex === 1) {
    return <EnterRecipientStep {...stepProps} />;
  }

  // Step 2: Enter Amount
  if (stepIndex === 2) {
    return <EnterAmountStep {...stepProps} />;
  }

  // Step 3: Confirm Send — write transaction to store before advancing
  if (stepIndex === 3) {
    return (
      <ConfirmSendStep
        {...stepProps}
        onNext={() => {
          const result = sendFunds({
            asset:     data.asset     ?? 'USDC',
            amount:    parseFloat(data.amount || '0'),
            recipient: data.recipient ?? '',
            note:      data.note,
          });
          if (result.ok) {
            // Write transfer record so recipient receives the funds on their next load
            if (data.method === 'link') {
              void recordTransfer({
                senderAuthId:      selfId,
                recipientUsername: (data.recipient ?? '').replace(/^@/, ''),
                asset:             data.asset    ?? 'USDC',
                amount:            parseFloat(data.amount || '0'),
                note:              data.note,
              });
            }
            track('send_completed', { asset: data.asset, amount: data.amount, recipient: data.recipient });
            next({});
          }
        }}
      />
    );
  }

  // Step 4: Transfer Successful — "Send More" resets flow
  if (stepIndex === 4) {
    return (
      <TransferSuccessfulStep
        {...stepProps}
        onNext={() => reset()}
      />
    );
  }

  return null;
}
