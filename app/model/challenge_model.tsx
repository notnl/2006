import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export interface ChallengeQuestion {
  id: number;
  question_desc: string;
  optionA: string;
  optionB: string;
  optionC: string;
  answer: string;
  points: number;
}

export interface UserProfile {
  id: string;
  green_score: number;
  quiz_answers: { [key: number]: string | null };
}

class ChallengesModel {
  private questions: ChallengeQuestion[] = [];
  private selectedAnswers: { [key: number]: string | null } = {};
  private user: any = null;
  private greenScore: number = 0;
  private timeLeft: string = "";
  private loading: boolean = true;

  // Observers
  private questionsObservers: Array<(data: ChallengeQuestion[]) => void> = [];
  private answersObservers: Array<(answers: { [key: number]: string | null }) => void> = [];
  private profileObservers: Array<(score: number) => void> = [];
  private timeObservers: Array<(time: string) => void> = [];
  private loadingObservers: Array<(loading: boolean) => void> = [];

  // Subscription methods
  subscribeToQuestions(callback: (data: ChallengeQuestion[]) => void) {
    this.questionsObservers.push(callback);
    callback(this.questions);
    return () => {
      this.questionsObservers = this.questionsObservers.filter(obs => obs !== callback);
    };
  }

  subscribeToAnswers(callback: (answers: { [key: number]: string | null }) => void) {
    this.answersObservers.push(callback);
    callback(this.selectedAnswers);
    return () => {
      this.answersObservers = this.answersObservers.filter(obs => obs !== callback);
    };
  }

  subscribeToProfile(callback: (score: number) => void) {
    this.profileObservers.push(callback);
    callback(this.greenScore);
    return () => {
      this.profileObservers = this.profileObservers.filter(obs => obs !== callback);
    };
  }

  subscribeToTime(callback: (time: string) => void) {
    this.timeObservers.push(callback);
    callback(this.timeLeft);
    return () => {
      this.timeObservers = this.timeObservers.filter(obs => obs !== callback);
    };
  }

  subscribeToLoading(callback: (loading: boolean) => void) {
    this.loadingObservers.push(callback);
    callback(this.loading);
    return () => {
      this.loadingObservers = this.loadingObservers.filter(obs => obs !== callback);
    };
  }

  private notifyQuestionsObservers() {
    this.questionsObservers.forEach(callback => callback([...this.questions]));
  }

  private notifyAnswersObservers() {
    this.answersObservers.forEach(callback => callback({ ...this.selectedAnswers }));
  }

  private notifyProfileObservers() {
    this.profileObservers.forEach(callback => callback(this.greenScore));
  }

  private notifyTimeObservers() {
    this.timeObservers.forEach(callback => callback(this.timeLeft));
  }

  private notifyLoadingObservers() {
    this.loadingObservers.forEach(callback => callback(this.loading));
  }

  // Data operations
  async loadQuestions(): Promise<void> {
    this.setLoading(true);
    try {
      const { data, error } = await supabase.from("challenges").select("*").limit(5);
      if (!error && data) {
        this.questions = data as ChallengeQuestion[];
        this.notifyQuestionsObservers();
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      this.setLoading(false);
    }
  }

  async loadUserProfile(): Promise<void> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;
      
      this.user = user;

      const { data: profile } = await supabase
        .from("userprofile")
        .select("green_score, quiz_answers")
        .eq("id", user.id)
        .single();

      if (profile?.green_score != null) {
        this.greenScore = profile.green_score;
        this.notifyProfileObservers();
      }
      
      if (profile?.quiz_answers) {
        this.selectedAnswers = profile.quiz_answers;
        this.notifyAnswersObservers();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async handleAnswer(qid: number, option: string, correctAnswer: string, points: number): Promise<void> {
    if (this.selectedAnswers[qid]) return;

    // Map the option text to "A" / "B" / "C"
    const question = this.questions.find(q => q.id === qid);
    if (!question) return;

    const optionLetter = 
      option === question.optionA ? "A" :
      option === question.optionB ? "B" :
      option === question.optionC ? "C" : "";

    const isCorrect = option === correctAnswer;
    const newSelected = { ...this.selectedAnswers, [qid]: optionLetter };
    
    this.selectedAnswers = newSelected;
    this.notifyAnswersObservers();

    // Update score if correct
    if (isCorrect) {
      const newScore = this.greenScore + (points || 1);
      this.greenScore = newScore;
      this.notifyProfileObservers();
    }

    // Save to database
    if (this.user) {
      const updateData: any = { quiz_answers: newSelected };
      if (isCorrect) {
        updateData.green_score = this.greenScore;
      }

      await supabase
        .from("userprofile")
        .update(updateData)
        .eq("id", this.user.id);
    }
  }

  // Timer logic
  startCountdown() {
    const updateCountdown = () => {
      const now = new Date();
      const nextSunday = new Date();

      // Set target to upcoming Sunday 23:59:00
      const day = now.getDay();
      const daysUntilSunday = (7 - day) % 7; 
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(23, 59, 0, 0);

      // If it's already Sunday after 23:59, jump to next week's Sunday
      if (nextSunday.getTime() < now.getTime()) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }

      const diffMs = nextSunday.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

      this.timeLeft = `${diffDays} day${diffDays !== 1 ? "s" : ""} ${diffHours} hour${diffHours !== 1 ? "s" : ""} left`;
      this.notifyTimeObservers();
    };

    updateCountdown();
    return setInterval(updateCountdown, 60 * 60 * 1000); // Update hourly
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    this.notifyLoadingObservers();
  }

  // Getters
  getCurrentQuestions(): ChallengeQuestion[] {
    return [...this.questions];
  }

  getCurrentAnswers(): { [key: number]: string | null } {
    return { ...this.selectedAnswers };
  }

  getCurrentGreenScore(): number {
    return this.greenScore;
  }

  getCurrentTimeLeft(): string {
    return this.timeLeft;
  }

  isLoading(): boolean {
    return this.loading;
  }
}

// Singleton instance
let challengesModelInstance: ChallengesModel | null = null;

export function getChallengesModel(): ChallengesModel {
  if (!challengesModelInstance) {
    challengesModelInstance = new ChallengesModel();
  }
  return challengesModelInstance;
}

// React Hook for using the model
export function useChallengesModel() {
  const [model] = useState(() => getChallengesModel());
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | null }>({});
  const [greenScore, setGreenScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeQuestions = model.subscribeToQuestions(setQuestions);
    const unsubscribeAnswers = model.subscribeToAnswers(setSelectedAnswers);
    const unsubscribeProfile = model.subscribeToProfile(setGreenScore);
    const unsubscribeTime = model.subscribeToTime(setTimeLeft);
    const unsubscribeLoading = model.subscribeToLoading(setLoading);

    // Initial data load
    model.loadQuestions();
    model.loadUserProfile();
    const interval = model.startCountdown();

    return () => {
      unsubscribeQuestions();
      unsubscribeAnswers();
      unsubscribeProfile();
      unsubscribeTime();
      unsubscribeLoading();
      clearInterval(interval);
    };
  }, [model]);

  return {
    questions,
    selectedAnswers,
    greenScore,
    timeLeft,
    loading,
    handleAnswer: (qid: number, option: string, correctAnswer: string, points: number) => 
      model.handleAnswer(qid, option, correctAnswer, points),
    refreshQuestions: () => model.loadQuestions(),
    refreshProfile: () => model.loadUserProfile(),
  };
}
