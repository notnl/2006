import { View, Pressable, ScrollView, ImageBackground, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/views/ui/text';
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useScoreboardModel, ScoreboardItem } from '@/app/model/scoreboard_model';
import { useUser } from '@/app/context/UserProfileContext';
import Loading from '@/views/ui/LoadingComponent';

const SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
};

export default function ScoreboardComponent() {
  const router = useRouter();
  const { scoreData, greenScore, loading } = useScoreboardModel();
  const { profile } = useUser();

  // Find current town data from scoreData
  const currentTownData = scoreData.find(item => 
    item.town_name === profile?.town
  );

  // Get current town's rank
  const currentTownRank = currentTownData 
    ? scoreData.findIndex(item => item.town_name === profile?.town) + 1
    : null;

  // Get rank badge color and icon
  const getRankStyle = (rank: number) => {
    switch(rank) {
      case 1:
        return { color: '#FFD700', icon: '🥇' }; // Gold
      case 2:
        return { color: '#C0C0C0', icon: '🥈' }; // Silver
      case 3:
        return { color: '#CD7F32', icon: '🥉' }; // Bronze
      default:
        return { color: '#6A0DAD', icon: `${rank}` }; // Purple with number
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
        <Text style={styles.subtitle}>
        </Text>

        {/* Floating Current Town Panel */}
        {profile?.town && currentTownData && (
          <View style={styles.floatingPanel}>
            <Text style={styles.floatingPanelTitle}>YOUR TOWN</Text>
            <View style={styles.floatingPanelContent}>
              <View style={styles.townInfo}>
                <Text style={styles.townName}>{profile.town}</Text>
                <View style={[styles.rankBadge, { backgroundColor: getRankStyle(currentTownRank!).color }]}>
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
                  key={index} 
                  style={[
                    styles.leaderboardRow,
                    isCurrentTown && styles.currentTownRow,
                    index === 0 && styles.firstPlaceRow
                  ]}
                >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A237E',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 26,
    color: '#FFA726',
    textShadowColor: '#FF0044',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Floating Panel Styles
  floatingPanel: {
    backgroundColor: 'rgba(179, 157, 219, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#7E57C2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingPanelTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 12,
  },
  floatingPanelContent: {
    alignItems: 'center',
  },
  townInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  townName: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#1A237E',
    flex: 1,
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankBadgeText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#1A237E',
  },
  // Leaderboard Styles
  leaderboardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 4,
    borderColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  leaderboardTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#1A237E',
  },
  headerRank: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#1A237E',
    width: '20%',
  },
  headerTown: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#1A237E',
    width: '40%',
    textAlign: 'left',
  },
  headerStats: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#1A237E',
    width: '40%',
    textAlign: 'right',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentTownRow: {
    backgroundColor: 'rgba(179, 157, 219, 0.3)',
    borderColor: '#7E57C2',
    borderWidth: 3,
  },
  firstPlaceRow: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '20%',
  },
  rankContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankIcon: {
    fontSize: 10,
  },
  rankNumber: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#1A237E',
  },
  townSection: {
    width: '40%',
  },
  townNameLeaderboard: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#1A237E',
  },
  youText: {
    color: '#FF4081',
    fontSize: 8,
  },
  statsSection: {
    width: '40%',
    alignItems: 'flex-end',
  },
  greenScore: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#1A237E',
  },
  noDataText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  backButton: {
    backgroundColor: '#FFA726',
    borderColor: '#FF4081',
    borderWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 24,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  backButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#3B0A00',
    textAlign: 'center',
  },
});
