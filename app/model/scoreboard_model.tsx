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

export function useScoreboardModel() {
  const [scoreData, setScoreData] = useState<ScoreboardItem[]>([]);
  const [greenScore, setGreenScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Load scoreboard data
  const loadScoreboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('scoreboard').select('*').limit(100);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      const filtered_data = (data || []).filter(
        (item) => item != null && item.gas != null && item.electricity != null
      );

      // Calculate Green score
      filtered_data.forEach((currentData) => {
        const electricity = currentData.electricity ?? 0;
        const gas = currentData.gas ?? 0;
        const elec_score = 100 / (1 + electricity / 410) ** 1.3;
        const gas_score = 100 / (1 + gas / 70) ** 1.0;
        currentData.green_score = Number(((elec_score + gas_score) / 2).toFixed(1));
      });

      filtered_data.sort((a, b) => b.green_score - a.green_score);
      setScoreData(filtered_data as ScoreboardItem[]);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time update handlers
  const handleScoreboardInsert = (payload: any) => {
    if (!payload.payload?.record) return;
    const newRecord = payload.payload.record as ScoreboardItem;

    setScoreData((prev) => {
      const filteredPrev = prev.filter(
        (item) => item != null && item.gas != null && item.electricity != null
      );

      const newData = [newRecord, ...filteredPrev];
      return newData.sort((a, b) => b.green_score - a.green_score);
    });
  };

  const handleScoreboardUpdate = (payload: any) => {
    if (!payload.payload?.record) return;
    const updatedRecord = payload.payload.record as ScoreboardItem;

    setScoreData((prev) => {
      const filteredPrev = prev.filter(
        (item) => item != null && item.gas != null && item.electricity != null
      );

      const updatedData = filteredPrev.map((item) =>
        item.id === updatedRecord.id ? updatedRecord : item
      );

      // Recalculate green scores for updated data
      updatedData.forEach((currentData) => {
        const electricity = currentData.electricity ?? 0;
        const gas = currentData.gas ?? 0;
        const elec_score = 100 / (1 + electricity / 410) ** 1.3;
        const gas_score = 100 / (1 + gas / 70) ** 1.0;
        currentData.green_score = Number(((elec_score + gas_score) / 2).toFixed(1));
      });

      return updatedData
        .sort((a, b) => b.green_score - a.green_score)
        .filter((item) => item != null);
    });
  };

  const handleScoreboardDelete = (payload: any) => {
    if (!payload.payload?.old_record) return;
    const deletedRecord = payload.payload.old_record as ScoreboardItem;

    setScoreData((prev) => prev.filter((item) => item && item.id !== deletedRecord.id));
  };

  // Subscribe to real-time updates
  const subscribeToRealtimeUpdates = async () => {
    if (channel) return; // Already subscribed

    const newChannel = supabase.channel('scoreboard', {
      config: { broadcast: { self: false }, private: true },
    });

    newChannel.on('broadcast', { event: 'INSERT' }, handleScoreboardInsert);
    newChannel.on('broadcast', { event: 'UPDATE' }, handleScoreboardUpdate);
    newChannel.on('broadcast', { event: 'DELETE' }, handleScoreboardDelete);

    await newChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to scoreboard channel');
      }
    });

    setChannel(newChannel);
  };

  // Initial data load
  useEffect(() => {
    loadScoreboard();
    subscribeToRealtimeUpdates();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return {
    scoreData,
    greenScore,
    loading,
    refreshScoreboard: loadScoreboard,
  };
}
