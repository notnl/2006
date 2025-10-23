import React from "react";
import { View, Text, ImageBackground, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";

import { supabase } from '../../lib/supabase';
import type { Href } from "expo-router";


import { useState,useEffect } from 'react';
import LoadingComponent from './LoadingComponent'

import  SignInForm  from '@/components/sign-in-form';
import {fetchUserProfile} from '../../lib/GetUser';

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [loading,setLoading] = useState(false);
  const [residency,setResidency] = useState('');
  const [greenScore,setGreenScore] = useState(-1);

    //const fetchProfile = async () => {
    //  try {
    //  const { data: { session } } = await supabase.auth.getSession();
    //  const userId = session?.user?.id;
    //  }
    //   catch (err) {
    //    console.error('fetchProfile error', err);
    //    Alert.alert('Error fetching profile', (err as Error).message);
    //  } finally {

    //  }
    //}

    //fetchProfile();
  //
  

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const userProfile =  await fetchUserProfile();
    if (userProfile != null) {
      setResidency(userProfile.town)
      setGreenScore(userProfile.green_score)
    
      setLoading(false);
    }else  {

    }
    
  };

//fetchProfile()

    
  const routes: { label: string; path: Href }[] = [

    { label: "MAP", path: "/map" },
    { label: "PROFILE", path: "/profile" },
    { label: "SCOREBOARD", path: "/scoreboard" },
    { label: "REWARDS", path: "/rewards" },
    { label: "CHALLENGES", path: "/challenges" },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("../../assets/images/bg-city.png")}
        resizeMode="cover"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
            width: "100%",
          }}
        >
          <Text
            style={{
              fontFamily: "PressStart2P",
              color: "#00FFAA",
              fontSize: 20,
              textShadowColor: "#FF0044",
              textShadowOffset: { width: 3, height: 3 },
              textShadowRadius: 1,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            GREEN{"\n"}QUEST
          </Text>

          <Text
            style={{
              fontFamily: "PressStart2P",
              color: "white",
              fontSize: 8,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Welcome,{"\n"} {residency} Resident!
          </Text>
          
          <Text
            style={{
              fontFamily: "PressStart2P",
              color: "white",
              fontSize: 8,
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            Your Green Score: {greenScore}
          </Text>

          {routes.map(({ label, path }) => (
            <Pressable
              key={label}
              onPress={() => router.push(path)}
              style={{
                backgroundColor: "#FFA726",
                borderColor: "#C35C00",
                borderWidth: 3,
                paddingVertical: 14,
                paddingHorizontal: 50,
                borderRadius: 6,
                marginBottom: 16,
                shadowColor: "#6A1B9A",
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }}
            >
              <Text
                style={{
                  fontFamily: "PressStart2P",
                  fontSize: 10,
                  color: "#3B0A00",
                  textAlign: "center",
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ImageBackground>
    </>
  );
}
