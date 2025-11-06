import {  View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Text } from '@/views/ui/text';
import RewardsComponent  from '@/views/ui/RewardsComponent';

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
