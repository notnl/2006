import { View, Alert, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/views/ui/text';
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
