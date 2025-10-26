/*
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
        {/* Profile Header */
        /*<Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
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

        {/* Green Score Overview */
       /* <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
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

        {/* Badges Section */
        /*{badges.length > 0 && (
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

        {/* Rewards Section */
       /* {rewards.length > 0 && (
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

        {/* Environmental Impact Summary */
        /*<Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
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
} */
import { View, Alert, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00FFAA" />
        <Text
          style={{
            marginTop: 16,
            color: 'white',
            fontFamily: 'PressStart2P',
            fontSize: 8,
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 32,
            borderRadius: 16,
            borderWidth: 3,
            borderColor: '#00FFAA',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: 'white',
              textAlign: 'center',
              fontFamily: 'PressStart2P',
            }}
          >
            No profile found.{'\n'}Please sign in.
          </Text>
        </View>
      </View>
    );
  }

  console.log('Profile fetched:', profile);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      {/* Top icons */}
      <View
        style={{
          position: 'absolute',
          top: 60,
          right: 20,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 24 }}>📍</Text>
        <Text style={{ fontSize: 24 }}>📢</Text>
        <Text style={{ fontSize: 24 }}>⚙️</Text>
      </View>

      {/* PROFILE Title */}
      <Text
        style={{
          fontFamily: 'PressStart2P',
          fontSize: 24,
          color: '#FFA726',
          textShadowColor: '#FF0044',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 1,
          marginBottom: 20,
        }}
      >
        PROFILE
      </Text>

      {/* Main Card */}
      <View
        style={{
          backgroundColor: '#B39DDB',
          borderRadius: 20,
          padding: 24,
          width: '90%',
          maxWidth: 400,
          borderWidth: 4,
          borderColor: '#7E57C2',
        }}
      >
        {/* NRIC */}
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 16,
            color: '#000',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {profile.nric || 'JOHN SMITH'}
        </Text>

        {/* Town */}
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 10,
            color: '#1A237E',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {profile.town}
        </Text>

        {/* Green Score */}
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 12,
            color: '#1A237E',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          GREEN SCORE:
        </Text>

        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 32,
            color: '#1A237E',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {profile.green_score}
        </Text>

        {/* === BADGES SECTION === */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontFamily: 'PressStart2P',
              fontSize: 12,
              color: '#5E35B1',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            BADGES
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            {/* Water Saver */}
            <View style={styles.badgeIcon}>
              <Text style={{ fontSize: 40 }}>
                {profile.badge_water_saver ? '❄️' : '🔒'}
              </Text>
            </View>

            {/* Recycler */}
            <View style={styles.badgeIcon}>
              <Text style={{ fontSize: 40 }}>
                {profile.badge_recycler ? '♻️' : '🔒'}
              </Text>
            </View>

            {/* Energy Efficient */}
            <View style={styles.badgeIcon}>
              <Text style={{ fontSize: 40 }}>
                {profile.badge_energy_efficient ? '⚡' : '🔒'}
              </Text>
            </View>

            {/* Earth Guardian */}
            <View style={styles.badgeIcon}>
              <Text style={{ fontSize: 40 }}>
                {profile.badge_earth_guardian ? '🌍' : '🔒'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Back Button */}
      <Pressable
        onPress={() => router.push('/menu')}
        style={{
          backgroundColor: '#FFA726',
          borderColor: '#FF4081',
          borderWidth: 4,
          paddingVertical: 14,
          paddingHorizontal: 40,
          borderRadius: 8,
          marginTop: 32,
          shadowColor: '#000',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
        }}
      >
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 10,
            color: '#3B0A00',
            textAlign: 'center',
          }}
        >
          BACK TO HOME
        </Text>
      </Pressable>
    </View>
  );
}

const styles = {
  badgeIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
};
