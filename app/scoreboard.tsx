import { View, FlatList, StyleSheet } from 'react-native';
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
            {/* Rank */}
            <View className="flex-row items-center gap-4">
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
              
              {/* User Info */}
              <View className="gap-1">
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

            {/* Score Breakdown */}
            <View className="items-end gap-1">
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
