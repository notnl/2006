import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/views/ui/text';
import { useUser } from '@/app/context/UserProfileContext';
import { useEffect, useState,Fragment } from 'react';
import { supabase } from '@/lib/supabase';

import { styles } from '@/app/styles/profile_style';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile } = useUser();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  //Skip first index to match our DB badge indexing
  const badges_emojis = ['','💧','♻️','⚡','🌍','🗻','🗼'] 

  useEffect(() => {
    if (profile?.nric) {
      fetchUserBadges(profile.nric);
    }
  }, []);

  async function fetchUserBadges(nric) {
    const { data, error } = await supabase.from('badges').select('*').ilike('nric', nric);

    if (error) {
      console.error('Error fetching badges:', error);
    } else {

      let onlyOurBadge = new Array(badges_emojis.length).fill(null)

    data.forEach((badge) => {
      const badgeIndex = badge.badge_id;
      if (badgeIndex >= 0 && badgeIndex < badges_emojis.length) {
        onlyOurBadge[badgeIndex] = badge
      }
    });

      setBadges(onlyOurBadge);
    }

    setLoading(false);
  }


  if (!profile || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7E57C2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PROFILE</Text>

      <View style={styles.profileCard}>
        <Text style={styles.username}>{profile.username || 'UNKNOWN'}</Text>

        <Text style={styles.town}>{profile.town || 'SINGAPORE'}</Text>

        <Text style={styles.townRank}>TOWN RANK: #{profile.town_ranking || 'N/A'}</Text>

        <Text style={styles.greenScoreLabel}>GREEN SCORE:</Text>

        <Text style={styles.greenScoreValue}>{profile.green_score || 0}</Text>

        <View style={styles.badgesContainer}>
          <Text style={styles.badgesTitle}>BADGES</Text>

          <View style={styles.badgesRow}>
          {
            badges.map( (curBadge, index) => { 

              if (curBadge) {
               return ( 
                <Fragment key={index}>
                      <View style={styles.badgeIcon}>
                      <Text style={styles.badgeEmoji}>{ badges_emojis[curBadge.id] }</Text>
                      </View>
                      </Fragment>
                      ) 
              } else {

               return ( 
                <Fragment key={index}>
                      <View style={styles.badgeIcon}>
                      <Text style={styles.badgeEmoji}>{ '🔒'}</Text>
                      </View>
                      </Fragment>)
              }
            
              
            })
          }
          </View>
        </View>
      </View>

      {/* === Back Button === */}
      <Pressable onPress={() => router.push('/menu')} style={styles.backButton}>
        <Text style={styles.backButtonText}>BACK TO HOME</Text>
      </Pressable>
    </View>
  );
}

