
import { supabase } from '@/lib/supabase';

export interface SignInCredentials {
  nric: string;
  password: string;
}

export interface SignUpCredentials {
  nric: string;
  username: string;
  password: string;
  town: string;
}

async function signInModel(credentials: SignInCredentials) {
    console.log(credentials)
    return await supabase.auth.signInWithPassword({
      email: `${credentials.nric}@nric.user`,
      password: credentials.password,
    });
  }

async function signUpModel(signUpData: SignUpCredentials) {
    console.log("Async model")
    return await supabase.auth.signUp({
      email: `${signUpData.nric.toLowerCase()}@nric.user`,
      password: signUpData.password,
      options: {
        data: {
          nric: signUpData.nric.toUpperCase(),
          username: signUpData.username,
          user_type: 'resident',
          town: signUpData.town,
        },
      },
    });
  }


  // Create user profile
 async function createUserProfile(userId: string, nric: string, username: string, town: string) {
    return await supabase.from('userprofile').insert([
      {
        id: userId,
        nric: nric,
        username: username,
        email: `${nric.toLowerCase()}@nric.user`,
        town: town,
        water_consumption: 0.0,
        electricity_usage: 0.0,
        recycling_rate: 0.0,
        green_score: 0,
        resident_contribution: 0.0,
        ranking: 0,
        rewards: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }
export { signInModel, signUpModel,createUserProfile}
