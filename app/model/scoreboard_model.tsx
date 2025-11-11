import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

/**
 * Interface representing a single scoreboard entry
 * Each entry tracks environmental metrics for a town, it also resembles our scoreboard schema on supabase
 */
export interface ScoreboardItem {
  id: number;
  town_name: string;
  green_score: number; // Calculated score based on resource usage
  gas: number;
  electricity?: number;
  recycle?: number;
}

/**
 * Custom hook for managing scoreboard data with real-time updates, this fits the model of the MVC architecture
 * Fetches town environmental data, calculates green scores, and subscribes to live changes
 * 
 * @returns Object containing scoreboard data, loading state, and refresh function
 */
export function useScoreboardModel() {
  // State management for scoreboard data and UI
  const [scoreData, setScoreData] = useState<ScoreboardItem[]>([]);
  const [greenScore, setGreenScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  /**
   * Loads scoreboard data from Supabase and calculates green scores
   * Green score formula combines electricity and gas usage into a single metric
   * Lower resource usage = higher green score
   */
  const loadScoreboard = async () => {
    setLoading(true);
    try {
      // Fetch up to 100 scoreboard entries from database
      const { data, error } = await supabase.from('scoreboard').select('*').limit(100);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      // Filter out incomplete records (missing gas or electricity data)
      const filtered_data = (data || []).filter(
        (item) => item != null && item.gas != null && item.electricity != null
      );

      // Calculate Green score for each town
      // Formula uses exponential decay to penalize high resource usage
      filtered_data.forEach((currentData) => {
        const electricity = currentData.electricity ?? 0;
        const gas = currentData.gas ?? 0;
        
        // Electricity score: decreases as usage increases (baseline: 410 units)
        const elec_score = 100 / (1 + electricity / 410) ** 1.3;
        
        // Gas score: decreases as usage increases (baseline: 70 units)
        const gas_score = 100 / (1 + gas / 70) ** 1.0;
        
        // Average the two scores and round to 1 decimal place
        currentData.green_score = Number(((elec_score + gas_score) / 2).toFixed(1));
      });

      // Sort by green score in descending order (highest scores first)
      filtered_data.sort((a, b) => b.green_score - a.green_score);
      setScoreData(filtered_data as ScoreboardItem[]);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles real-time INSERT events from Supabase
   * Adds new scoreboard entries and re-sorts the list
   */
  const handleScoreboardInsert = (payload: any) => {
    if (!payload.payload?.record) return;
    const newRecord = payload.payload.record as ScoreboardItem;

    setScoreData((prev) => {
      // Filter out incomplete records
      const filteredPrev = prev.filter(
        (item) => item != null && item.gas != null && item.electricity != null
      );

      // Add new record to the beginning and re-sort
      const newData = [newRecord, ...filteredPrev];
      return newData.sort((a, b) => b.green_score - a.green_score);
    });
  };

  /**
   * Handles real-time UPDATE events from Supabase
   * Updates existing scoreboard entries and recalculates green scores
   */
  const handleScoreboardUpdate = (payload: any) => {
    if (!payload.payload?.record) return;
    const updatedRecord = payload.payload.record as ScoreboardItem;

    setScoreData((prev) => {
      // Filter out incomplete records
      const filteredPrev = prev.filter(
        (item) => item != null && item.gas != null && item.electricity != null
      );

      // Replace the updated record
      const updatedData = filteredPrev.map((item) =>
        item.id === updatedRecord.id ? updatedRecord : item
      );

      // Recalculate green scores for all entries after update
      updatedData.forEach((currentData) => {
        const electricity = currentData.electricity ?? 0;
        const gas = currentData.gas ?? 0;
        const elec_score = 100 / (1 + electricity / 410) ** 1.3;
        const gas_score = 100 / (1 + gas / 70) ** 1.0;
        currentData.green_score = Number(((elec_score + gas_score) / 2).toFixed(1));
      });

      // Re-sort and filter out any null entries
      return updatedData
        .sort((a, b) => b.green_score - a.green_score)
        .filter((item) => item != null);
    });
  };

  /**
   * Handles real-time DELETE events from Supabase
   * Removes deleted entries from the scoreboard
   */
  const handleScoreboardDelete = (payload: any) => {
    if (!payload.payload?.old_record) return;
    const deletedRecord = payload.payload.old_record as ScoreboardItem;

    // Filter out the deleted record
    setScoreData((prev) => prev.filter((item) => item && item.id !== deletedRecord.id));
  };

  /**
   * Subscribes to real-time updates from the Supabase scoreboard channel
   * Prevents duplicate subscriptions by checking if channel already exists
   */
  const subscribeToRealtimeUpdates = async () => {
    if (channel) return; // Already subscribed

    // Create a new broadcast channel for scoreboard updates
    const newChannel = supabase.channel('scoreboard', {
      config: { broadcast: { self: false }, private: true },
    });

    // Register event handlers for INSERT, UPDATE, and DELETE operations
    newChannel.on('broadcast', { event: 'INSERT' }, handleScoreboardInsert);
    newChannel.on('broadcast', { event: 'UPDATE' }, handleScoreboardUpdate);
    newChannel.on('broadcast', { event: 'DELETE' }, handleScoreboardDelete);

    // Subscribe to the channel
    await newChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to scoreboard channel');
      }
    });

    setChannel(newChannel);
  };

  /**
   * Initialize data and real-time subscriptions on component mount
   * Cleanup subscriptions on component unmount
   */
  useEffect(() => {
    loadScoreboard();
    subscribeToRealtimeUpdates();

    // Cleanup function: unsubscribe from channel when component unmounts
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

