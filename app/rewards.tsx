import {  View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import RewardsComponent  from '@/components/ui/RewardsComponent';

const SCREEN_OPTIONS = {
  title: 'Menu',
  headerTransparent: true,
};

export default function MapScreen(){

    return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
        <RewardsComponent/>
        </>
    )
}
