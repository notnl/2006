import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [timeLeft, setTimeLeft] = useState<string>("");
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

      setTimeLeft(`${diffDays} day${diffDays !== 1 ? "s" : ""} ${diffHours} hour${diffHours !== 1 ? "s" : ""} left`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load questions and user profile
  useEffect(() => {
    loadQuestions();
    loadUserProfile();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("challenges").select("*").limit(5);
      if (!error && data) {
        setQuestions(data as ChallengeQuestion[]);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;
      
      setUser(user);

      const { data: profile } = await supabase
        .from("userprofile")
        .select("green_score, quiz_answers")
        .eq("id", user.id)
        .single();

      if (profile?.green_score != null) {
        setGreenScore(profile.green_score);
      }
      
      if (profile?.quiz_answers) {
        setSelectedAnswers(profile.quiz_answers);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleAnswer = async (qid: number, option: string, correctAnswer: string, points: number) => {
    if (selectedAnswers[qid]) return;

    const question = questions.find(q => q.id === qid);
    if (!question) return;

    const optionLetter = 
      option === question.optionA ? "A" :
      option === question.optionB ? "B" :
      option === question.optionC ? "C" : "";

    const isCorrect = option === correctAnswer;
    const newSelected = { ...selectedAnswers, [qid]: optionLetter };
    setSelectedAnswers(newSelected);

    if (isCorrect) {
      const newScore = greenScore + (points || 1);
      setGreenScore(newScore);
    }

    if (user) {
      const updateData: any = { quiz_answers: newSelected };
      if (isCorrect) {
        updateData.green_score = isCorrect ? greenScore + (points || 1) : greenScore;
      }

      await supabase
        .from("userprofile")
        .update(updateData)
        .eq("id", user.id);
    }
  };

  return {
    questions,
    selectedAnswers,
    greenScore,
    timeLeft,
    loading,
    handleAnswer,
    refreshQuestions: loadQuestions,
    refreshProfile: loadUserProfile,
  };
}
