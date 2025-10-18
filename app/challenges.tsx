import {  View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import ChallengesComponent from '@/components/ui/ChallengesComponent';

const SCREEN_OPTIONS = {
  title: 'Menu',
  headerTransparent: true,
};

export default function ChallengeScreen(){

    return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
        <ChallengesComponent/>
        </>
    )
}
