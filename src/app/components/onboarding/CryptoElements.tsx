import { motion } from 'motion/react';

// Simple crypto logo icons
export function BitcoinLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="#F7931A" />
      <path
        d="M27 16.5c.4-2.6-1.6-4-4.3-4.9l.9-3.5-2.1-.5-.9 3.4c-.6-.1-1.1-.3-1.7-.4l.9-3.5-2.1-.5-.9 3.5c-.5-.1-1-.2-1.4-.3l-2.9-.7-.6 2.3s1.6.4 1.5.4c.9.2 1 .8 1 1.3l-1 4.1c.1 0 .1.1.2.1h-.2l-1.4 5.7c-.1.3-.4.7-1 .5 0 0-1.5-.4-1.5-.4l-1 2.5 2.7.7c.5.1 1 .3 1.5.4l-.9 3.6 2.1.5.9-3.5c.6.2 1.2.3 1.8.5l-.9 3.5 2.1.5.9-3.6c3.6.7 6.3.4 7.4-2.8.9-2.6-.1-4.1-1.9-5.1 1.4-.3 2.4-1.2 2.7-3zm-4.8 6.8c-.6 2.5-5 1.1-6.4.8l1.1-4.6c1.4.4 6 1.1 5.3 3.8zm.7-6.9c-.6 2.3-4.2.9-5.4.7l1-4.2c1.2.3 5 .9 4.4 3.5z"
        fill="white"
      />
    </svg>
  );
}

export function EthereumLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="#627EEA" />
      <path d="M20 8L19.5 9.7V24.3L20 24.8L27 20.5L20 8Z" fill="#C1CCF7" />
      <path d="M20 8L13 20.5L20 24.8V8Z" fill="white" />
      <path d="M20 26.3L19.7 26.7V31.5L20 32.5L27 21.9L20 26.3Z" fill="#C1CCF7" />
      <path d="M20 32.5V26.3L13 21.9L20 32.5Z" fill="white" />
      <path d="M20 24.8L27 20.5L20 16.8V24.8Z" fill="#8197EE" />
      <path d="M13 20.5L20 24.8V16.8L13 20.5Z" fill="#C1CCF7" />
    </svg>
  );
}

export function USDTLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill="#26A17B" />
      <path
        d="M22.5 18.8v-.1c-.1 0-1.3-.1-2.5-.1s-2.4.1-2.5.1v.1c-2.3.1-4 .4-4 .8 0 .4 1.7.7 4 .8V23c-1.2 0-2.2-.1-2.8-.2v1.5c.7.1 1.7.2 2.8.2 1.2 0 2.2-.1 2.8-.2v-1.5c-.6.1-1.6.2-2.8.2v-2.5c2.3-.1 4-.4 4-.8 0-.4-1.7-.7-4-.8zm0-2.3v-2.7h3.8v-2.6H13.7v2.6h3.8v2.7c-3.2.1-5.6.6-5.6 1.3 0 .7 2.4 1.2 5.6 1.3v6.1c0 .1.9.2 2 .2s2-.1 2-.2v-6.1c3.2-.1 5.6-.6 5.6-1.3 0-.7-2.4-1.2-5.6-1.3z"
        fill="white"
      />
    </svg>
  );
}

// Falling coins
export function Coin({ className = '' }: { className?: string }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="15" cy="15" r="15" fill="#FFD700" />
      <circle cx="15" cy="15" r="12" fill="#FFA500" />
      <text
        x="15"
        y="20"
        fontSize="16"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        $
      </text>
    </svg>
  );
}

// Tangled wire/cable component
interface WireProps {
  path: string;
  label?: string;
  className?: string;
}

export function TangledWire({ path, label, className = '' }: WireProps) {
  return (
    <g className={className}>
      <motion.path
        d={path}
        stroke="#9CA3AF"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      {label && (
        <motion.text
          x="50%"
          y="50%"
          fontSize="10"
          fill="#6B7280"
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {label}
        </motion.text>
      )}
    </g>
  );
}
