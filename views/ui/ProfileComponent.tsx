import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/views/ui/text';
import { useUser } from '@/app/context/UserProfileContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile } = useUser(); // user and profile context
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch badges linked to this user's NRIC
  useEffect(() => {
    if (profile?.nric) {
      console.log('User NRIC from profile:', profile.nric);
      fetchUserBadges(profile.nric);
    }
  }, [profile]);

  async function fetchUserBadges(nric) {
    //console.log(' Fetching badges for NRIC:', nric);
    //console.log(' Type of NRIC:', typeof nric, 'Value:', nric);
    //console.log(' Using Supabase URL:', supabase.supabaseUrl);
    //console.log(' Using Supabase Key:', supabase.supabaseKey ? 'EXISTS ' : 'MISSING ');

    //console.log(' Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    //console.log(' Supabase Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_KEY);

    const { data, error } = await supabase.from('badges').select('*').ilike('nric', nric);

    if (error) {
      console.error(' Error fetching badges:', error);
    } else {
      console.log(' Badges fetched:', data);
      setBadges(data);
    }

    setLoading(false);
  }

  // Helper to check if user has a specific badge
  const hasBadge = (keyword) =>
    badges.some((b) => b.id == keyword);

  // Loading spinner
  if (!profile || loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
        <ActivityIndicator size="large" color="#7E57C2" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      {/* === PROFILE Title === */}
      <Text
        style={{
          fontFamily: 'PressStart2P',
          fontSize: 24,
          color: '#FFA726',
          textShadowColor: '#FF0044',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 1,
          marginBottom: 20,
        }}>
        PROFILE
      </Text>

      {/* === PROFILE Card === */}
      <View
        style={{
          backgroundColor: '#B39DDB',
          borderRadius: 20,
          padding: 24,
          width: '90%',
          maxWidth: 400,
          borderWidth: 4,
          borderColor: '#7E57C2',
        }}>
        {/* Username / NRIC */}
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 16,
            color: '#000',
            textAlign: 'center',
            marginBottom: 8,
          }}>
          {profile.username || 'UNKNOWN'}
        </Text>

        {/* Town */}
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 10,
            color: '#1A237E',
            textAlign: 'center',
            marginBottom: 8,
          }}>
          {profile.town || 'SINGAPORE'}
        </Text>

        {/* Town Rank */}
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 8,
            color: '#4A148C',
            textAlign: 'center',
            marginBottom: 24,
          }}>
          TOWN RANK: #{profile.town_ranking || 'N/A'}
        </Text>

        {/* Green Score */}
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 12,
            color: '#1A237E',
            textAlign: 'center',
            marginBottom: 8,
          }}>
          GREEN SCORE:
        </Text>

        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 32,
            color: '#1A237E',
            textAlign: 'center',
            marginBottom: 24,
          }}>
          {profile.green_score || 0}
        </Text>

        {/* === BADGES SECTION === */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
          }}>
          <Text
            style={{
              fontFamily: 'PressStart2P',
              fontSize: 12,
              color: '#5E35B1',
              textAlign: 'center',
              marginBottom: 16,
            }}>
            BADGES
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 16,
            }}>
            {/* Water Saver */}
            <View style={styles.badgeIcon}>
              <Text style={{ fontSize: 40 }}>{hasBadge(1) ? '💧' : '🔒'}</Text>
            </View>

            {/* Recycler */}
            <View style={styles.badgeIcon}>
              <Text style={{ fontSize: 40 }}>{hasBadge(2) ? '♻️' : '🔒'}</Text>
            </View>

            {/* Energy Efficient */}
            <View style={styles.badgeIcon}>
              <Text style={{ fontSize: 40 }}>{hasBadge(3) ? '⚡' : '🔒'}</Text>
            </View>

            {/* Earth Guardian */}
            <View style={styles.badgeIcon}>
              <Text style={{ fontSize: 40 }}>{hasBadge(4) ? '🌍' : '🔒'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* === Back Button === */}
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
        }}>
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 10,
            color: '#3B0A00',
            textAlign: 'center',
          }}>
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
