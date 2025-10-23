/*import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';

import MenuComponent from '@/components/ui/MenuComponent';

import  SignInForm  from '@/components/sign-in-form';
import Auth from '@/components/ui/Auth';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {

  const { colorScheme } = useColorScheme();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <SignInForm/>

      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
*/
import React from "react";
import { View, Text, ImageBackground, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import type { Href } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const routes: { label: string; path: Href }[] = [
    { label: "PROFILE", path: "/profile" },
    { label: "SCOREBOARD", path: "/scoreboard" },
    { label: "REWARDS", path: "/rewards" },
    { label: "CHALLENGES", path: "/challenges" },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("../assets/images/bg-city.png")}
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
            Welcome,{"\n"}Toa Payoh Resident!
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
            Your Green Score: 843
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
    /*
    <>
      <Stack.Screen options={{ headerShown: false }} />
      

      <ImageBackground
  source={require("@/assets/images/bg-city.png")}
  resizeMode="cover"   // ✅ move it here!
  style={{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "pink", 
  }}
>

        {/* translucent overlay for contrast */
        /*<View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
            width: "100%",
          }}
        >
          {/* title */
          /*<Text
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

          {/* welcome text */
          /*<Text
            style={{
              fontFamily: "PressStart2P",
              color: "white",
              fontSize: 8,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Welcome,{"\n"}Toa Payoh Resident!
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
            Your Green Score: 843
          </Text>

          {/* buttons */
          /*{routes.map(({ label, path }) => (
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
}*/