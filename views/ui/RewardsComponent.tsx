import React from "react";
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useRewards } from '@/app/model/reward_model';

import  Loading  from '@/views/ui/LoadingComponent';


export default function RewardsView() {
  const router = useRouter();
  const { loading, rewards, userScore, badges, handleRedeem } = useRewards();

  if (loading) {
    return (
        <Loading/>
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
          <Text style={[styles.badgeIcon, !badges.water && styles.lockedBadge]}>
            {badges.water ? "❄️" : "🔒"}
          </Text>
          <Text style={[styles.badgeIcon, !badges.recycle && styles.lockedBadge]}>
            {badges.recycle ? "♻️" : "🔒"}
          </Text>
          <Text style={[styles.badgeIcon, !badges.energy && styles.lockedBadge]}>
            {badges.energy ? "⚡" : "🔒"}
          </Text>
          <Text style={[styles.badgeIcon, !badges.earth && styles.lockedBadge]}>
            {badges.earth ? "🌍" : "🔒"}
          </Text>
        </View>
      </View>

      {/* Rewards list */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {rewards.map((reward, index) => (
          <View key={index} style={styles.rewardCard}>
            <Text style={styles.rewardName}>{reward.reward_name}</Text>

            {reward.available ? (
              <LinearGradient
                colors={["#ff66cc", "#ff9933"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.redeemGradient}
              >
                <Pressable
                  style={styles.redeemButton}
                  onPress={() => handleRedeem(reward)}
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
  loadingText: {
    marginTop: 16,
    color: "white",
    fontFamily: "PressStart2P",
    fontSize: 8,
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
  scrollContent: {
    alignItems: "center",
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
