// Admin Sync Service
// Handles migration of local user registrations to Supabase
// Scans ALL localStorage patterns to find existing users

import { supabase, userService, UserProfile } from './supabase';

// Local user structure (unified from multiple sources)
export interface LocalRegisteredUser {
  id: string;              // Handle like @username.senti
  name: string;            // Display name like "OxSenti Senti"
  online: boolean;
  registeredAt: number;    // Timestamp
  clerkUserId?: string;    // If found from user-specific keys
  walletAddress?: string;  // If found from localStorage
  email?: string;          // If found from localStorage
  source: 'registered_users' | 'user_specific_keys' | 'global_keys' | 'contacts';
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
   * Get ALL locally stored users from multiple localStorage sources
   * This is the comprehensive scan that finds users from:
   * 1. senti_registered_users array
   * 2. senti_username_${clerkId} keys (user-specific)
   * 3. senti_contacts array
   * 4. Global senti_username key
   */
  getLocalUsers(): LocalRegisteredUser[] {
    const usersMap = new Map<string, LocalRegisteredUser>();

    // Source 1: senti_registered_users array
    try {
      const usersJson = localStorage.getItem('senti_registered_users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        if (Array.isArray(users)) {
          for (const user of users) {
            if (user.id) {
              const handle = user.id.startsWith('@') ? user.id.toLowerCase() : `@${user.id.toLowerCase()}`;
              usersMap.set(handle, {
                id: handle,
                name: user.name || this.extractDisplayName(handle) + ' Senti',
                online: user.online ?? true,
                registeredAt: user.registeredAt || Date.now(),
                source: 'registered_users'
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to parse senti_registered_users:', err);
    }

    // Source 2: Scan all senti_username_${clerkId} keys
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      // Look for user-specific username keys
      if (key.startsWith('senti_username_') && !key.includes('set')) {
        const clerkUserId = key.replace('senti_username_', '');
        const username = localStorage.getItem(key);

        if (username && clerkUserId && clerkUserId.length > 10) {
          // Get associated handle
          let handle = localStorage.getItem(`senti_user_handle_${clerkUserId}`);
          if (!handle) {
            // Generate handle from username
            handle = `@${username.toLowerCase()}.senti`;
          }
          handle = handle.toLowerCase();

          // Get other associated data
          const walletAddress = localStorage.getItem(`senti_wallet_address_${clerkUserId}`);
          const email = localStorage.getItem('senti_user_email');

          // Only add if not already in map, or update with more data
          if (!usersMap.has(handle)) {
            usersMap.set(handle, {
              id: handle,
              name: username.charAt(0).toUpperCase() + username.slice(1) + ' Senti',
              online: true,
              registeredAt: Date.now(),
              clerkUserId,
              walletAddress: walletAddress || undefined,
              email: email || undefined,
              source: 'user_specific_keys'
            });
          } else {
            // Enhance existing entry with Clerk ID and wallet
            const existing = usersMap.get(handle)!;
            if (!existing.clerkUserId && clerkUserId) {
              existing.clerkUserId = clerkUserId;
            }
            if (!existing.walletAddress && walletAddress) {
              existing.walletAddress = walletAddress;
            }
            if (!existing.email && email) {
              existing.email = email;
            }
          }
        }
      }
    }

    // Source 3: Check global username/handle (current user)
    const globalUsername = localStorage.getItem('senti_username');
    const globalHandle = localStorage.getItem('senti_user_handle');
    const globalClerkId = localStorage.getItem('senti_clerk_user_id');
    const globalWallet = localStorage.getItem('senti_wallet_address');
    const globalEmail = localStorage.getItem('senti_user_email');

    if (globalUsername && globalHandle) {
      const handle = globalHandle.toLowerCase();
      if (!usersMap.has(handle)) {
        usersMap.set(handle, {
          id: handle,
          name: globalUsername + ' Senti',
          online: true,
          registeredAt: Date.now(),
          clerkUserId: globalClerkId || undefined,
          walletAddress: globalWallet || undefined,
          email: globalEmail || undefined,
          source: 'global_keys'
        });
      } else {
        // Enhance with global data
        const existing = usersMap.get(handle)!;
        if (!existing.clerkUserId && globalClerkId) {
          existing.clerkUserId = globalClerkId;
        }
        if (!existing.walletAddress && globalWallet) {
          existing.walletAddress = globalWallet;
        }
        if (!existing.email && globalEmail) {
          existing.email = globalEmail;
        }
      }
    }

    // Source 4: Check contacts (other users the current user has interacted with)
    try {
      const contactsJson = localStorage.getItem('senti_contacts');
      if (contactsJson) {
        const contacts = JSON.parse(contactsJson);
        if (Array.isArray(contacts)) {
          for (const contact of contacts) {
            if (contact.handle || contact.id) {
              const handle = (contact.handle || contact.id).toLowerCase();
              const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`;

              if (!usersMap.has(normalizedHandle)) {
                usersMap.set(normalizedHandle, {
                  id: normalizedHandle,
                  name: contact.name || this.formatDisplayName(normalizedHandle),
                  online: contact.online ?? true,
                  registeredAt: contact.registeredAt || Date.now(),
                  source: 'contacts'
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to parse senti_contacts:', err);
    }

    // Convert map to array and sort by registration date
    return Array.from(usersMap.values()).sort((a, b) => b.registeredAt - a.registeredAt);
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
    return fullName.replace(/ Senti$/i, '');
  },

  /**
   * Format display name from handle (e.g., "@oxsenti.senti" -> "OxSenti Senti")
   */
  formatDisplayName(handle: string): string {
    const username = this.extractUsername(handle);
    return username.charAt(0).toUpperCase() + username.slice(1) + ' Senti';
  },

  /**
   * Check if a user already exists in Supabase by handle or username
   */
  async userExistsInSupabase(handle: string, username?: string): Promise<boolean> {
    // Check by handle
    const normalizedHandle = handle.startsWith('@') ? handle.toLowerCase() : `@${handle.toLowerCase()}`;
    const userByHandle = await userService.getUserByHandle(normalizedHandle);
    if (userByHandle) return true;

    // Check by username
    if (username) {
      const usernameTaken = await userService.isUsernameTaken(username);
      if (usernameTaken) return true;
    }

    return false;
  },

  /**
   * Generate a placeholder Clerk ID for migrated users
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

    // Validate username
    if (!username || username.length < 3) {
      return {
        handle,
        username,
        status: 'skipped',
        message: 'Invalid username (too short)'
      };
    }

    // Skip if username contains invalid characters
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return {
        handle,
        username,
        status: 'skipped',
        message: 'Invalid username format'
      };
    }

    try {
      // Check if already exists in Supabase
      const exists = await this.userExistsInSupabase(handle, username);
      if (exists) {
        return {
          handle,
          username,
          status: 'already_exists',
          message: 'User already exists in Supabase'
        };
      }

      // Use Clerk ID from local data or generate migration ID
      const clerkUserId = localUser.clerkUserId || this.generateMigrationClerkId(handle);
      const walletAddress = localUser.walletAddress || this.generateWalletAddress();
      const email = localUser.email || '';

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
        message: `Migrated from ${localUser.source}`
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

    // Create sets for quick lookup
    const supabaseHandles = new Set(
      supabaseUsers.map(u => u.handle.toLowerCase())
    );
    const supabaseUsernames = new Set(
      supabaseUsers.map(u => u.username.toLowerCase())
    );

    // Count users that exist locally but not in Supabase
    let pendingSync = 0;
    for (const localUser of localUsers) {
      const handle = localUser.id.startsWith('@')
        ? localUser.id.toLowerCase()
        : `@${localUser.id.toLowerCase()}`;
      const username = this.extractUsername(handle);

      if (!supabaseHandles.has(handle) && !supabaseUsernames.has(username)) {
        pendingSync++;
      }
    }

    return {
      localCount: localUsers.length,
      supabaseCount: supabaseUsers.length,
      pendingSync
    };
  },

  /**
   * Debug: Log all localStorage keys related to users
   */
  debugLocalStorage(): void {
    console.log('=== Admin Sync Debug ===');
    const allKeys = Object.keys(localStorage);
    const userKeys = allKeys.filter(k =>
      k.startsWith('senti_username') ||
      k.startsWith('senti_user') ||
      k.startsWith('senti_wallet') ||
      k.startsWith('senti_clerk') ||
      k === 'senti_registered_users' ||
      k === 'senti_contacts'
    );

    console.log('User-related localStorage keys:');
    for (const key of userKeys) {
      const value = localStorage.getItem(key);
      console.log(`  ${key}: ${value?.substring(0, 100)}${(value?.length || 0) > 100 ? '...' : ''}`);
    }

    const users = this.getLocalUsers();
    console.log(`\nTotal local users found: ${users.length}`);
    for (const user of users) {
      console.log(`  - ${user.id} (${user.name}) [source: ${user.source}]`);
    }
    console.log('========================');
  }
};

export default adminSyncService;
