import { View, Pressable, ScrollView, ImageBackground, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/views/ui/text';
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useScoreboardModel, ScoreboardItem } from '@/app/model/scoreboard_model';

import  Loading  from '@/views/ui/LoadingComponent';

const SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
};

export default function ScoreboardComponent() {
  const router = useRouter();
  const { scoreData, greenScore, loading } = useScoreboardModel();

  // Assign tiers based on rank position
  const getTierForRank = (index: number) => {
    if (index === 0) return { name: 'CHAMPION', color: '#FF69B4', icon: '🏆' };
    if (index === 1) return { name: 'DIAMOND', color: '#7B68EE', icon: '💎' };
    if (index >= 2 && index <= 4) return { name: 'GOLD', color: '#7FFF00', icon: '🥇' };
    if (index >= 5 && index <= 9) return { name: 'SILVER', color: '#FFD700', icon: '🥈' };
    return null;
  };

  // Group data by tiers
  const groupedByTiers = () => {
    const groups: { [key: string]: ScoreboardItem[] } = {
      CHAMPION: [],
      DIAMOND: [],
      GOLD: [],
      SILVER: [],
    };

    scoreData.forEach((item, index) => {
      const tier = getTierForRank(index);
      if (tier) {
        groups[tier.name].push(item);
      }
    });

    return groups;
  };

  if (loading) {

    return (
        <Loading/>
    );
  }

  const tiersData = groupedByTiers();

  return (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
        

        {/* Title */}
        <Text style={styles.title}>SCOREBOARD</Text>
        <Text className="text-white text-center mb-4" style={{fontFamily: 'PressStart2P', fontSize: 10}}>
          Week 35, 5 days left
        </Text>

        {scoreData.length === 0 ? (
          <View style={[styles.tierCard, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <Text style={[styles.tierName, { color: 'white', textAlign: 'center' }]}>
              No scores yet!{'\n'}Be the first on the leaderboard
            </Text>
          </View>
        ) : (
          <>
            {/* Champion Tier */}
            {tiersData.CHAMPION.length > 0 && (
              <View style={[styles.tierCard, { backgroundColor: '#FF69B4' }]}>
                <View style={styles.tierHeader}>
                  <Text style={{ fontSize: 24 }}>🏆</Text>
                  <Text style={styles.tierTitle}>CHAMPION</Text>
                </View>
                {tiersData.CHAMPION.map((item, idx) => (
                  <View key={idx} style={styles.townRow}>
                    <Text style={styles.tierName}>{item.town_name}</Text>
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>⛽ {item.gas || 0}</Text>
                      <Text style={styles.statText}>⚡ {item.electricity || 0}</Text>
                      <Text style={styles.statText}>♻️ {item.green_score || 0}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Diamond Tier */}
            {tiersData.DIAMOND.length > 0 && (
              <View style={[styles.tierCard, { backgroundColor: '#7B68EE' }]}>
                <View style={styles.tierHeader}>
                  <Text style={{ fontSize: 24 }}>💎</Text>
                  <Text style={styles.tierTitle}>DIAMOND</Text>
                </View>
                {tiersData.DIAMOND.map((item, idx) => (
                  <View key={idx} style={styles.townRow}>
                    <Text style={styles.tierName}>{item.town_name}</Text>
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>⛽ {item.gas || 0}</Text>
                      <Text style={styles.statText}>⚡ {item.electricity || 0}</Text>
                      <Text style={styles.statText}>♻️ {item.green_score || 0}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Gold Tier */}
            {tiersData.GOLD.length > 0 && (
              <View style={[styles.tierCard, { backgroundColor: '#7FFF00' }]}>
                <View style={styles.tierHeader}>
                  <Text style={{ fontSize: 24 }}>🥇</Text>
                  <Text style={styles.tierTitle}>GOLD</Text>
                </View>
                {tiersData.GOLD.map((item, idx) => (
                  <View key={idx} style={styles.townRow}>
                    <Text style={styles.tierName}>{item.town_name}</Text>
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>⛽ {item.gas || 0}</Text>
                      <Text style={styles.statText}>⚡ {item.electricity || 0}</Text>
                      <Text style={styles.statText}>♻️ {item.green_score || 0}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Silver Tier */}
            {tiersData.SILVER.length > 0 && (
              <View style={[styles.tierCard, { backgroundColor: '#FFD700' }]}>
                <View style={styles.tierHeader}>
                  <Text style={{ fontSize: 24 }}>🥈</Text>
                  <Text style={styles.tierTitle}>SILVER</Text>
                </View>
                {tiersData.SILVER.map((item, idx) => (
                  <View key={idx} style={styles.townRow}>
                    <Text style={styles.tierName}>{item.town_name}</Text>
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>⛽ {item.gas || 0}</Text>
                      <Text style={styles.statText}>⚡ {item.electricity || 0}</Text>
                      <Text style={styles.statText}>♻️ {item.green_score || 0}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Back to Home Button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>BACK TO HOME</Text>
        </Pressable>
      </ScrollView>
      </>
  );
}

// Keep all your existing styles exactly the same
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  topBarText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: 'white',
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
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  tierCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#000',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tierTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#000',
  },
  townRow: {
    marginBottom: 12,
  },
  tierName: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#1A237E',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#1A237E',
  },
  backButton: {
    backgroundColor: '#FFA726',
    borderColor: '#FF4081',
    borderWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 40,
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
