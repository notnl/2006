import { useRouter } from 'expo-router';
import { Input } from '@/views/ui/input';
import { Text } from '@/views/ui/text';

import { form_style } from '@/app/styles/form_style';

import { Pressable, type TextInput, View, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useState, useRef } from 'react';

export default function SignUpForm() {
  const router = useRouter();

  const [nric, setNric] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  function onNRICSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    await signUpWithNric();
  }

  async function signUpWithNric() {
    if (!nric || !password) {
      Alert.alert('Error', 'Please enter both NRIC and password');
      return;
    }

    const nricRegex = /^[STFGstfg]\d{7}[A-Za-z]$/;
    if (!nricRegex.test(nric)) {
      Alert.alert('Error', 'Please enter a valid NRIC format (e.g., S1234567A)');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const email = `${nric.toLowerCase()}@nric.user`;

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nric: nric.toUpperCase(),
            user_type: 'resident',
          },
        },
      });

      if (error) {
        Alert.alert('Registration Failed', error.message);
      } else if (data.user) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully! Please sign in with your account.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.navigate('/login/login');
              },
            },
          ]
        );

        await createUserProfile(data.user.id, nric.toUpperCase());
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during registration');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createUserProfile(userId: string, nric: string) {
    try {
      const { error } = await supabase.from('userprofile').insert([
        {
          id: userId,
          nric: nric,
          email: `${nric}@nric.user`,
          water_consumption: 0.0,
          electricity_usage: 0.0,
          recycling_rate: 0.0,
          green_score: 0.0,
          resident_contribution: 0.0,
          ranking: 0,
          badges: '[]',
          rewards: '[]',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        console.log('Profile created successfully for user:', userId);
      }
    } catch (error) {
      console.error('Profile creation error:', error);
    }
  }

  return (
    <View style={form_style.container}>
      {/* Main Card */}
      <View style={form_style.card}>
        {/* Title */}
        <Text style={form_style.title}>Register an account for Green Quest</Text>

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
          <Text style={form_style.label}>Password</Text>
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
          style={[form_style.continueButton, loading && styles.continueButtonDisabled]}
        >
          <Text style={form_style.continueButtonText}>
            {loading ? 'Registering...' : 'Continue'}
          </Text>
        </Pressable>
      </View>

      {/* Back to Home Button */}
      <Pressable
        onPress={() => router.back()}
        style={form_style.backButton}
      >
        <Text style={form_style.backButtonText}>BACK TO HOME</Text>
      </Pressable>
    </View>
  );
}
