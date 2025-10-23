/*import '@/global.css';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useFonts } from "expo-font";

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return null;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const [loaded] = useFonts({
    PressStart2P: require('../assets/fonts/PressStart2P-Regular.ttf'), // ✅ changed this line
  });

  if (!loaded) return null;

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </ThemeProvider>
  );
} */
import '@/global.css';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P: require('../assets/fonts/PressStart2P-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <View><Text>Loading font...</Text></View>;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
