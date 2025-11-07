import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import { useUser } from '@/app/context/UserProfileContext'; 

export interface Reward {
  id: number;
  reward_name: string;
  available: boolean;
}


export function useRewards() {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);
  const [userScore, setUserScore] = useState<number>(0);

  const { signIn , profile} = useUser(); // Get the signIn function from context

  // Load user profile and rewards
  const loadData = async () => {
    setLoading(true);
    try {

      setUserScore(profile?.green_score || 0);

      const { data: rewardsData, error: rewardsErr } = await supabase
        .from("rewards")
        .select("*")
        .order("id", { ascending: true });

      if (rewardsErr) throw rewardsErr;

      setRewards(rewardsData || []);

      setClaimedRewards(
      rewardsData.map( x => { 
        return profile?.rewards.includes(x.id) ? x.id : -1
      }))

    } catch (err) {

      setLoading(false);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle reward redemption
  const handleRedeem = async (reward: Reward) => {
    console.log('handling this reward')
    console.log(reward)
    try {

      if (userScore < reward.points_required) {
        Alert.alert(
          "Insufficient Points",
          "You need at least "+reward.points_required  + " points to redeem this reward."
        );
        return;
      }

      const newScore = userScore - reward.points_required;

      //console.log("Made it here")
      if (!profile) {  
        Alert.alert(
          "Profile error! Try Restarting the app"
        );
        return 
      }

      profile.rewards.push(reward.id) // Add the reward id to the array

      //console.log("")
      const { error: userErr } = await supabase
        .from("userprofile")
        .update({ green_score: newScore, rewards: profile.rewards })
        .eq("nric",profile.nric);

      console.log("Set user profile")
      if (userErr) throw userErr;

      /*
      const { error: rewardErr } = await supabase
        .from("rewards")
        .update({ available: false })
        .eq("id", reward.id);
      */
     
      ///if (rewardErr) throw rewardErr;
      setUserScore(newScore);
      setClaimedRewards(profile.rewards)
      //setRewards((prev) =>
      //  prev.map((r) => (r.id === reward.id ? { ...r, available: false } : r))
      //);

      Alert.alert("Success!", `You redeemed ${reward.reward_name}.`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while redeeming.");
    }finally {

    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  return {
    loading,
    rewards,
    claimedRewards,
    userScore,
    handleRedeem,
    refreshData: loadData,
  };
}
