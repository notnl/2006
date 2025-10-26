/*import { SocialConnections } from '@/components/social-connections';
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
*/
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Pressable, type TextInput, View, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useState, useRef } from 'react';

export default function SignInForm() {
  const router = useRouter();

  const [nric, setNric] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

    const nricRegex = /^[STFGstfg]\d{7}[A-Za-z]$/;
    if (!nricRegex.test(nric)) {
      Alert.alert('Error', 'Please enter a valid NRIC format (e.g., S1234567A)');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${nric}@nric.user`,
        password: password,
      });

      if (error) {
        Alert.alert('Sign In Failed', error.message);
      } else {
        Alert.alert('Success', 'Signed in successfully!');
        router.replace('/menu');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    router.push('/login/register');
  }

  async function handleForgotPassword() {
    Alert.alert('Password Reset', 'Please contact administrator to reset your password');
  }

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>Sign in to Green Quest</Text>
        <Text style={styles.subtitle}>Welcome back! Please sign in to continue</Text>

        {/* NRIC Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NRIC</Text>
          <Input
            placeholder="S12345678I"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            value={nric}
            onChangeText={setNric}
            onSubmitEditing={onNRICSubmitEditing}
            returnKeyType="next"
            editable={!loading}
            style={styles.input}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Password</Text>
            <Pressable onPress={handleForgotPassword} disabled={loading}>
              <Text style={styles.forgotPassword}>Forgot your password?</Text>
            </Pressable>
          </View>
          <Input
            ref={passwordInputRef}
            secureTextEntry
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            returnKeyType="send"
            onSubmitEditing={onSubmit}
            editable={!loading}
            placeholder="Enter your password"
            style={styles.input}
          />
        </View>

        {/* Continue Button */}
        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={[styles.continueButton, loading && styles.continueButtonDisabled]}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Signing in...' : 'Continue'}
          </Text>
        </Pressable>

        {/* Sign Up Section */}
        <Text style={styles.signupPrompt}>Don't have an account?</Text>
        <Pressable onPress={handleSignUp} disabled={loading}>
          <Text style={styles.signupLink}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: '#00FFAA',
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderColor: '#00FFAA',
    borderWidth: 2,
    borderRadius: 8,
    color: 'white',
    fontFamily: 'PressStart2P',
    fontSize: 10,
    padding: 12,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: '#00FFAA',
  },
  continueButton: {
  backgroundColor: '#FFA726',
  borderColor: '#C35C00',
  borderWidth: 3,
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: 'center',
  marginTop: 8,
  shadowColor: '#6A1B9A',
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
},
continueButtonDisabled: {
  backgroundColor: '#CC8855',
  opacity: 0.6,
},
continueButtonText: {
  fontFamily: 'PressStart2P',
  fontSize: 12,
  color: '#3B0A00',
  textAlign: 'center',
},
  signupPrompt: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  signupLink: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#00FFAA',
    textAlign: 'center',
  },
});