
import { supabase } from './supabase';


export const fetchUserProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          return null;
        }
        const userId = session?.user?.id;
        
        if (!userId) {
          return null;
        }

        const { data, error, status } = await supabase
          .from('userprofile')
          .select('*')
          .eq('id', userId)
          .single();

        if (error && status !== 406) throw error;

        return data
        
      } catch (err) {
        console.error('fetchProfile error', err);
        return err
      } finally {
         
      }
}
