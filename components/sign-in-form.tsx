import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Pressable, type TextInput, View, Alert } from 'react-native';
import { supabase } from '../lib/supabase'
import { useState, useRef } from 'react'

export default function SignInForm() {

  const router = useRouter();

  const [nric, setNric] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordInputRef = useRef<TextInput>(null);

  function onNRICSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    await signInWithNric();
  }

  async function signInWithNric() {
    if (!nric || !password) {
      Alert.alert('Error', 'Please enter both NRIC and password');
      return;
    }

  // Validate NRIC format (basic Singapore NRIC validation)
      const nricRegex = /^[STFGstfg]\d{7}[A-Za-z]$/;
      if (!nricRegex.test(nric)) {
        Alert.alert('Error', 'Please enter a valid NRIC format (e.g., S1234567A)');
        return;
      }

    setLoading(true);


    
    try {
      // Option 1: If you're using NRIC as username in a custom auth system
      const { error } = await supabase.auth.signInWithPassword({
        email: `${nric}@nric.user`, // Temporary mapping - you'll need to adjust this
        password: password,
      });

      if (error) {
        Alert.alert('Sign In Failed', error.message);
      } else {
        Alert.alert('Success', 'Signed in successfully!');
        // Navigation would happen automatically via auth state change
        //
        router.replace('/menu');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    // Navigate to sign up screen or show sign up modal
    //Alert.alert('Sign Up', 'Please contact administrator for account creation');

    router.push('/login/register');
    
  }

  async function handleForgotPassword() {
    Alert.alert('Password Reset', 'Please contact administrator to reset your password');
  }

  // Enhanced version with NRIC lookup in profiles table
  async function signInWithNricEnhanced() {
    if (!nric || !password) {
      Alert.alert('Error', 'Please enter both NRIC and password');
      return;
    }

    setLoading(true);
    
    try {
      // First, look up the user's email by NRIC in your profiles table
      const { data: profile, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('nric', nric.toUpperCase()) // Ensure case consistency
        .single();

      if (lookupError || !profile) {
        Alert.alert('Error', 'Invalid NRIC or user not found');
        setLoading(false);
        return;
      }

      // Sign in with the found email
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: password,
      });

      if (error) {
        Alert.alert('Sign In Failed', error.message);
      }
      // Success - auth state change will handle navigation
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Sign in to Green Quest</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="nric">NRIC</Label>
              <Input
                id="nric"
                placeholder="S12345678I"
                autoCapitalize="none"
                autoCorrect={false}
                value={nric}
                onChangeText={setNric}
                onSubmitEditing={onNRICSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
                editable={!loading}
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                  onPress={handleForgotPassword}
                  disabled={loading}>
                  <Text className="font-normal leading-4">Forgot your password?</Text>
                </Button>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                editable={!loading}
                placeholder="Enter your password"
              />
            </View>
            <Button 
              className="w-full" 
              onPress={onSubmit}
              disabled={loading}
            >
              <Text>{loading ? 'Signing in...' : 'Continue'}</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Don&apos;t have an account?
          </Text>


            <Button 
              className="w-full" 
      variant="link"
      onPress={handleSignUp}
      disabled={loading}
            >
              <Text>Sign up</Text>
            </Button>
        </CardContent>
      </Card>
    </View>
  );
}
