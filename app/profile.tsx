import {  View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import ProfileComponent  from '@/components/ui/ProfileComponent';

const SCREEN_OPTIONS = {
  title: 'Menu',
  headerTransparent: true,
};

export default function MapScreen(){

    return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
        <ProfileComponent/>
        </>
    )
}
