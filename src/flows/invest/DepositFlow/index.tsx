/**
 * DepositFlow
 *
 * Step 0 — DepositAmountStep: bottom sheet portalled over the vault page.
 * Step 1 — DepositConfirmStep: full-screen portalled confirm page.
 * Step 2 — DepositSuccessStep: full-screen portalled success page.
 *
 * Portalling to #root means the overlay covers everything (including the
 * bottom nav), matching the Figma design exactly.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFlowStepper } from '../../../hooks/useFlowStepper';
import type { DepositFlowData, VaultConfig } from './types';
import { useAppStore } from '../../../store';
import { track } from '../../../lib/analytics';
import DepositAmountStep  from './steps/DepositAmountStep';
import DepositConfirmStep from './steps/DepositConfirmStep';
import DepositSuccessStep from './steps/DepositSuccessStep';

const STEPS = ['amount', 'confirm', 'success'] as const;
const INITIAL: DepositFlowData = { amount: '0' };

interface DepositFlowProps {
  vault: VaultConfig;
  onExit: () => void;
}

export default function DepositFlow({ vault, onExit }: DepositFlowProps) {
  const { stepIndex, data, next, back, reset } =
    useFlowStepper<DepositFlowData>(STEPS, INITIAL, onExit);
  const { investFunds } = useAppStore();

  useEffect(() => { track('invest_flow_started', { vault: vault.name, asset: vault.asset }); }, []);

  const stepProps = {
    data,
    onNext: next,
    onBack: back,
    onExit,
    vault,
    stepIndex,
    totalSteps: STEPS.length,
  };

  const root = document.getElementById('root');
  if (!root) return null;

  // ── Step 0: bottom sheet portal over frozen vault page ─────────────
  if (stepIndex === 0) {
    return createPortal(
      <div className="absolute inset-0 z-50">
        {/* Dark blur overlay — tapping dismisses the sheet */}
        <div
          className="absolute inset-0 bg-[rgba(10,20,47,0.6)]"
          style={{ backdropFilter: 'blur(2px)' }}
          onClick={onExit}
        />
        <DepositAmountStep {...stepProps} />
      </div>,
      root,
    );
  }

  // ── Steps 1-2: full-screen portal ──────────────────────────────────
  return createPortal(
    <div className="absolute inset-0 z-50 flex flex-col">
      {stepIndex === 1 && (
        <DepositConfirmStep
          {...stepProps}
          onNext={() => {
            const result = investFunds({
              vaultName:  vault.name,
              asset:      vault.asset,
              amount:     parseFloat(data.amount || '0'),
              apy:        vault.apy,
              minDeposit: vault.minDeposit,
            });
            if (result.ok) {
              track('invest_completed', { vault: vault.name, asset: vault.asset, amount: data.amount, apy: vault.apy });
              next({});
            }
          }}
        />
      )}
      {stepIndex === 2 && (
        <DepositSuccessStep
          {...stepProps}
          onDepositMore={() => reset()}
        />
      )}
    </div>,
    root,
  );
}
