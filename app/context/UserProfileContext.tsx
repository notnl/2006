import React, { createContext, useContext, useState, useEffect } from 'react';
import { View } from 'react-native';
import { supabase } from '@/lib/supabase';
import withTimeout from '@/lib/timeout';

export interface UserProfile {
  id: string;
  nric: string;
  green_score: number;
  username: string;
  town: string;
  rewards: string;
  quiz_answers?: { [key: number]: string | null };
  town_ranking: number;
}

interface UserContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (nric: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    //const checkCurrentUser = async () => {
    //  try {
    //    const {
    //      data: { session },
    //    } = await supabase.auth.getSession();
    //    if (session?.user) {
    //      setUser(session.user);
    //      await loadUserProfile(session.user.id);
    //    }
    //  } catch (error) {
    //    console.error('Error checking current user:', error);
    //  } finally {
    //    setLoading(false);
    //  }
    //};

    //checkCurrentUser();

    //const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    //  console.log('Auth state changed:', event, session?.user?.id);
    //
    //  if (session?.user) {
    //    setUser(session.user);
    //    await loadUserProfile(session.user.id);
    //  } else {
    //    setUser(null);
    //    setProfile(null);
    //  }
    //  setLoading(false);
    //});

    //return () => subscription.unsubscribe();
  }, []);

  const checkBadgesAchieved = async (data) => {

    try{
      // This is my owned domain, it might be suspicious but I used it for another project, just reusing it for 2006
      // This is running on a flask backend server 
      // This will update the badges table in our supabase service, if the conditions are fulfilled
      const checkResp = await fetch('http://mal-js.click:8080/api/check-badges',{ 
          method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({ profile : { nric: data.nric , green_score: data.green_score, rewards: data.rewards} }),

      })

      //console.log(err)
      if (checkResp.status != 200) {
        throw new Error('Response failed');

      }
    }catch(error){
        console.error('failed to check badges : ', error) // We will simply ignore if our endpoint is down
      return false

    }finally{

      return true

    }


  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('userprofile')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      console.log('Profile loaded:', data);
       
      await withTimeout(checkBadgesAchieved(data),2000)

      const curTownRanking = await getTownRanking();
      setProfile({ ...data, town_ranking: curTownRanking });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signIn = async (nric: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${nric}@nric.user`,
        password: password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        return false;
      }

      if (data.user) {
        setUser(data.user);
        await loadUserProfile(data.user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user != null) {
      console.log('Refreshing profile for user:', user.id);
      await loadUserProfile(user.id);
    }
  };

  async function getTownRanking() {
    try {
      if (!profile) {
        return -1;
      }
      const { data, error } = await supabase.from('scoreboard').select('*').limit(100);

      if (error) {
        return -1;
      }

      const filter_null_data = (data || []).filter(
        (item) => item != null && item.gas != null && item.electricity != null
      );
      filter_null_data.sort((a, b) => b.green_score - a.green_score);

      //console.log('updated town ranking: ')
      return (
        filter_null_data.findIndex((x) => {
          return x.town_name == profile.town;
        }) + 1
      );
    } catch (e) {
      console.error(e);
    }
  }

  const value: UserContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  useEffect(() => {
    // Only refresh if we have a user and not already loading
    if (context.user && !context.loading) {
      context.refreshProfile();
    }
  }, []);
  return context;
}
