import { ReactNode } from 'react';

interface ActivityRowProps {
  icon: ReactNode;
  iconBg: string;       // e.g. 'bg-[#b3fbff]' or 'bg-[#007bff]'
  title: string;
  subtitle: string;
  amount: string;
  amountColor?: string; // defaults to green for credit
  isLast?: boolean;
}

export default function ActivityRow({
  icon,
  iconBg,
  title,
  subtitle,
  amount,
  amountColor = 'text-[#02d128]',
  isLast = false,
}: ActivityRowProps) {
  return (
    <div className={`flex items-center gap-4 ${!isLast ? 'pb-4 border-b border-[#1a2540]' : ''}`}>
      <div className={`w-10 h-10 rounded-[20px] shrink-0 flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div className="flex flex-1 items-center justify-between min-w-0">
        <div className="flex flex-col gap-0.5">
          <p className="text-white text-sm font-medium leading-[18px]">{title}</p>
          <p className="text-[#8ac7ff] text-xs font-normal leading-4">{subtitle}</p>
        </div>
        <p className={`text-sm font-medium leading-[18px] whitespace-nowrap ml-2 ${amountColor}`}>
          {amount}
        </p>
      </div>
    </div>
  );
}
