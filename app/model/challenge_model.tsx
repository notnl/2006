import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import withTimeout from '@/lib/timeout.ts'; //Timeout utility function from stack overflow

export interface ChallengeQuestion {
  id: number;
  question_desc: string;
  optionA: string;
  optionB: string;
  optionC: string;
  answer: string;
  points: number;
}

export function useChallenges() {
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | null }>({});
  const [user, setUser] = useState<any>(null);
  const [greenScore, setGreenScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Timer logic
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const nextSunday = new Date();

      const day = now.getDay();
      const daysUntilSunday = (7 - day) % 7;
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(23, 59, 0, 0);

      if (nextSunday.getTime() < now.getTime()) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }

      const diffMs = nextSunday.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

      setTimeLeft(
        `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''} left`
      );
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load questions and user profile
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

  const loadQuestions = async () => {
    try {
      const { data, error } = await withTimeout(
        supabase.from('challenges').select('*').limit(5),
        5000 // 10 second timeout
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
      if (error.message.includes('timed out')) {
        Alert.alert('Timeout', 'Failed to load questions. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await withTimeout(
        supabase.auth.getUser(),
        5000 // 10 second timeout
      );

      if (authError || !user) {
        console.error('Auth error or no user:', authError);
        throw new Error('No user on the session!');
      }

      setUser(user);

      const { data: profile, error: profileError } = await withTimeout(
        supabase.from('userprofile').select('green_score, quiz_answers').eq('id', user.id).single(),
        5000 // 10 second timeout
      );

      if (profileError) {
        console.error('Error loading profile:', profileError);

        throw new Error('Profile not loaded');
        return;
      }

      if (profile?.green_score != null) {
        setGreenScore(profile.green_score);
      }

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

  const handleAnswer = async (
    qid: number,
    option: string,
    correctAnswer: string,
    points: number
  ) => {
    if (selectedAnswers[qid]) return;

    const question = questions.find((q) => q.id === qid);
    if (!question) return;

    const optionLetter =
      option === question.optionA
        ? 'A'
        : option === question.optionB
          ? 'B'
          : option === question.optionC
            ? 'C'
            : '';

    const isCorrect = option === correctAnswer;
    const newSelected = { ...selectedAnswers, [qid]: optionLetter };
    setSelectedAnswers(newSelected);

    if (isCorrect) {
      const newScore = greenScore + (points || 1);
      setGreenScore(newScore);
    }

    if (user) {
      try {
        const updateData: any = { quiz_answers: newSelected };
        if (isCorrect) {
          updateData.green_score = greenScore + (points || 1);
        }

        await withTimeout(
          supabase.from('userprofile').update(updateData).eq('id', user.id),
          5000 // 10 second timeout for update
        );
      } catch (error) {
        console.error('Error saving answer:', error);
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
