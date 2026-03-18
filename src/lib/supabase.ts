import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client — null when env vars are missing (local dev without keys).
 * All sync functions guard against null so the app works without Supabase.
 */
export const supabase = url && key ? createClient(url, key) : null;
