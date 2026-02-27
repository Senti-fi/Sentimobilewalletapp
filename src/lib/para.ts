// Para client configuration
// Used by ParaProvider in main.tsx and directly where needed

export const PARA_API_KEY = import.meta.env.VITE_PARA_API_KEY || '';

if (!PARA_API_KEY) {
  console.warn('Missing VITE_PARA_API_KEY environment variable. Auth features will be unavailable.');
}
