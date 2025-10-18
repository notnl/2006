

import {  View,StyleSheet } from 'react-native';

import { Link, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import MapComponent from '@/components/ui/MapComponent';

const SCREEN_OPTIONS = {
  title: 'Menu',
  headerTransparent: true,
  headerTitle: 'Map'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
  },
});

export default function MapScreen(){


    return (
    <View style={styles.container}>
      <Stack.Screen
        options={SCREEN_OPTIONS
        }
      />
      <Text>Place map here thanks :)</Text>
    </View>
    )
}
