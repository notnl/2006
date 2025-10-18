import { View, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ActivityIndicator } from 'react-native';

const SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (!userId) {
          setProfile(null);
          return;
        }

        const { data, error, status } = await supabase
          .from('userprofile')
          .select('*')
          .eq('id', userId)
          .single();

        if (error && status !== 406) throw error;
        
        if (mounted) setProfile(data ?? null);
      } catch (err) {
        console.error('fetchProfile error', err);
        Alert.alert('Error fetching profile', (err as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50/50 justify-center items-center">
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-gray-50/50 justify-center items-center p-6">
        <Stack.Screen options={SCREEN_OPTIONS} />
        <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5 w-full max-w-sm">
          <CardContent className="p-8 items-center justify-center">
            <Text className="text-lg text-gray-600 text-center">
              No profile found. Please sign in.
            </Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  // Parse badges and rewards from string to array
  const badges = profile.badges ? JSON.parse(profile.badges) : [];
  const rewards = profile.rewards ? JSON.parse(profile.rewards) : [];

  return (
    <ScrollView className="flex-1 bg-gray-50/50">
      <Stack.Screen options={SCREEN_OPTIONS} />
      
      <View className="p-6 gap-6">
        {/* Profile Header */}
        <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
          <CardHeader className="items-center pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              👤 User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">NRIC</Text>
              <Text className="font-medium">{profile.nric || '—'}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Ranking</Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-800 font-medium">
                  #{profile.ranking || 'Unranked'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Green Score Overview */}
        <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
          <CardHeader>
            <CardTitle className="text-xl text-center">🌱 Green Score</CardTitle>
          </CardHeader>
          <CardContent className="items-center gap-4">
            <View className="bg-green-100 px-6 py-4 rounded-2xl">
              <Text className="text-3xl font-bold text-green-800 text-center">
                {profile.green_score || 0}
              </Text>
              <Text className="text-green-600 text-center">Total Points</Text>
            </View>
            <View className="flex-row justify-between w-full">
              <View className="items-center">
                <Text className="text-blue-600 font-medium">💧</Text>
                <Text className="text-lg font-bold">{profile.water_consumption || 0}</Text>
                <Text className="text-xs text-gray-600">Water</Text>
              </View>
              <View className="items-center">
                <Text className="text-yellow-600 font-medium">⚡</Text>
                <Text className="text-lg font-bold">{profile.electricity_usage || 0}</Text>
                <Text className="text-xs text-gray-600">Electricity</Text>
              </View>
              <View className="items-center">
                <Text className="text-green-600 font-medium">♻️</Text>
                <Text className="text-lg font-bold">{profile.recycling_rate || 0}</Text>
                <Text className="text-xs text-gray-600">Recycling</Text>
              </View>
              <View className="items-center">
                <Text className="text-purple-600 font-medium">👥</Text>
                <Text className="text-lg font-bold">{profile.resident_contribution || 0}</Text>
                <Text className="text-xs text-gray-600">Community</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Badges Section */}
        {badges.length > 0 && (
          <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
            <CardHeader>
              <CardTitle className="text-xl">🏆 Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row flex-wrap gap-2">
                {badges.map((badge: string, index: number) => (
                  <View key={index} className="bg-amber-100 px-3 py-2 rounded-full">
                    <Text className="text-amber-800 text-sm font-medium">{badge}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Rewards Section */}
        {rewards.length > 0 && (
          <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
            <CardHeader>
              <CardTitle className="text-xl">🎁 Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="gap-2">
                {rewards.map((reward: string, index: number) => (
                  <View key={index} className="bg-purple-100 px-4 py-3 rounded-lg">
                    <Text className="text-purple-800 font-medium">{reward}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Environmental Impact Summary */}
        <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
          <CardHeader>
            <CardTitle className="text-xl">📊 Environmental Impact</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Water Consumption</Text>
              <Text className="font-medium">{profile.water_consumption || 0} L</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Electricity Usage</Text>
              <Text className="font-medium">{profile.electricity_usage || 0} kWh</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Recycling Rate</Text>
              <Text className="font-medium">{profile.recycling_rate || 0}%</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Community Contribution</Text>
              <Text className="font-medium">{profile.resident_contribution || 0} pts</Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
