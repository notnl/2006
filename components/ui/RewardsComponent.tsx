import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ImageBackground, ScrollView, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";

export default function RewardsComponent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [userScore, setUserScore] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: user, error: userErr } = await supabase
          .from("userprofile")
          .select("green_score")
          .eq("nric", "S1234567I")
          .single();

        if (userErr) throw userErr;
        setUserScore(user?.green_score || 0);

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

  // redeem reward
  async function handleRedeem(reward: any) {
    try {
      if (!reward.available) {
        Alert.alert("Unavailable", "This reward is currently out of stock.");
        return;
      }

      if (userScore < 50) {
        Alert.alert("Insufficient Points", "You need at least 50 points to redeem this reward.");
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
        prev.map((r) =>
          r.id === reward.id ? { ...r, available: false } : r
        )
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ marginTop: 16, color: "white", fontFamily: "PressStart2P", fontSize: 8 }}>
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
      style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      {/* header */}
      <Text
        style={{
          fontFamily: "PressStart2P",
          color: "white",
          fontSize: 8,
          textAlign: "center",
          marginTop: 40,
          marginBottom: 10,
        }}
      >
        Your Green Score: {userScore}
      </Text>

      <Text
        style={{
          fontFamily: "PressStart2P",
          fontSize: 16,
          color: "#FF69B4",
          textShadowColor: "#800080",
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 1,
          marginBottom: 20,
        }}
      >
        REWARDS
      </Text>

      {/* scrollable rewards list */}
      <ScrollView
        style={{
          backgroundColor: "rgba(180,220,255,0.8)",
          borderRadius: 16,
          width: "90%",
          paddingVertical: 10,
          marginBottom: 20,
        }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {rewards.map((r, index) => (
          <View
            key={index}
            style={{
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
            }}
          >
            <Text
              style={{
                fontFamily: "PressStart2P",
                fontSize: 8,
                color: "#1A0033",
                width: "55%",
              }}
            >
              {r.reward_name}
            </Text>

            {r.available ? (
              <LinearGradient
                colors={["#ff66cc", "#ff9933"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 4,
                  padding: 2,
                }}
              >
                <Pressable
                  style={{
                    backgroundColor: "#ffcc66",
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 4,
                  }}
                  onPress={() => handleRedeem(r)}
                >
                  <Text
                    style={{
                      fontFamily: "PressStart2P",
                      fontSize: 6,
                      color: "#3B0A00",
                      textAlign: "center",
                    }}
                  >
                    REDEEM NOW
                  </Text>
                </Pressable>
              </LinearGradient>
            ) : (
              <Pressable
                style={{
                  backgroundColor: "#4CAF50",
                  borderWidth: 2,
                  borderColor: "#2E7D32",
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "PressStart2P",
                    fontSize: 6,
                    color: "white",
                  }}
                >
                  REDEEMED 
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      {/* back button */}
      <LinearGradient
        colors={["#ff66cc", "#ff9933"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 6,
          padding: 2,
          shadowColor: "#cc33ff",
          shadowOpacity: 1,
          shadowRadius: 8,
          shadowOffset: { width: 3, height: 3 },
        }}
      >
        <Pressable
          onPress={() => router.push("/menu")}
          style={{
            backgroundColor: "#FFA726",
            borderRadius: 6,
            paddingVertical: 10,
            paddingHorizontal: 30,
          }}
        >
          <Text
            style={{
              fontFamily: "PressStart2P",
              fontSize: 8,
              color: "#3B0A00",
              textAlign: "center",
            }}
          >
            BACK TO HOME
          </Text>
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
  },
});
