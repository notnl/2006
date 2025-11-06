import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useState, useEffect } from 'react'; 

export interface ScoreboardItem {
  id: number;
  town_name: string;
  green_score: number;
  gas: number;
  water?: number;
  electricity?: number;
  recycle?: number;
}

export interface UserProfile {
  id: string;
  green_score: number;
}

class ScoreboardModel {
  private scoreData: ScoreboardItem[] = [];
  private greenScore: number = 0;
  private loading: boolean = true;
  private channel: RealtimeChannel | null = null;

  // Observers
  private scoreboardObservers: Array<(data: ScoreboardItem[]) => void> = [];
  private profileObservers: Array<(score: number) => void> = [];
  private loadingObservers: Array<(loading: boolean) => void> = [];

  // Subscribe to scoreboard updates
  subscribeToScoreboard(callback: (data: ScoreboardItem[]) => void) {
    this.scoreboardObservers.push(callback);
    // Immediately send current data to new subscriber
    callback(this.scoreData);
    return () => {
      this.scoreboardObservers = this.scoreboardObservers.filter(obs => obs !== callback);
    };
  }

  subscribeToProfile(callback: (score: number) => void) {
    this.profileObservers.push(callback);
    callback(this.greenScore);
    return () => {
      this.profileObservers = this.profileObservers.filter(obs => obs !== callback);
    };
  }

  subscribeToLoading(callback: (loading: boolean) => void) {
    this.loadingObservers.push(callback);
    callback(this.loading);
    return () => {
      this.loadingObservers = this.loadingObservers.filter(obs => obs !== callback);
    };
  }

  private notifyScoreboardObservers() {
    this.scoreboardObservers.forEach(callback => callback([...this.scoreData]));
  }

  private notifyProfileObservers() {
    this.profileObservers.forEach(callback => callback(this.greenScore));
  }

  private notifyLoadingObservers() {
    this.loadingObservers.forEach(callback => callback(this.loading));
  }

  // Data operations
  async loadScoreboard(): Promise<void> {
    this.setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scoreboard')
        .select('*')
        .limit(100);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      const filtered_data = (data || []).filter(item => 
        item != null && item.gas != null && item.electricity != null
      );

      // Calculate Green score
      filtered_data.forEach(currentData => {
        const electricity = currentData.electricity ?? 0;
        const gas = currentData.gas ?? 0;
        // Copied from load_to_db.py
        const elec_score = 100 / (1 + (electricity / 410))**1.3;
        const gas_score = 100 / (1 + (gas / 70))**1.0;
        currentData.green_score = Number(((elec_score + gas_score) / 2).toFixed(1));
      });

      filtered_data.sort((a, b) => b.green_score - a.green_score);
      this.scoreData = filtered_data as ScoreboardItem[];
      this.notifyScoreboardObservers();
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    } finally {
      this.setLoading(false);
    }
  }

  async loadProfile(): Promise<void> {
    try {
      const userProfile = await this.fetchUserProfile();
      if (userProfile != null) {
        this.greenScore = userProfile.green_score;
        this.notifyProfileObservers();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    this.notifyLoadingObservers();
  }

  // Real-time updates
  private handleScoreboardInsert = (payload: any) => {
    if (!payload.payload?.record) return;
    const newRecord = payload.payload.record as ScoreboardItem;
    
    const filteredPrev = this.scoreData.filter(item => 
      item != null && item.gas != null && item.electricity != null
    );

    const newData = [newRecord, ...filteredPrev];
    this.scoreData = newData.sort((a, b) => b.green_score - a.green_score);
    this.notifyScoreboardObservers();
  }

  private handleScoreboardUpdate = (payload: any) => {
    if (!payload.payload?.record) return;
    const updatedRecord = payload.payload.record as ScoreboardItem;
    
    const filteredPrev = this.scoreData.filter(item => 
      item != null && item.gas != null && item.electricity != null
    );

    const updatedData = filteredPrev.map(item => 
      item.id === updatedRecord.id ? updatedRecord : item
    );

    // Recalculate green scores for updated data
    updatedData.forEach(currentData => {
      const electricity = currentData.electricity ?? 0;
      const gas = currentData.gas ?? 0;
      const elec_score = 100 / (1 + (electricity / 410))**1.3;
      const gas_score = 100 / (1 + (gas / 70))**1.0;
      currentData.green_score = Number(((elec_score + gas_score) / 2).toFixed(1));
    });

    this.scoreData = updatedData
      .sort((a, b) => b.green_score - a.green_score)
      .filter(item => item != null);
    
    this.notifyScoreboardObservers();
  }

  private handleScoreboardDelete = (payload: any) => {
    if (!payload.payload?.old_record) return;
    const deletedRecord = payload.payload.old_record as ScoreboardItem;
    
    this.scoreData = this.scoreData.filter(item => 
      item && item.id !== deletedRecord.id
    );
    this.notifyScoreboardObservers();
  }

  async subscribeToRealtimeUpdates() {
    if (this.channel) {
      return; // Already subscribed
    }

    this.channel = supabase.channel('scoreboard', {
      config: { broadcast: { self: false }, private: true }
    });

    this.channel.on('broadcast', { event: 'INSERT' }, this.handleScoreboardInsert);
    this.channel.on('broadcast', { event: 'UPDATE' }, this.handleScoreboardUpdate);
    this.channel.on('broadcast', { event: 'DELETE' }, this.handleScoreboardDelete);

    await this.channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to scoreboard channel');
      }
    });
  }

  private async fetchUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('userprofile')
        .select('green_score')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Cleanup
  destroy() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  // Getters for current state
  getCurrentScoreboard(): ScoreboardItem[] {
    return [...this.scoreData];
  }

  getCurrentGreenScore(): number {
    return this.greenScore;
  }

  isLoading(): boolean {
    return this.loading;
  }
}

// Singleton instance
let scoreboardModelInstance: ScoreboardModel | null = null;

export function getScoreboardModel(): ScoreboardModel {
  if (!scoreboardModelInstance) {
    scoreboardModelInstance = new ScoreboardModel();
  }
  return scoreboardModelInstance;
}

// React Hook for using the model
export function useScoreboardModel() {
  const [model] = useState(() => getScoreboardModel()); // Singleton pattern, only 1 is created and every sub call is from this model
  const [scoreData, setScoreData] = useState<ScoreboardItem[]>([]);
  const [greenScore, setGreenScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeScoreboard = model.subscribeToScoreboard(setScoreData);
    const unsubscribeProfile = model.subscribeToProfile(setGreenScore);
    const unsubscribeLoading = model.subscribeToLoading(setLoading);

    // Initial data load
    model.loadScoreboard();
    model.loadProfile();
    model.subscribeToRealtimeUpdates();

    return () => { // When we exit , we need to unsubscribe
      unsubscribeScoreboard();
      unsubscribeProfile();
      unsubscribeLoading();
    };
  }, [model]);

  return {
    scoreData,
    greenScore,
    loading,
    refreshScoreboard: () => model.loadScoreboard(),
    refreshProfile: () => model.loadProfile(),
  };
}
