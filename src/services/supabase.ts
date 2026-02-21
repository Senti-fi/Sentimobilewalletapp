// Supabase Client Service
// Handles database operations for user profiles and discovery
// Auth is handled by Para SDK — Supabase is used for database only

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[Senti] Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'User discovery, messaging, and profiles will not work until configured.\n' +
    'See .env.example for the required variables.'
  );
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// User profile interface
export interface UserProfile {
  id: string;
  auth_user_id: string;
  username: string;
  handle: string;
  wallet_address: string;
  email?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// User profile service
export const userService = {
  /**
   * Check if a user profile exists by auth user ID (Supabase Auth UUID)
   */
  async getUserByAuthId(authUserId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Failed to fetch user by auth ID:', err);
      return null;
    }
  },

  /**
   * Check if a username is already taken
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();

      if (error && error.code === 'PGRST116') {
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Failed to check username:', err);
      return false;
    }
  },

  /**
   * Create a new user profile.
   * Uses upsert on auth_user_id to safely handle re-creation attempts.
   * Throws on username conflict so the caller can show a proper error.
   */
  async createUser(profile: {
    authUserId: string;
    username: string;
    handle: string;
    walletAddress: string;
    email?: string;
    imageUrl?: string;
  }): Promise<UserProfile | null> {
    try {
      const isTaken = await this.isUsernameTaken(profile.username);
      if (isTaken) {
        const existing = await this.getUserByAuthId(profile.authUserId);
        if (existing && existing.username === profile.username.toLowerCase()) {
          return existing;
        }
        throw new Error('USERNAME_TAKEN');
      }

      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            auth_user_id: profile.authUserId,
            username: profile.username.toLowerCase(),
            handle: profile.handle,
            wallet_address: profile.walletAddress,
            email: profile.email,
            image_url: profile.imageUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'auth_user_id' }
        )
        .select()
        .single();

      if (error) {
        if (error.code === '23505' && error.message?.includes('username')) {
          throw new Error('USERNAME_TAKEN');
        }
        console.error('Error creating user:', error);
        return null;
      }

      return data;
    } catch (err: any) {
      if (err?.message === 'USERNAME_TAKEN') throw err;
      console.error('Failed to create user:', err);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateUser(
    authUserId: string,
    updates: Partial<{
      username: string;
      handle: string;
      wallet_address: string;
      email: string;
      image_url: string;
    }>
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_user_id', authUserId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Failed to update user:', err);
      return null;
    }
  },

  /**
   * Search users by username or handle, excluding the current user
   */
  async searchUsers(query: string, currentAuthId?: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      const searchTerm = query.toLowerCase().replace('@', '').replace('.senti', '');

      let q = supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,handle.ilike.%${searchTerm}%`);

      if (currentAuthId) {
        q = q.neq('auth_user_id', currentAuthId);
      }

      const { data, error } = await q.limit(limit);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to search users:', err);
      return [];
    }
  },

  /**
   * Get user by handle (e.g., @john.senti)
   */
  async getUserByHandle(handle: string): Promise<UserProfile | null> {
    try {
      const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('handle', normalizedHandle.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching user by handle:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Failed to fetch user by handle:', err);
      return null;
    }
  },

  /**
   * Get all users (for directory/discovery), excluding the current user
   */
  async getAllUsers(currentAuthId?: string, limit: number = 50): Promise<UserProfile[]> {
    try {
      let q = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentAuthId) {
        q = q.neq('auth_user_id', currentAuthId);
      }

      const { data, error } = await q.limit(limit);

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to fetch users:', err);
      return [];
    }
  },
};

export default supabase;
