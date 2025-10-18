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
