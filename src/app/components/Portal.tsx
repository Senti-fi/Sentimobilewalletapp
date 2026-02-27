import { createPortal } from 'react-dom';

/**
 * Portal component that renders children into document.body.
 * This escapes CSS stacking contexts created by overflow-y-auto
 * on parent containers, ensuring modals always appear above all
 * other content including the bottom navigation bar.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body);
}
