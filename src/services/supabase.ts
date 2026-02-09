// Supabase Client Service
// Handles database operations for user profiles and discovery

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Database features will be unavailable.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// User profile interface
export interface UserProfile {
  id: string;
  clerk_user_id: string;
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
   * Check if a user profile exists by Clerk user ID
   */
  async getUserByClerkId(clerkUserId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't exist
          return null;
        }
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Failed to fetch user by Clerk ID:', err);
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
        // No rows returned - username is available
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Failed to check username:', err);
      return false; // Assume available on error to not block user
    }
  },

  /**
   * Create a new user profile
   */
  async createUser(profile: {
    clerkUserId: string;
    username: string;
    handle: string;
    walletAddress: string;
    email?: string;
    imageUrl?: string;
  }): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_user_id: profile.clerkUserId,
          username: profile.username.toLowerCase(),
          handle: profile.handle,
          wallet_address: profile.walletAddress,
          email: profile.email,
          image_url: profile.imageUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Failed to create user:', err);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateUser(
    clerkUserId: string,
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
        .eq('clerk_user_id', clerkUserId)
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
   * Search users by username or handle
   */
  async searchUsers(query: string, limit: number = 10): Promise<UserProfile[]> {
    try {
      const searchTerm = query.toLowerCase().replace('@', '').replace('.senti', '');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,handle.ilike.%${searchTerm}%`)
        .limit(limit);

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
   * Get all users (for directory/discovery)
   */
  async getAllUsers(limit: number = 50): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

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
