import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export interface Reward {
  id: number;
  reward_name: string;
  available: boolean;
}

export interface UserBadges {
  water: boolean;
  recycle: boolean;
  energy: boolean;
  earth: boolean;
}

export function useRewards() {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userScore, setUserScore] = useState<number>(0);
  const [badges, setBadges] = useState<UserBadges>({
    water: false,
    recycle: false,
    energy: false,
    earth: false,
  });

  // Load user profile and rewards
  const loadData = async () => {
    setLoading(true);
    try {

      const { data: user, error: userErr } = await supabase
        .from("userprofile")
        .select(
          "green_score, badge_water_saver, badge_recycler, badge_energy_efficient, badge_earth_guardian"
        )
        .eq("nric", "S1234567I")
        .single();

      if (userErr) throw userErr;

      setUserScore(user?.green_score || 0);

      // Set badge values
      setBadges({
        water: user?.badge_water_saver || false,
        recycle: user?.badge_recycler || false,
        energy: user?.badge_energy_efficient || false,
        earth: user?.badge_earth_guardian || false,
      });

      const { data: rewardsData, error: rewardsErr } = await supabase
        .from("rewards")
        .select("*")
        .order("id", { ascending: true });

      if (rewardsErr) throw rewardsErr;

      setRewards(rewardsData || []);
    } catch (err) {

      setLoading(false);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle reward redemption
  const handleRedeem = async (reward: Reward) => {
    try {
      if (!reward.available) {
        Alert.alert("Unavailable", "This reward is currently out of stock.");
        return;
      }

      if (userScore < 50) {
        Alert.alert(
          "Insufficient Points",
          "You need at least 50 points to redeem this reward."
        );
        return;
      }

      const newScore = userScore - 50;

      const { error: userErr } = await supabase
        .from("userprofile")
        .update({ green_score: newScore })
        .eq("nric", "S1234567I");

      if (userErr) throw userErr;

      const { error: rewardErr } = await supabase
        .from("rewards")
        .update({ available: false })
        .eq("id", reward.id);

      if (rewardErr) throw rewardErr;

      setUserScore(newScore);
      setRewards((prev) =>
        prev.map((r) => (r.id === reward.id ? { ...r, available: false } : r))
      );

      Alert.alert("Success!", `You redeemed ${reward.reward_name}.`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while redeeming.");
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  return {
    loading,
    rewards,
    userScore,
    badges,
    handleRedeem,
    refreshData: loadData,
  };
}
