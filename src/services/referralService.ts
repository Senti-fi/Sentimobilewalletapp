// Referral Service
// Handles referral code generation, tracking, and rewards

import { supabase } from './supabase';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: string;
  created_at: string;
}

/**
 * Generate a short, unique referral code from the user's handle.
 * Format: SENTI-{first4ofUsername}-{random4}
 */
function generateReferralCode(username: string): string {
  const prefix = username.slice(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SENTI-${prefix}-${random}`;
}

export const referralService = {
  /**
   * Get or create a referral code for the current user.
   * Stores the code on the user's profile in Supabase.
   */
  async getOrCreateReferralCode(authUserId: string, username: string): Promise<string | null> {
    try {
      // Check if user already has a referral code
      const { data: user } = await supabase
        .from('users')
        .select('referral_code')
        .eq('auth_user_id', authUserId)
        .single();

      if (user?.referral_code) {
        return user.referral_code;
      }

      // Generate a new one
      const code = generateReferralCode(username);

      const { error } = await supabase
        .from('users')
        .update({ referral_code: code })
        .eq('auth_user_id', authUserId);

      if (error) {
        console.error('Error saving referral code:', error);
        return null;
      }

      return code;
    } catch (err) {
      console.error('Failed to get/create referral code:', err);
      return null;
    }
  },

  /**
   * Apply a referral code during sign-up.
   * Links the new user to the referrer.
   */
  async applyReferralCode(referralCode: string, newUserAuthId: string): Promise<boolean> {
    try {
      // Find the referrer by code
      const { data: referrer } = await supabase
        .from('users')
        .select('auth_user_id')
        .eq('referral_code', referralCode.toUpperCase())
        .single();

      if (!referrer) {
        return false; // Invalid code
      }

      // Don't allow self-referral
      if (referrer.auth_user_id === newUserAuthId) {
        return false;
      }

      // Check if this user was already referred
      const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', newUserAuthId)
        .single();

      if (existing) {
        return false; // Already referred
      }

      // Create the referral record
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.auth_user_id,
          referred_id: newUserAuthId,
          referral_code: referralCode.toUpperCase(),
          status: 'completed',
        });

      if (error) {
        console.error('Error creating referral:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to apply referral code:', err);
      return false;
    }
  },

  /**
   * Get all referrals made by a user (people they invited).
   */
  async getReferralsByUser(authUserId: string): Promise<Referral[]> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', authUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referrals:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
      return [];
    }
  },

  /**
   * Get the count of successful referrals for a user.
   */
  async getReferralCount(authUserId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', authUserId);

      if (error) {
        console.error('Error counting referrals:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('Failed to count referrals:', err);
      return 0;
    }
  },
};
