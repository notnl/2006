import React from "react";
import { View, Text, Pressable, ImageBackground, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function RewardsComponent() {
  const router = useRouter();

  const rewards = [
    { label: "NTUC\n$10 VOUCHER", status: "redeem" },
    { label: "GRAB\n$5 VOUCHER", status: "redeem" },
    { label: "NANDOS\nFREE CHICKEN", status: "redeem" },
    { label: "SHEIN\n$15 VOUCHER", status: "locked" },
    { label: "TRUST\n$15 CASHBACK", status: "locked" },
  ];

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
        Your Green Score: 843
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
              {r.label}
            </Text>

            {/* button with gradient border */}
            {r.status === "redeem" ? (
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
                  backgroundColor: "#A9A9A9",
                  borderWidth: 2,
                  borderColor: "#707070",
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
                  LOCKED
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      {/* back button with glow */}
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
