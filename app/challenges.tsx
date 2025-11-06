import {  View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Text } from '@/views/ui/text';
import ChallengesComponent from '@/views/ui/ChallengesComponent';

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
