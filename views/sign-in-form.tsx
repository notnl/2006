import { useRouter } from 'expo-router';
import { Input } from '@/views/ui/input';
import { Text } from '@/views/ui/text';
import { form_style } from '@/app/styles/form_style';

import { Pressable, type TextInput, View, Alert} from 'react-native';
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
    <View style={form_style.container}>
      {/* Main Card */}
      <View style={form_style.card}>
        {/* Title */}
        <Text style={form_style.title}>Sign in to Green Quest</Text>
        <Text style={form_style.subtitle}>Welcome back! Please sign in to continue</Text>

        {/* NRIC Input */}
        <View style={form_style.inputContainer}>
          <Text style={form_style.label}>NRIC</Text>
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
            style={form_style.input}
          />
        </View>

        {/* Password Input */}
        <View style={form_style.inputContainer}>
          <View style={form_style.passwordHeader}>
            <Text style={form_style.label}>Password</Text>
            <Pressable onPress={handleForgotPassword} disabled={loading}>
              <Text style={form_style.forgotPassword}>Forgot your password?</Text>
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
            style={form_style.input}
          />
        </View>

        {/* Continue Button */}
        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={[form_style.continueButton, loading && form_style.continueButtonDisabled]}
        >
          <Text style={form_style.continueButtonText}>
            {loading ? 'Signing in...' : 'Continue'}
          </Text>
        </Pressable>

        {/* Sign Up Section */}
        <Text style={form_style.signupPrompt}>Don't have an account?</Text>
        <Pressable onPress={handleSignUp} disabled={loading}>
          <Text style={form_style.signupLink}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}

