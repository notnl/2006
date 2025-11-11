import { supabase } from '@/lib/supabase';

export interface Reward {
  id: number;
  reward_name: string;
  available: boolean;
  points_required: number;
}

export interface UserProfile {
  nric: string;
  green_score: number;
  rewards: number[];
}

export class RewardsModel {
  // Get all rewards from database
  static async GetRewardList() {
    return await supabase
      .from('rewards')
      .select('*')
      .order('id', { ascending: true });
  }

  // Update user's green score and rewards
  static async updateUserRewards(
    nric: string, 
    newScore: number, 
    rewards: number[]
  ): Promise<{ error: any }> {
    return await supabase
      .from('userprofile')
      .update({ 
        green_score: newScore, 
        rewards: rewards 
      })
      .eq('nric', nric);
  }

  // Update reward availability
  static async updateRewardAvailability(
    rewardId: number, 
    available: boolean
  ): Promise<{ error: any }> {
    return await supabase
      .from('rewards')
      .update({ available: available })
      .eq('id', rewardId);
  }
}
