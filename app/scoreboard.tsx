import { View, Pressable, ScrollView, ImageBackground, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityIndicator } from 'react-native';

import { RealtimeChannel } from '@supabase/supabase-js';
import {fetchUserProfile} from '../lib/GetUser';

const SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
};

interface ScoreboardItem {
  id: number;
  town_name: string;
  green_score: number;
  water?: number;
  electricity?: number;
  recycle?: number;
}

export default function ScoreboardScreen() {
  const router = useRouter();
  const [scoreData, setScoreData] = useState<ScoreboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [greenScore, setGreenScore] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);


  useEffect(() => {
    fetchScoreboard();
    subscribeToScoreboard();
    loadProfile();
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  
  const loadProfile = async () => {
    const userProfile =  await fetchUserProfile();
    if (userProfile != null) {
      setGreenScore(userProfile.green_score)
    
    }else  {

    }
    
  };

  async function fetchScoreboard() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scoreboard')
        .select('*')
        .limit(100);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      const filtered_data = data.filter(item => { return (item != null && item.gas != null && item.electricity != null) } )
      //Calculate Green score here
      filtered_data.map(currentData => {
        const electricity = currentData.electricity ?? 0;
        const gas = currentData.gas ?? 0;
        // Copied from load_to_db.py
        const elec_score = 100 / (1 + (electricity / 410))**1.3;
        const gas_score = 100 / (1 + (gas / 70))**1.0;
        currentData.green_score = ((elec_score + gas_score) / 2).toFixed(1);
        return currentData
      })

      filtered_data.sort((a, b) => b.green_score - a.green_score)

      setScoreData((filtered_data || []) as ScoreboardItem[]);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleScoreboardInsert(payload: any) {
    if (!payload.payload?.record) return;
    const newRecord = payload.payload.record as ScoreboardItem;
    setScoreData(prev => {
      const filteredPrev = prev.filter(item => { return (item != null && item.gas != null && item.electricity != null) } );


      const newData = [newRecord, ...filteredPrev];
      return newData
        .sort((a, b) => b.green_score - a.green_score)
    });
  }

  function handleScoreboardUpdate(payload: any) {
    if (!payload.payload?.record) return;
    const updatedRecord = payload.payload.record as ScoreboardItem;
    setScoreData(prev => {
      const filteredPrev = prev.filter(item => { return (item != null && item.gas != null && item.electricity != null) } );


      const updatedData = filteredPrev.map(item => 
        item.id === updatedRecord.id ? updatedRecord : item
      );

      updatedData.map(currentData => {
        currentData.green_score = currentData.electricity + currentData.gas
        return currentData
      })
      return updatedData
        .sort((a, b) => b.green_score - a.green_score)
        .filter(item => item != null);
    });
  }

  function handleScoreboardDelete(payload: any) {
    if (!payload.payload?.old_record) return;
    const deletedRecord = payload.payload.old_record as ScoreboardItem;
    setScoreData(prev => 
      prev.filter(item => item && item.id !== deletedRecord.id)
    );
  }

  async function subscribeToScoreboard() {
    const channel = supabase.channel('scoreboard', {
      config: { broadcast: { self: false }, private: true }
    });

    channel.on('broadcast', { event: 'INSERT' }, handleScoreboardInsert);
    channel.on('broadcast', { event: 'UPDATE' }, handleScoreboardUpdate);
    channel.on('broadcast', { event: 'DELETE' }, handleScoreboardDelete);

    await channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to scoreboard channel');
      }
    });

    channelRef.current = channel;
  }

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
      <ImageBackground
        source={require('@/assets/images/bg-city.png')}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Stack.Screen options={SCREEN_OPTIONS} />
          <ActivityIndicator size="large" color="#00FFAA" />
          <Text style={{ marginTop: 16, color: 'white', fontFamily: 'PressStart2P', fontSize: 8 }}>
            Loading...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  const tiersData = groupedByTiers();


  return (
    <ImageBackground
      source={require('../assets/images/bg-city.png')}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
        
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>Your Green Score: {greenScore}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Text style={{ fontSize: 24 }}>📍</Text>
            <Text style={{ fontSize: 24 }}>📢</Text>
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>SCOREBOARD</Text>
        <Text style={styles.subtitle}>Week 35, 5 days left</Text>

        {/* Icons Row */}
        <View style={styles.iconsRow}>
          <Text style={{ fontSize: 32 }}>🏆</Text>
          <Text style={{ fontSize: 32 }}>⚡</Text>
          <Text style={{ fontSize: 32 }}>⛽</Text>
          <Text style={{ fontSize: 32 }}>✨</Text>
        </View>

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
        <Pressable
          
  onPress={() => router.back()}
  style={styles.backButton}
>
          <Text style={styles.backButtonText}>BACK TO HOME</Text>
        </Pressable>
      </ScrollView>
    </ImageBackground>
  );
}

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
    fontSize: 24,
    color: '#FFA726',
    textShadowColor: '#FF0044',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
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
