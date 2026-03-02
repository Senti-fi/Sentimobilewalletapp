// Referral Service
// Handles referral code generation, tracking, and rewards

import { supabase } from './supabase';

const POINTS_PER_REFERRAL = 50;
const MAX_CODE_RETRIES = 3;

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
 * Format: SENTI-{first4ofUsername}-{random6}
 */
function generateReferralCode(username: string): string {
  const prefix = username.slice(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SENTI-${prefix}-${random}`;
}

export const referralService = {
  /**
   * Get or create a referral code for the current user.
   * Stores the code on the user's profile in Supabase.
   * Retries on collision with the UNIQUE constraint.
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

      // Generate a new one with retry on collision
      for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt++) {
        const code = generateReferralCode(username);

        const { error } = await supabase
          .from('users')
          .update({ referral_code: code })
          .eq('auth_user_id', authUserId);

        if (!error) {
          return code;
        }

        // If it's a unique constraint violation, retry with a new code
        if (error.code === '23505') {
          console.warn(`Referral code collision (attempt ${attempt + 1}), retrying...`);
          continue;
        }

        console.error('Error saving referral code:', error);
        return null;
      }

      console.error('Failed to generate unique referral code after retries');
      return null;
    } catch (err) {
      console.error('Failed to get/create referral code:', err);
      return null;
    }
  },

  /**
   * Apply a referral code during sign-up.
   * Links the new user to the referrer and awards points to both parties.
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
      const { data: referral, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.auth_user_id,
          referred_id: newUserAuthId,
          referral_code: referralCode.toUpperCase(),
          status: 'completed',
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating referral:', error);
        return false;
      }

      // Award points to both referrer and referred user
      await Promise.allSettled([
        supabase.from('referral_points').insert({
          auth_user_id: referrer.auth_user_id,
          referral_id: referral.id,
          points: POINTS_PER_REFERRAL,
          reason: 'referral_bonus',
        }),
        supabase.from('referral_points').insert({
          auth_user_id: newUserAuthId,
          referral_id: referral.id,
          points: POINTS_PER_REFERRAL,
          reason: 'referred_signup_bonus',
        }),
      ]);

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

  /**
   * Get total points earned by a user from referrals.
   */
  async getUserPoints(authUserId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('referral_points')
        .select('points')
        .eq('auth_user_id', authUserId);

      if (error) {
        console.error('Error fetching user points:', error);
        return 0;
      }

      return (data || []).reduce((sum, row) => sum + row.points, 0);
    } catch (err) {
      console.error('Failed to fetch user points:', err);
      return 0;
    }
  },
};
