import { RewardsModel, Reward, UserProfile } from '@/app/model/reward_model';

export interface RewardsState {
  loading: boolean;
  rewards: Reward[];
  claimedRewards: number[];
  userScore: number;
}

export class RewardsController {
  // Load all rewards data
  static async loadRewardsData(profile: UserProfile | null): Promise<{
    success: boolean;
    data?: {
      rewards: Reward[];
      claimedRewards: number[];
      userScore: number;
    };
    error?: string;
  }> {
    try {
      const userScore = profile?.green_score || 0;

    console.log("Getting reward list")
    console.log(RewardsModel)
      const { data: rewardsData, error: rewardsErr } = await RewardsModel.GetRewardList()

    console.log("Finished")
      if (rewardsErr) {
        throw new Error(`Failed to load rewards: ${rewardsErr.message}`);
      }

      const claimedRewards = profile
        ? rewardsData
            .filter(reward => profile.rewards.includes(reward.id))
            .map(reward => reward.id)
        : [];

      return {
        success: true,
        data: {
          rewards: rewardsData || [],
          claimedRewards,
          userScore,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Handle reward redemption
  static async redeemReward(
    reward: Reward,
    profile: UserProfile
  ): Promise<{
    success: boolean;
    newScore?: number;
    updatedRewards?: number[];
    error?: string;
  }> {
    try {
      // Validation
      if (profile.green_score < reward.points_required) {
        return {
          success: false,
          error: `You need at least ${reward.points_required} points to redeem this reward.`,
        };
      }

      if (!profile) {
        return {
          success: false,
          error: 'Profile not found. Please try restarting the app.',
        };
      }

      // Calculate new values
      const newScore = profile.green_score - reward.points_required;
      const updatedRewards = [...profile.rewards, reward.id];

      // Update database
      const { error: userErr } = await RewardsModel.updateUserRewards(
        profile.nric,
        newScore,
        updatedRewards
      );

      if (userErr) {
        throw new Error(`Failed to update user profile: ${userErr.message}`);
      }

      // Optional: Update reward availability
      // const { error: rewardErr } = await RewardsModel.updateRewardAvailability(reward.id, false);
      // if (rewardErr) throw rewardErr;

      return {
        success: true,
        newScore,
        updatedRewards,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Validate if user can redeem reward
  static validateRewardRedemption(
    userScore: number,
    reward: Reward,
    profile: UserProfile | null
  ): { isValid: boolean; error?: string } {
    if (!profile) {
      return { isValid: false, error: 'Profile not found' };
    }

    if (userScore < reward.points_required) {
      return {
        isValid: false,
        error: `You need at least ${reward.points_required} points to redeem this reward.`,
      };
    }

    if (profile.rewards.includes(reward.id)) {
      return {
        isValid: false,
        error: 'You have already claimed this reward.',
      };
    }

    return { isValid: true };
  }
}
