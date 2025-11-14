import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/views/ui/text';
import { useState, useEffect } from 'react';
import { ScoreboardController } from '@/app/controller/scoreboard_controller';
import { ScoreboardItem } from '@/app/model/scoreboard_model';
import { useUser } from '@/app/context/UserProfileContext';
import Loading from '@/views/ui/LoadingComponent';

import { styles } from '@/app/styles/scoreboard_style';

export default function ScoreboardComponent() {
  const router = useRouter();
  const { profile } = useUser();
  
  // State management using controller directly
  const [scoreData, setScoreData] = useState<ScoreboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load scoreboard data using controller
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await ScoreboardController.loadScoreboard();
        if (result.success && result.data) {
          setScoreData(result.data);
        } else {
          console.error('Error loading scoreboard:', result.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Find current town data from scoreData
  const currentTownData = scoreData.find((item) => item.town_name === profile?.town);

  // Get current town's rank
  const currentTownRank = currentTownData
    ? scoreData.findIndex((item) => item.town_name === profile?.town) + 1
    : null;

  // Get rank badge color and icon
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { color: '#FFD700', icon: '🥇' };
      case 2:
        return { color: '#C0C0C0', icon: '🥈' };
      case 3:
        return { color: '#CD7F32', icon: '🥉' };
      default:
        return { color: '#6A0DAD', icon: `${rank}` };
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.title}>SCOREBOARD</Text>
        <Text style={styles.subtitle}></Text>

        {/* Floating Current Town Panel */}
        {profile?.town && currentTownData && (
          <View style={styles.floatingPanel}>
            <Text style={styles.floatingPanelTitle}>YOUR TOWN</Text>
            <View style={styles.floatingPanelContent}>
              <View style={styles.townInfo}>
                <Text style={styles.townName}>{profile.town}</Text>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: getRankStyle(currentTownRank!).color },
                  ]}>
                  <Text style={styles.rankBadgeText}>#{currentTownRank}</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statText}>♻️ {currentTownData.green_score || 0}</Text>
                <Text style={styles.statText}>⚡ {currentTownData.electricity || 0}</Text>
                <Text style={styles.statText}>⛽ {currentTownData.gas || 0}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Main Leaderboard */}
        {scoreData.length === 0 ? (
          <View style={[styles.leaderboardCard, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <Text style={[styles.noDataText, { color: 'white' }]}>
              No scores yet!{'\n'}Be the first on the leaderboard
            </Text>
          </View>
        ) : (
          <View style={styles.leaderboardCard}>
            <Text style={styles.leaderboardTitle}>GLOBAL RANKINGS</Text>

            {/* Header Row */}
            <View style={styles.headerRow}>
              <Text style={styles.headerRank}>RANK</Text>
              <Text style={styles.headerTown}>TOWN</Text>
              <Text style={styles.headerStats}>SCORE</Text>
            </View>

            {/* Leaderboard Rows */}
            {scoreData.map((item, index) => {
              const rank = index + 1;
              const rankStyle = getRankStyle(rank);
              const isCurrentTown = item.town_name === profile?.town;

              return (
                <View
                  key={item.id || index}
                  style={[
                    styles.leaderboardRow,
                    isCurrentTown && styles.currentTownRow,
                    index === 0 && styles.firstPlaceRow,
                  ]}>
                  {/* Rank Number */}
                  <View style={styles.rankSection}>
                    <View style={[styles.rankContainer, { backgroundColor: rankStyle.color }]}>
                      <Text style={styles.rankIcon}>{rankStyle.icon}</Text>
                    </View>
                    <Text style={styles.rankNumber}>#{rank}</Text>
                  </View>

                  {/* Town Name */}
                  <View style={styles.townSection}>
                    <Text style={styles.townNameLeaderboard}>
                      {' ' + item.town_name}
                      {isCurrentTown && <Text style={styles.youText}> (YOU)</Text>}
                    </Text>
                  </View>

                  {/* Stats */}
                  <View style={styles.statsSection}>
                    <Text style={styles.greenScore}>♻️ {item.green_score || 0}</Text>
                    <Text style={styles.statValue}>⚡ {item.electricity || 0}</Text>
                    <Text style={styles.statValue}>⛽ {item.gas || 0}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Back to Home Button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>BACK TO HOME</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

