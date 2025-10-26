import { Stack } from 'expo-router';
import { ImageBackground, StyleSheet } from 'react-native';
import { SignUpForm } from '@/components/sign-up-form';

const SCREEN_OPTIONS = {
  title: '',
  headerShown: false,
};

export default function Screen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ImageBackground
        source={require('../../assets/images/bg-city.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <SignUpForm />
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});