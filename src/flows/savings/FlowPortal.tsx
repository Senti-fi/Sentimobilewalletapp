/**
 * FlowPortal
 * ─────────────────────────────────────────────
 * Renders children into #root as an absolute-positioned overlay,
 * covering the BottomTabBar so flow screens appear full-screen.
 *
 * #root has position:relative + overflow:hidden, so absolute inset-0
 * fills exactly the app container (max 430px) without overflowing.
 */
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface FlowPortalProps {
  children: ReactNode;
}

export default function FlowPortal({ children }: FlowPortalProps) {
  const root = document.getElementById('root');
  if (!root) return null;

  return createPortal(
    <div className="absolute inset-0 z-50 bg-[#0a142f] flex flex-col">
      {children}
    </div>,
    root,
  );
}
