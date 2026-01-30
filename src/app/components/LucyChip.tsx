import { motion } from 'motion/react';
import { Bot } from 'lucide-react';

interface LucyChipProps {
  text: string;
  onClick?: () => void;
  onOpenLucy?: () => void;
}

export default function LucyChip({ text, onClick, onOpenLucy }: LucyChipProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onOpenLucy) {
      onOpenLucy();
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 hover:from-cyan-100 hover:to-blue-100 transition-all shadow-sm"
    >
      <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-md flex items-center justify-center flex-shrink-0">
        <Bot className="w-3 h-3 text-white" strokeWidth={2.5} />
      </div>
      <span>{text}</span>
    </motion.button>
  );
}