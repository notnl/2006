import React from "react";
import { View, Text, Pressable, ImageBackground, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function ChallengesComponent() {
  const router = useRouter();

  const challenges = [
    {
      title: "WEEKLY CHALLENGE",
      points: "+200 POINTS",
      description: "REDUCE ELECTRICITY BY 5%",
      button: "ACCEPT",
    },
    {
      title: "WEEKLY CHALLENGE",
      points: "+300 POINTS",
      description: "REDUCE AIRCON USE BY AT LEAST 3 HOURS THIS WEEK",
      button: "ACCEPT",
    },
    {
      title: "SEASONAL EVENT",
      points: "",
      description: "EARN LIMITED EDITION BADGE & $15 GRAB VOUCHER\nAPR 22 – APR 30",
      button: "PARTICIPATE",
    },
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
        CHALLENGES
      </Text>

      {/* scrollable list */}
      <ScrollView
        style={{
          backgroundColor: "rgba(255,220,120,0.8)",
          borderRadius: 20,
          width: "90%",
          paddingVertical: 10,
          marginBottom: 20,
        }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {challenges.map((c, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 20,
              marginVertical: 10,
              width: "90%",
              alignItems: "center",
              borderColor: "#ff9933",
              borderWidth: 3,
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
                color: "#3B0A00",
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              {c.title}
            </Text>
            {c.points ? (
              <Text
                style={{
                  fontFamily: "PressStart2P",
                  fontSize: 6,
                  color: "#4B0082",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                {c.points}
              </Text>
            ) : null}
            <Text
              style={{
                fontFamily: "PressStart2P",
                fontSize: 6,
                color: "#555",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {c.description}
            </Text>

            <LinearGradient
              colors={["#ff66cc", "#ff9933"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 6,
                padding: 2,
                shadowColor: "#cc33ff",
                shadowOpacity: 1,
                shadowRadius: 6,
                shadowOffset: { width: 3, height: 3 },
              }}
            >
              <Pressable
                style={{
                  backgroundColor: "#FFA726",
                  borderRadius: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 20,
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
                  {c.button}
                </Text>
              </Pressable>
            </LinearGradient>
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
          onPress={() => router.push("/")}
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
