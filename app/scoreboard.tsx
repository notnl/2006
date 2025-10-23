/*import { View, FlatList, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
};

export default function ScoreboardScreen() {
  const [scoreData, setScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  useEffect(() => {
    fetchScoreboard();
    subscribeToScoreboard();
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  async function fetchScoreboard() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scoreboard')
        .select('*')
        .order('green_score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }
      
      setScoreData((data || []).filter(item => item != null));
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleScoreboardInsert(payload) {
    console.log('Insert event:', payload);
    if (!payload.payload?.record) return;
    
    const newRecord = payload.payload.record;
    setScoreData(prev => {
      const filteredPrev = prev.filter(item => item != null);
      const newData = [newRecord, ...filteredPrev];
      return newData
        .sort((a, b) => b.green_score - a.green_score)
        .slice(0, 100)
        .filter(item => item != null);
    });
  }

  function handleScoreboardUpdate(payload) {
    console.log('Update event:', payload);
    if (!payload.payload?.record) return;
    
    const updatedRecord = payload.payload.record;
    setScoreData(prev => {
      const filteredPrev = prev.filter(item => item != null);
      const updatedData = filteredPrev.map(item => 
        item.id === updatedRecord.id ? updatedRecord : item
      );
      return updatedData
        .sort((a, b) => b.green_score - a.green_score)
        .filter(item => item != null);
    });
  }

  function handleScoreboardDelete(payload) {
    console.log('Delete event:', payload);
    if (!payload.payload?.old_record) return;
    
    const deletedRecord = payload.payload.old_record;
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

  const renderScoreItem = ({ item, index }) => {
    if (!item) return null;

    // Medal colors for top 3
    const getRankColor = () => {
      switch (index) {
        case 0: return '#FFD700'; // Gold
        case 1: return '#C0C0C0'; // Silver
        case 2: return '#CD7F32'; // Bronze
        default: return '#6B7280'; // Gray
      }
    };

    const getRankStyle = () => {
      if (index < 3) {
        return {
          backgroundColor: getRankColor(),
          color: index === 0 ? '#000' : '#fff',
        };
      }
      return {};
    };

    return (
      <Card className="border-border/0 mb-3 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardContent className="p-4">
          <View className="flex-row items-center justify-between">
            {/* Rank */
            /*<View className="flex-row items-center gap-4">
              <View 
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  index < 3 ? '' : 'bg-gray-100'
                }`}
                style={getRankStyle()}
              >
                <Text 
                  className={`font-bold text-lg ${
                    index < 3 ? (index === 0 ? 'text-black' : 'text-white') : 'text-gray-600'
                  }`}
                >
                  #{index + 1}
                </Text>
              </View>
              
              {/* User Info */
             /* <View className="gap-1">
                <Text className="font-semibold text-base"> {item.town_name}</Text>
                <View className="flex-row items-center gap-2">
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-800 text-xs font-medium">
                      🌱 {item.green_score || 0} pts
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Score Breakdown */
            /*<View className="items-end gap-1">
              <View className="flex-row gap-3">
                <View className="items-center">
                  <Text className="text-blue-600 text-xs font-medium">💧</Text>
                  <Text className="text-xs text-gray-600">{item.water || 0}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-yellow-600 text-xs font-medium">⚡</Text>
                  <Text className="text-xs text-gray-600">{item.electricity || 0}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-green-600 text-xs font-medium">♻️</Text>
                  <Text className="text-xs text-gray-600">{item.recycle || 0}</Text>
                </View>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    );
  };

  const keyExtractor = (item, index) => {
    if (!item || !item.id) return `score-${index}`;
    return item.id.toString();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50/50 p-6">
        <Stack.Screen options={SCREEN_OPTIONS} />
        <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
          <CardContent className="p-8 items-center justify-center">
            <Text className="text-lg text-gray-600">Loading leaderboard...</Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50/50">
      <Stack.Screen options={SCREEN_OPTIONS} />
      
      <View className="p-6">
        <Card className="border-border/0 mb-6 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
          <CardHeader className="items-center pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              🏆 Block Party Leaderboard
            </CardTitle>
            <Text className="text-gray-600 text-center mt-2">
              Top towns for eco-friendly contributors ranked by their green score
            </Text>
          </CardHeader>
        </Card>

        {scoreData.length === 0 ? (
          <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
            <CardContent className="p-8 items-center justify-center">
              <Text className="text-lg text-gray-600 text-center">
                No scores yet.{'\n'}Be the first to join the leaderboard!
              </Text>
            </CardContent>
          </Card>
        ) : (
          <FlatList
            data={scoreData}
            renderItem={renderScoreItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
}
*/
import { View, Pressable, ScrollView, ImageBackground, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityIndicator } from 'react-native';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    fetchScoreboard();
    subscribeToScoreboard();
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  async function fetchScoreboard() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scoreboard')
        .select('*')
        .order('green_score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }
      
      setScoreData((data || []).filter(item => item != null) as ScoreboardItem[]);
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
      const filteredPrev = prev.filter(item => item != null);
      const newData = [newRecord, ...filteredPrev];
      return newData
        .sort((a, b) => b.green_score - a.green_score)
        .slice(0, 100)
        .filter(item => item != null);
    });
  }

  function handleScoreboardUpdate(payload: any) {
    if (!payload.payload?.record) return;
    const updatedRecord = payload.payload.record as ScoreboardItem;
    setScoreData(prev => {
      const filteredPrev = prev.filter(item => item != null);
      const updatedData = filteredPrev.map(item => 
        item.id === updatedRecord.id ? updatedRecord : item
      );
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
        source={require('../assets/images/bg-city.png')}
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
          <Text style={styles.topBarText}>Your Green Score: 843</Text>
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
          <Text style={{ fontSize: 32 }}>💧</Text>
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
                      <Text style={styles.statText}>💧 {item.water || 0}</Text>
                      <Text style={styles.statText}>⚡ {item.electricity || 0}</Text>
                      <Text style={styles.statText}>♻️ {item.recycle || 0}</Text>
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
                      <Text style={styles.statText}>💧 {item.water || 0}</Text>
                      <Text style={styles.statText}>⚡ {item.electricity || 0}</Text>
                      <Text style={styles.statText}>♻️ {item.recycle || 0}</Text>
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
                      <Text style={styles.statText}>💧 {item.water || 0}</Text>
                      <Text style={styles.statText}>⚡ {item.electricity || 0}</Text>
                      <Text style={styles.statText}>♻️ {item.recycle || 0}</Text>
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
                      <Text style={styles.statText}>💧 {item.water || 0}</Text>
                      <Text style={styles.statText}>⚡ {item.electricity || 0}</Text>
                      <Text style={styles.statText}>♻️ {item.recycle || 0}</Text>
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