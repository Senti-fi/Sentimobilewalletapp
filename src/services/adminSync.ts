// Admin Sync Service
// Handles migration of local user registrations to Supabase

import { supabase, userService, UserProfile } from './supabase';

// Local user structure from senti_registered_users
export interface LocalRegisteredUser {
  id: string;           // Handle like @username.senti
  name: string;         // Display name like "OxSenti Senti"
  online: boolean;
  registeredAt: number; // Timestamp
}

// Sync result for individual user
export interface UserSyncResult {
  handle: string;
  username: string;
  status: 'synced' | 'already_exists' | 'failed' | 'skipped';
  message: string;
}

// Overall sync result
export interface SyncResult {
  total: number;
  synced: number;
  alreadyExists: number;
  failed: number;
  skipped: number;
  details: UserSyncResult[];
}

export const adminSyncService = {
  /**
   * Get all locally registered users from localStorage
   */
  getLocalUsers(): LocalRegisteredUser[] {
    try {
      const usersJson = localStorage.getItem('senti_registered_users');
      if (!usersJson) return [];

      const users = JSON.parse(usersJson);
      return Array.isArray(users) ? users : [];
    } catch (err) {
      console.error('Failed to parse local users:', err);
      return [];
    }
  },

  /**
   * Get all users currently in Supabase
   */
  async getSupabaseUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching Supabase users:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to fetch Supabase users:', err);
      return [];
    }
  },

  /**
   * Extract username from handle (e.g., "@oxsenti.senti" -> "oxsenti")
   */
  extractUsername(handle: string): string {
    return handle.replace('@', '').replace('.senti', '').toLowerCase();
  },

  /**
   * Extract display name from full name (e.g., "OxSenti Senti" -> "OxSenti")
   */
  extractDisplayName(fullName: string): string {
    // Remove " Senti" suffix if present
    return fullName.replace(/ Senti$/i, '');
  },

  /**
   * Check if a user already exists in Supabase by handle
   */
  async userExistsInSupabase(handle: string): Promise<boolean> {
    const normalizedHandle = handle.startsWith('@') ? handle.toLowerCase() : `@${handle.toLowerCase()}`;
    const user = await userService.getUserByHandle(normalizedHandle);
    return user !== null;
  },

  /**
   * Generate a placeholder Clerk ID for migrated users
   * These users will need to "claim" their account by logging in
   */
  generateMigrationClerkId(handle: string): string {
    return `migrated_${handle.replace('@', '').replace('.', '_')}_${Date.now()}`;
  },

  /**
   * Generate a wallet address if not available
   */
  generateWalletAddress(): string {
    const hexChars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += hexChars[Math.floor(Math.random() * 16)];
    }
    return address;
  },

  /**
   * Sync a single local user to Supabase
   */
  async syncUser(localUser: LocalRegisteredUser): Promise<UserSyncResult> {
    const handle = localUser.id.startsWith('@') ? localUser.id.toLowerCase() : `@${localUser.id.toLowerCase()}`;
    const username = this.extractUsername(handle);
    const displayName = this.extractDisplayName(localUser.name);

    // Validate username
    if (!username || username.length < 3) {
      return {
        handle,
        username,
        status: 'skipped',
        message: 'Invalid username (too short)'
      };
    }

    try {
      // Check if already exists in Supabase
      const exists = await this.userExistsInSupabase(handle);
      if (exists) {
        return {
          handle,
          username,
          status: 'already_exists',
          message: 'User already exists in Supabase'
        };
      }

      // Check if username is taken (might have different handle format)
      const usernameTaken = await userService.isUsernameTaken(username);
      if (usernameTaken) {
        return {
          handle,
          username,
          status: 'already_exists',
          message: 'Username already taken in Supabase'
        };
      }

      // Try to find associated Clerk ID and wallet from localStorage
      // This is a best-effort attempt to link existing data
      let clerkUserId = this.generateMigrationClerkId(handle);
      let walletAddress = this.generateWalletAddress();
      let email = '';

      // Try to find user-specific data in localStorage
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key.startsWith('senti_username_') && !key.includes('set')) {
          const storedUsername = localStorage.getItem(key);
          if (storedUsername?.toLowerCase() === displayName.toLowerCase() ||
              storedUsername?.toLowerCase() === username) {
            const potentialClerkId = key.replace('senti_username_', '');
            if (potentialClerkId && !potentialClerkId.startsWith('migrated_')) {
              clerkUserId = potentialClerkId;

              // Get associated wallet
              const storedWallet = localStorage.getItem(`senti_wallet_address_${potentialClerkId}`);
              if (storedWallet) walletAddress = storedWallet;

              break;
            }
          }
        }
      }

      // Create user in Supabase
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          username: username,
          handle: handle,
          wallet_address: walletAddress,
          email: email,
          created_at: new Date(localUser.registeredAt || Date.now()).toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing user:', error);
        return {
          handle,
          username,
          status: 'failed',
          message: error.message || 'Database error'
        };
      }

      return {
        handle,
        username,
        status: 'synced',
        message: 'Successfully migrated to Supabase'
      };
    } catch (err) {
      console.error('Sync error for user:', handle, err);
      return {
        handle,
        username,
        status: 'failed',
        message: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  },

  /**
   * Sync all local users to Supabase
   */
  async syncAllUsers(onProgress?: (current: number, total: number) => void): Promise<SyncResult> {
    const localUsers = this.getLocalUsers();
    const results: UserSyncResult[] = [];

    let synced = 0;
    let alreadyExists = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < localUsers.length; i++) {
      const user = localUsers[i];
      const result = await this.syncUser(user);
      results.push(result);

      switch (result.status) {
        case 'synced':
          synced++;
          break;
        case 'already_exists':
          alreadyExists++;
          break;
        case 'failed':
          failed++;
          break;
        case 'skipped':
          skipped++;
          break;
      }

      // Report progress
      if (onProgress) {
        onProgress(i + 1, localUsers.length);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      total: localUsers.length,
      synced,
      alreadyExists,
      failed,
      skipped,
      details: results
    };
  },

  /**
   * Get sync status summary
   */
  async getSyncStatus(): Promise<{
    localCount: number;
    supabaseCount: number;
    pendingSync: number;
  }> {
    const localUsers = this.getLocalUsers();
    const supabaseUsers = await this.getSupabaseUsers();

    // Create a set of handles in Supabase for quick lookup
    const supabaseHandles = new Set(
      supabaseUsers.map(u => u.handle.toLowerCase())
    );

    // Count users that exist locally but not in Supabase
    let pendingSync = 0;
    for (const localUser of localUsers) {
      const handle = localUser.id.startsWith('@')
        ? localUser.id.toLowerCase()
        : `@${localUser.id.toLowerCase()}`;

      if (!supabaseHandles.has(handle)) {
        pendingSync++;
      }
    }

    return {
      localCount: localUsers.length,
      supabaseCount: supabaseUsers.length,
      pendingSync
    };
  }
};

export default adminSyncService;
