import { useRouter } from 'expo-router';
import { Input } from '@/views/ui/input';
import { Text } from '@/views/ui/text';

import { form_style } from '@/app/styles/form_style';

import {
  Pressable,
  type TextInput,
  View,
  Alert,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useState, useRef } from 'react';
import { TOWNS } from '@/lib/town.ts';

import { register_form_style } from '@/app/styles/form_style';

import withTimeout from '@/lib/timeout';

export default function SignUpForm() {
  const router = useRouter();

  const [nric, setNric] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTownDropdown, setShowTownDropdown] = useState(false);

  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  function onNRICSubmitEditing() {
    usernameInputRef.current?.focus();
  }

  function onUsernameSubmitEditing() {
    setShowTownDropdown(true);
  }

  function onTownSelect() {
    passwordInputRef.current?.focus();
  }

  function selectTown(town: string) {
    setSelectedTown(town);
    setShowTownDropdown(false);
    onTownSelect();
  }

  async function onSubmit() {
    try {
      await withTimeout(signUpWithNric(), 15000);
    } catch (error) {
      console.error('Error with signing up:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithNric() {
    console.log('Signing up ');
    if (!nric || !username || !password || !selectedTown) {
      Alert.alert('Error', 'Please enter NRIC, username, password and select a town');
      return;
    }

    const nricRegex = /^[STFGstfg]\d{7}[A-Za-z]$/;
    if (!nricRegex.test(nric)) {
      Alert.alert('Error', 'Please enter a valid NRIC format (e.g., S1234567A)');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const email = `${nric.toLowerCase()}@nric.user`;

      console.log('Signing up supabase ');
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nric: nric.toUpperCase(),
            username: username,
            user_type: 'resident',
            town: selectedTown,
          },
        },
      });

      if (error) {
        Alert.alert('Registration Failed', error.message);
        throw error;
      }

      console.log('This is the data user : ', data.user);
      if (data.user) {
        await createUserProfile(data.user.id, nric.toUpperCase(), username, selectedTown);

        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully! Please sign in with your account.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/');
              },
            },
          ]
        );
      } else {
        throw new Error('User is null');
      }
    } catch (error) {
      Alert.alert('Registration Error', error.message);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createUserProfile(userId: string, nric: string, username: string, town: string) {
    try {
      const { error } = await supabase.from('userprofile').insert([
        {
          id: userId,
          nric: nric,
          username: username,
          email: `${nric.toLowerCase()}@nric.user`,
          town: town,
          water_consumption: 0.0,
          electricity_usage: 0.0,
          recycling_rate: 0.0,
          green_score: 0, //Give user 0 green score at the start
          resident_contribution: 0.0,
          ranking: 0,
          rewards: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      } else {
        console.log('Profile created successfully for user:', userId);
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  }

  const renderTownItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={register_form_style.townItem} onPress={() => selectTown(item)}>
      <Text style={register_form_style.townText}>{item}</Text>
    </TouchableOpacity>
  );

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
            placeholder="S1234567A"
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

        {/* Username Input */}
        <View style={form_style.inputContainer}>
          <Text style={form_style.label}>Username</Text>
          <Input
            ref={usernameInputRef}
            placeholder="Choose a username"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            onSubmitEditing={onUsernameSubmitEditing}
            returnKeyType="next"
            editable={!loading}
            style={form_style.input}
          />
        </View>

        {/* Town Selection */}
        <View style={form_style.inputContainer}>
          <Text style={form_style.label}>Town</Text>
          <TouchableOpacity
            style={[form_style.input, register_form_style.townSelector]}
            onPress={() => setShowTownDropdown(true)}
            disabled={loading}>
            <Text
              style={
                selectedTown
                  ? register_form_style.townSelectedText
                  : register_form_style.townPlaceholderText
              }>
              {selectedTown || 'Select your town'}
            </Text>
          </TouchableOpacity>
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
            returnKeyType="done"
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
          style={[
            form_style.continueButton,
            loading && register_form_style.continueButtonDisabled,
          ]}>
          <Text style={form_style.continueButtonText}>
            {loading ? 'Registering...' : 'Sign up'}
          </Text>
        </Pressable>
      </View>

      {/* Town Dropdown Modal */}
      <Modal
        visible={showTownDropdown}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTownDropdown(false)}>
        <View style={register_form_style.modalOverlay}>
          <View style={register_form_style.modalContent}>
            <Text style={register_form_style.modalTitle}>Select Your Town</Text>
            <FlatList
              data={TOWNS}
              renderItem={renderTownItem}
              keyExtractor={(item) => item}
              style={register_form_style.townList}
              showsVerticalScrollIndicator={true}
            />
            <TouchableOpacity
              style={register_form_style.closeButton}
              onPress={() => setShowTownDropdown(false)}>
              <Text style={register_form_style.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Back to Home Button */}
      <Pressable onPress={() => router.back()} style={form_style.backButton}>
        <Text style={form_style.backButtonText}>BACK TO LOGIN</Text>
      </Pressable>
    </View>
  );
}
