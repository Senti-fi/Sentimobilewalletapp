import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  build: {
    rollupOptions: {
      // The lite SDK has optional lazy imports to chain-specific connector packages.
      // We don't use Cosmos/Solana/EVM external wallets — only embedded Para wallets.
      // Externalizing these prevents Rollup from failing on missing optional deps.
      external: [
        '@getpara/cosmos-wallet-connectors',
        '@getpara/evm-wallet-connectors',
        '@getpara/solana-wallet-connectors',
      ],
    },
  },
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    nodePolyfills({
      // Only include polyfills actually needed by the Para SDK.
      // Exclude crypto-browserify (which pulls in elliptic + bn.js 4.x
      // with known CVE history). The Para SDK uses @noble/curves instead.
      include: ['buffer', 'process', 'util', 'stream', 'events', 'string_decoder', 'path', 'os'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})
