/**
 * PageHeader
 * ─────────────────────────────────────────────
 * Reusable header used across all pages and flow screens.
 *
 *   ← title (centered)   [spacer]
 *
 * Back button: calls onBack prop if provided, otherwise router.navigate(-1).
 */
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function PageHeader({ title, onBack }: PageHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <div className="flex items-center px-6 pt-14 pb-3 shrink-0">
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-6 h-6 text-white"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6" strokeWidth={2} />
      </button>
      <p className="flex-1 text-center text-white font-semibold text-[16px] leading-[20px]">
        {title}
      </p>
      <div className="w-6" />
    </div>
  );
}
