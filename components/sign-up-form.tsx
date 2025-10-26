/*import { Button } from '@/components/ui/button';
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

export function SignUpForm() {

  const router = useRouter();

  const [nric, setNric] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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

  // Validate NRIC format (basic Singapore NRIC validation)
  const nricRegex = /^[STFGstfg]\d{7}[A-Za-z]$/;
  if (!nricRegex.test(nric)) {
    Alert.alert('Error', 'Please enter a valid NRIC format (e.g., S1234567A)');
    return;
  }

  // Validate password strength
  if (password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters long');
    return;
  }

  setLoading(true);
  
  try {
    // Generate a unique email from NRIC for Supabase auth
    const email = `${nric.toLowerCase()}@nric.user`;
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          nric: nric.toUpperCase(), // Store NRIC in user metadata
          user_type: 'resident' // Optional: add custom user data
        }
      }
    });

    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else if (data.user) {
      // Successfully created user account
      Alert.alert(
        'Registration Successful', 
        'Your account has been created successfully! Please sign in with your account.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Optionally navigate to login or wait for email verification
              router.navigate('/login/login'); // Navigate to email verification screen
            }
          }
        ]
      );
      
      // You might want to create a profile record in your database
      await createUserProfile(data.user.id, nric.toUpperCase());
    }
  } catch (error) {
    Alert.alert('Error', 'An unexpected error occurred during registration');
    console.error('Registration error:', error);
  } finally {
    setLoading(false);
  }
}

// Extended helper function to create user profile with all fields
async function createUserProfile(userId: string, nric: string) {
  try {
    const { error } = await supabase
      .from('userprofile')
      .insert([
        {
          id: userId,
          nric: nric,
          email: `${nric}@nric.user`,
          // Environmental metrics
          water_consumption: 0.0,
          electricity_usage: 0.0,
          recycling_rate: 0.0,
          green_score: 0.0,
          resident_contribution: 0.0,
          ranking: 0,
          // Challenges and achievements
          badges: '[]', // Empty JSON array
          rewards: '[]', // Empty JSON array
          // Timestamps
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error creating profile:', error);
      // Handle specific errors
      if (error.code === '23505') { // Unique violation
        console.error('Profile already exists for user:', userId);
      }
    } else {
      console.log('Profile created successfully for user:', userId);
    }
  } catch (error) {
    console.error('Profile creation error:', error);
  }
}



  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Register an account for Green Quest</CardTitle>
          <CardDescription className="text-center sm:text-left">
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
              <Text>{loading ? 'Registering...' : 'Continue'}</Text>
            </Button>
          </View>
          <View className="flex-row items-center">
          </View>
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

export function SignUpForm() {
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
    <View style={styles.container}>
      {/* Main Card */}
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>Register an account for Green Quest</Text>

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
          <Text style={styles.label}>Password</Text>
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
            {loading ? 'Registering...' : 'Continue'}
          </Text>
        </Pressable>
      </View>

      {/* Back to Home Button */}
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>BACK TO HOME</Text>
      </Pressable>
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
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
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
  backButton: {
    backgroundColor: '#FFA726',
    borderColor: '#FF4081',
    borderWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 32,
  },
  backButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#3B0A00',
    textAlign: 'center',
  },
});