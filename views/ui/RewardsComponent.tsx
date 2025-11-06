import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";

export default function RewardsComponent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [userScore, setUserScore] = useState<number>(0);
  const [badges, setBadges] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: user, error: userErr } = await supabase
          .from("userprofile")
          .select(
            "green_score, badge_water_saver, badge_recycler, badge_energy_efficient, badge_earth_guardian"
          )
          .eq("nric", "S1234567I")
          .single();

        if (userErr) throw userErr;

        setUserScore(user?.green_score || 0);

        // set badge values
        setBadges({
          water: user?.badge_water_saver,
          recycle: user?.badge_recycler,
          energy: user?.badge_energy_efficient,
          earth: user?.badge_earth_guardian,
        });

        const { data: rewardsData, error: rewardsErr } = await supabase
          .from("rewards")
          .select("*")
          .order("id", { ascending: true });

        if (rewardsErr) throw rewardsErr;

        setRewards(rewardsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  async function handleRedeem(reward: any) {
    try {
      if (!reward.available) {
        Alert.alert("Unavailable", "This reward is currently out of stock.");
        return;
      }

      if (userScore < 50) {
        Alert.alert(
          "Insufficient Points",
          "You need at least 50 points to redeem this reward."
        );
        return;
      }

      const newScore = userScore - 50;

      const { error: userErr } = await supabase
        .from("userprofile")
        .update({ green_score: newScore })
        .eq("nric", "S1234567I");

      if (userErr) throw userErr;

      const { error: rewardErr } = await supabase
        .from("rewards")
        .update({ available: false })
        .eq("id", reward.id);

      if (rewardErr) throw rewardErr;

      setUserScore(newScore);
      setRewards((prev) =>
        prev.map((r) => (r.id === reward.id ? { ...r, available: false } : r))
      );

      Alert.alert("Success!", `You redeemed ${reward.reward_name}.`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while redeeming.");
    }
  }

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/bg-city.png")}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              marginTop: 16,
              color: "white",
              fontFamily: "PressStart2P",
              fontSize: 8,
            }}
          >
            Loading...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/bg-city.png")}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      {/* Header */}
      <Text style={styles.greenScoreText}>Your Green Score: {userScore}</Text>
      <Text style={styles.rewardsHeader}>REWARDS</Text>

      {/* BADGES SECTION */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeHeader}>BADGES</Text>
        <View style={styles.badgeRow}>
          <Text
            style={[
              styles.badgeIcon,
              !badges.water && styles.lockedBadge,
            ]}
          >
            {badges.water ? "❄️" : "🔒"}
          </Text>
          <Text
            style={[
              styles.badgeIcon,
              !badges.recycle && styles.lockedBadge,
            ]}
          >
            {badges.recycle ? "♻️" : "🔒"}
          </Text>
          <Text
            style={[
              styles.badgeIcon,
              !badges.energy && styles.lockedBadge,
            ]}
          >
            {badges.energy ? "⚡" : "🔒"}
          </Text>
          <Text
            style={[
              styles.badgeIcon,
              !badges.earth && styles.lockedBadge,
            ]}
          >
            {badges.earth ? "🌍" : "🔒"}
          </Text>
        </View>
      </View>

      {/* Rewards list */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {rewards.map((r, index) => (
          <View key={index} style={styles.rewardCard}>
            <Text style={styles.rewardName}>{r.reward_name}</Text>

            {r.available ? (
              <LinearGradient
                colors={["#ff66cc", "#ff9933"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.redeemGradient}
              >
                <Pressable
                  style={styles.redeemButton}
                  onPress={() => handleRedeem(r)}
                >
                  <Text style={styles.redeemButtonText}>REDEEM NOW</Text>
                </Pressable>
              </LinearGradient>
            ) : (
              <Pressable style={styles.redeemedButton}>
                <Text style={styles.redeemedButtonText}>REDEEMED</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Back button */}
      <LinearGradient
        colors={["#ff66cc", "#ff9933"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backGradient}
      >
        <Pressable
          onPress={() => router.push("/menu")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>BACK TO HOME</Text>
        </Pressable>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  greenScoreText: {
    fontFamily: "PressStart2P",
    color: "white",
    fontSize: 8,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  rewardsHeader: {
    fontFamily: "PressStart2P",
    fontSize: 16,
    color: "#FF69B4",
    textShadowColor: "#800080",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    marginBottom: 20,
  },
  badgeContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: "80%",
    alignItems: "center",
  },
  badgeHeader: {
    fontFamily: "PressStart2P",
    fontSize: 12,
    color: "#5E35B1",
    textAlign: "center",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  badgeIcon: {
    fontSize: 32,
  },
  lockedBadge: {
    opacity: 0.4,
  },
  scrollContainer: {
    backgroundColor: "rgba(180,220,255,0.8)",
    borderRadius: 16,
    width: "90%",
    paddingVertical: 10,
    marginBottom: 20,
  },
  rewardCard: {
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
    width: "90%",
    borderColor: "#ff66cc",
    borderWidth: 2,
    shadowColor: "#cc33ff",
    shadowOpacity: 0.8,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 4,
  },
  rewardName: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#1A0033",
    width: "55%",
  },
  redeemGradient: {
    borderRadius: 4,
    padding: 2,
  },
  redeemButton: {
    backgroundColor: "#ffcc66",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  redeemButtonText: {
    fontFamily: "PressStart2P",
    fontSize: 6,
    color: "#3B0A00",
    textAlign: "center",
  },
  redeemedButton: {
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#2E7D32",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  redeemedButtonText: {
    fontFamily: "PressStart2P",
    fontSize: 6,
    color: "white",
  },
  backGradient: {
    borderRadius: 6,
    padding: 2,
    shadowColor: "#cc33ff",
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 3, height: 3 },
  },
  backButton: {
    backgroundColor: "#FFA726",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  backButtonText: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#3B0A00",
    textAlign: "center",
  },
});
