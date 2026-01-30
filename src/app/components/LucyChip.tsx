import { motion } from 'motion/react';

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
      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 hover:from-orange-100 hover:to-rose-100 transition-all shadow-sm"
    >
      <div className="w-5 h-5 bg-gradient-to-br from-orange-400 via-rose-500 to-pink-500 rounded-md flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-bold text-white">L</span>
      </div>
      <span>{text}</span>
    </motion.button>
  );
}