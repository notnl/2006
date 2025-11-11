import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ImageBackground, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Loading from '@/views/ui/LoadingComponent';
import { useUser } from '@/app/context/UserProfileContext';
import { RewardsController } from '@/app/controller/rewards_controller';
import { RewardsModel, Reward } from '@/app/model/reward_model';

export default function RewardsView() {
  const router = useRouter();
  const { profile, refreshProfile } = useUser();
  
  // State that was previously in useRewards()
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);
  const [userScore, setUserScore] = useState<number>(0);

  // Load rewards data on component mount
  useEffect(() => {
    loadRewardsData();
  },[] );

  const loadRewardsData = async () => {
    setLoading(true);
    try {
      const result = await RewardsController.loadRewardsData(profile);
      
      if (result.success && result.data) {
        setRewards(result.data.rewards);
       setClaimedRewards(result.data.claimedRewards);
        setUserScore(result.data.userScore);
      } else {
        console.error('Error', result.error || 'Failed to load rewards')
        Alert.alert('Error', result.error || 'Failed to load rewards');
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      Alert.alert('Error', 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleRewardRedemption = async (reward: Reward) => {
    if (!profile) {
      Alert.alert('Error', 'User profile not found. Please try again.');
      return;
    }

    // Use controller for validation
    const validation = RewardsController.validateRewardRedemption(userScore, reward, profile);
    if (!validation.isValid) {
      Alert.alert('Cannot Redeem', validation.error || 'Unable to redeem this reward.');
      return;
    }

    // Use controller for redemption
    const result = await RewardsController.redeemReward(reward, profile);
    
    if (result.success && result.newScore !== undefined && result.updatedRewards) {
      // Update local state
      setUserScore(result.newScore);
      setClaimedRewards(result.updatedRewards);
      
      // Refresh profile in context to sync across app
      await refreshProfile();
      
      Alert.alert('Success!', `You redeemed ${reward.reward_name}.`);
    } else {
      Alert.alert('Error', result.error || 'Failed to redeem reward');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ImageBackground
      source={require('@/assets/images/bg-city.png')}
      resizeMode="cover"
      style={styles.backgroundImage}>
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.greenScoreText}>YOUR GREEN SCORE: {userScore} PTS</Text>
        <Text style={styles.rewardsHeader}>REWARDS</Text>
      </View>

      {/* Rewards List */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {rewards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>NO REWARDS AVAILABLE</Text>
          </View>
        ) : (
          rewards.map((reward, index) => (
            <RewardCard 
              key={reward.id || index}
              reward={reward}
              userScore={userScore}
              isClaimed={claimedRewards.includes(reward.id)}
              onRedeem={handleRewardRedemption}
            />
          ))
        )}
      </ScrollView>

      {/* Back Button */}
      <View style={styles.footerSection}>
        <LinearGradient
          colors={['#ff66cc', '#ff9933']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backGradient}>
          <Pressable 
            onPress={() => router.push('/menu')} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>BACK TO HOME</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </ImageBackground>
  );
}

// Separate component for reward card for better organization
const RewardCard = ({ reward, userScore, isClaimed, onRedeem }: any) => {
  const canRedeem = userScore >= reward.points_required && !isClaimed;
  const pointsNeeded = reward.points_required - userScore;

  return (
    <View style={styles.rewardCard}>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardName}>{reward.reward_name}</Text>
        <Text style={styles.pointsRequired}>{reward.points_required} POINTS</Text>
      </View>

      {isClaimed ? (
        <Pressable style={styles.redeemedButton} disabled>
          <Text style={styles.redeemedButtonText}>REDEEMED</Text>
        </Pressable>
      ) : (
        <View style={styles.redeemContainer}>
          <LinearGradient
            colors={canRedeem ? ['#ff66cc', '#ff9933'] : ['#cccccc', '#999999']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.redeemGradient}>
            <Pressable
              style={styles.redeemButton}
              onPress={() => onRedeem(reward)}
              disabled={!canRedeem}>
              <Text style={styles.redeemButtonText}>
                {canRedeem ? 'REDEEM NOW' : 'NEED MORE POINTS'}
              </Text>
            </Pressable>
          </LinearGradient>
          {!canRedeem && pointsNeeded > 0 && (
            <Text style={styles.pointsWarning}>
              NEED {pointsNeeded} MORE POINTS
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  greenScoreText: {
    fontFamily: 'PressStart2P',
    color: 'white',
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  rewardsHeader: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#FF69B4',
    textShadowColor: '#800080',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  scrollContainer: {
    backgroundColor: 'rgba(180, 220, 255, 0.8)',
    borderRadius: 16,
    width: '90%',
    maxHeight: '65%',
    marginVertical: 20,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#666',
  },
  rewardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 6,
    width: '90%',
    borderColor: '#ff66cc',
    borderWidth: 2,
    shadowColor: '#cc33ff',
    shadowOpacity: 0.8,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  rewardInfo: {
    flex: 1,
    marginRight: 10,
  },
  rewardName: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#1A0033',
    marginBottom: 4,
  },
  pointsRequired: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#666',
  },
  redeemContainer: {
    alignItems: 'center',
  },
  redeemGradient: {
    borderRadius: 4,
    padding: 2,
  },
  redeemButton: {
    backgroundColor: '#ffcc66',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    minWidth: 80,
  },
  redeemButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#3B0A00',
    textAlign: 'center',
  },
  pointsWarning: {
    fontFamily: 'PressStart2P',
    fontSize: 5,
    color: '#ff3333',
    marginTop: 4,
    textAlign: 'center',
  },
  redeemedButton: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#2E7D32',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    minWidth: 80,
  },
  redeemedButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: 'white',
    textAlign: 'center',
  },
  footerSection: {
    marginBottom: 20,
  },
  backGradient: {
    borderRadius: 6,
    padding: 2,
    shadowColor: '#cc33ff',
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 3, height: 3 },
    elevation: 6,
  },
  backButton: {
    backgroundColor: '#FFA726',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  backButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#3B0A00',
    textAlign: 'center',
  },
});
