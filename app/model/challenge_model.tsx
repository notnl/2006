import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import withTimeout from '@/lib/timeout.ts'; // Timeout utility function from Stack Overflow

/**
 * Interface representing a quiz challenge question
 */
export interface ChallengeQuestion {
  id: number;
  question_desc: string;
  optionA: string;
  optionB: string;
  optionC: string;
  answer: string; // The correct answer text
  points: number; // Points awarded for correct answer
}

/**
 * Custom hook for managing challenge questions and user quiz progress
 * Handles question loading, answer submission, score tracking, and weekly countdown timer
 * 
 * @returns Object containing questions, answers, scores, timer, and handler functions
 */
export function useChallenges() {
  // State for questions and user answers
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | null }>({});
  
  // State for user data and scores
  const [user, setUser] = useState<any>(null);
  const [greenScore, setGreenScore] = useState(0);
  
  // State for UI
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);

  /**
   * Timer effect - Calculates time remaining until next Sunday at 11:59 PM
   * Updates every hour to show countdown for weekly challenge reset
   */
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const nextSunday = new Date();

      // Calculate days until next Sunday (0-6)
      const day = now.getDay();
      const daysUntilSunday = (7 - day) % 7;
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(23, 59, 0, 0); // Set to 11:59 PM

      // If next Sunday has already passed, add 7 more days
      if (nextSunday.getTime() < now.getTime()) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }

      // Calculate difference in milliseconds and convert to days/hours
      const diffMs = nextSunday.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

      // Format countdown string with proper pluralization
      setTimeLeft(
        `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''} left`
      );
    }

    updateCountdown(); // Run immediately
    const interval = setInterval(updateCountdown, 60 * 60 * 1000); // Update every hour
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  /**
   * Load questions and user profile on component mount
   * Uses try-finally to ensure loading state is always reset
   */
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Run both operations with timeout protection
        await loadQuestions();
        await loadUserProfile();
      } catch (error) {
        console.error('Error initializing challenges:', error);
        // Don't show alert here as individual functions handle their own errors
      } finally {
        setLoading(false); // GUARANTEED to run
      }
    };

    initializeData();
  }, []);

  /**
   * Loads challenge questions from the database
   * Limits to 5 questions and includes 5-second timeout protection
   */
  const loadQuestions = async () => {
    try {
      const { data, error } = await withTimeout(
        supabase.from('challenges').select('*').limit(5),
        5000 // 5 second timeout
      );

      if (error) {
        console.error('Error loading questions:', error);
        return;
      }

      if (data) {
        setQuestions(data as ChallengeQuestion[]);
      }
    } catch (error) {
      console.error('Error in loadQuestions:', error);
      // Show user-friendly message if request timed out
      if (error.message.includes('timed out')) {
        Alert.alert('Timeout', 'Failed to load questions. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads user authentication data and profile information
   * Retrieves green score and previously answered questions
   */
  const loadUserProfile = async () => {
    try {
      // Get authenticated user with timeout
      const {
        data: { user },
        error: authError,
      } = await withTimeout(
        supabase.auth.getUser(),
        5000 // 5 second timeout
      );

      if (authError || !user) {
        console.error('Auth error or no user:', authError);
        throw new Error('No user on the session!');
      }

      setUser(user);

      // Fetch user profile data (green score and quiz answers)
      const { data: profile, error: profileError } = await withTimeout(
        supabase.from('userprofile').select('green_score, quiz_answers').eq('id', user.id).single(),
        5000 // 5 second timeout
      );

      if (profileError) {
        console.error('Error loading profile:', profileError);
        throw new Error('Profile not loaded');
      }

      // Update state with profile data
      if (profile?.green_score != null) {
        setGreenScore(profile.green_score);
      }

      // Restore previously selected answers
      if (profile?.quiz_answers) {
        setSelectedAnswers(profile.quiz_answers);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      if (error.message.includes('timed out')) {
        Alert.alert('Timeout', 'Failed to load user profile. Please check your connection.');
      }
      // Don't throw - let the function complete
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user answer submission for a challenge question
   * Updates local state, calculates score, and saves to database
   * 
   * @param qid - Question ID
   * @param option - Selected answer text
   * @param correctAnswer - The correct answer text
   * @param points - Points to award if correct
   */
  const handleAnswer = async (
    qid: number,
    option: string,
    correctAnswer: string,
    points: number
  ) => {
    // Prevent answering the same question twice
    if (selectedAnswers[qid]) return;

    // Find the question object
    const question = questions.find((q) => q.id === qid);
    if (!question) return;

    // Convert selected option text to letter (A, B, or C)
    const optionLetter =
      option === question.optionA
        ? 'A'
        : option === question.optionB
          ? 'B'
          : option === question.optionC
            ? 'C'
            : '';

    // Check if answer is correct
    const isCorrect = option === correctAnswer;
    
    // Update selected answers state
    const newSelected = { ...selectedAnswers, [qid]: optionLetter };
    setSelectedAnswers(newSelected);

    // Award points if correct
    if (isCorrect) {
      const newScore = greenScore + (points || 1);
      setGreenScore(newScore);
    }

    // Save answer to database if user is authenticated
    if (user) {
      try {
        // Prepare update data
        const updateData: any = { quiz_answers: newSelected };
        if (isCorrect) {
          updateData.green_score = greenScore + (points || 1);
        }

        // Update user profile with timeout protection
        await withTimeout(
          supabase.from('userprofile').update(updateData).eq('id', user.id),
          5000 // 5 second timeout for update
        );
      } catch (error) {
        console.error('Error saving answer:', error);
        // Show appropriate error message
        if (error.message.includes('timed out')) {
          Alert.alert('Timeout', 'Failed to save your answer. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to save your answer.');
        }
      }
    }
  };

  return {
    questions,
    selectedAnswers,
    greenScore,
    timeLeft,
    loading,
    handleAnswer,
    // Refresh functions for manual data reload
    refreshQuestions: async () => {
      setLoading(true);
      await loadQuestions();
      setLoading(false);
    },
    refreshProfile: async () => {
      setLoading(true);
      await loadUserProfile();
      setLoading(false);
    },
  };
}
