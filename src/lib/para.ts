// Para client configuration
// Used by ParaProvider in main.tsx and directly where needed

import { Environment } from '@getpara/react-sdk-lite';

export const PARA_API_KEY = import.meta.env.VITE_PARA_API_KEY || '';

const rawEnv = (import.meta.env.VITE_PARA_ENV || '').toUpperCase().trim();

const ENV_MAP: Record<string, Environment> = {
  PROD: Environment.PROD,
  PRODUCTION: Environment.PROD,
  BETA: Environment.BETA,
  DEV: Environment.DEV,
  SANDBOX: Environment.SANDBOX,
};

export const PARA_ENV: Environment = ENV_MAP[rawEnv] || Environment.PROD;

if (!PARA_API_KEY) {
  console.warn('Missing VITE_PARA_API_KEY environment variable. Auth features will be unavailable.');
}

if (!rawEnv) {
  console.info('VITE_PARA_ENV not set. Defaulting Para environment to PROD.');
}
