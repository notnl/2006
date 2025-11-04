import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ImageBackground, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'expo-router';

export default function ChallengesComponent() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | null }>({});
  const [user, setUser] = useState<any>(null);
  const [greenScore, setGreenScore] = useState(0);
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>("");

useEffect(() => {
  function updateCountdown() {
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

    setTimeLeft(`${diffDays} day${diffDays !== 1 ? "s" : ""} ${diffHours} hour${diffHours !== 1 ? "s" : ""} left`);
  }

  updateCountdown();
  const interval = setInterval(updateCountdown, 60 * 60 * 1000); // Update hourly

  return () => clearInterval(interval);
}, []);

  // ✅ Load questions + user profile
  useEffect(() => {
    fetchQuestions();
    fetchUserProfile();
  }, []);

  async function fetchQuestions() {
    const { data, error } = await supabase.from("challenges").select("*").limit(5);
    if (!error && data) setQuestions(data);
  }

  async function fetchUserProfile() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;
    setUser(user);

    const { data: profile } = await supabase
      .from("userprofile")
      .select("green_score, quiz_answers")
      .eq("id", user.id)
      .single();

    if (profile?.green_score != null) setGreenScore(profile.green_score);
    if (profile?.quiz_answers) setSelectedAnswers(profile.quiz_answers);
  }

  //Deal with user input answer
  async function handleAnswer(qid: number, option: string, correctAnswer: string, points: number) {
  if (selectedAnswers[qid]) return; 

  // Map the option text to "A" / "B" / "C"
  const optionLetter = 
    option === questions.find(q => q.id === qid)?.optionA ? "A" :
    option === questions.find(q => q.id === qid)?.optionB ? "B" :
    option === questions.find(q => q.id === qid)?.optionC ? "C" : "";

  const isCorrect = option === correctAnswer;
  const newSelected = { ...selectedAnswers, [qid]: optionLetter };
  setSelectedAnswers(newSelected);

  // Correct Answer
  if (isCorrect) {
    const newScore = greenScore + (points || 1);
    setGreenScore(newScore);

    if (user) {
      await supabase
        .from("userprofile")
        .update({ green_score: newScore, quiz_answers: newSelected })
        .eq("id", user.id);
    }
  } else {
    // Save the selected option
    if (user) {
      await supabase
        .from("userprofile")
        .update({ quiz_answers: newSelected })
        .eq("id", user.id);
    }
  }
}

  if (questions.length === 0)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <ImageBackground
      source={require("@/assets/images/bg-city.png")}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      {/* Header */}
      <Text
        style={{
          fontFamily: "PressStart2P",
          fontSize: 16,
          color: "#FF69B4",
          textShadowColor: "#800080",
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 1,
          marginTop: 40,
          marginBottom: 20,
        }}
      >
        QUIZ
      </Text>

      {/* ✅ User Score */}
      <Text
        style={{
          fontFamily: "PressStart2P",
          fontSize: 10,
          color: "#ffffffff",
          marginBottom: 10,
        }}
      >
        Your Score: {greenScore}
      </Text>

      {/* Time Left */}
      <Text
        style={{
          fontFamily: "PressStart2P",
          fontSize: 8,
          color: "#FFD700",
          marginBottom: 15,
          textAlign: "center",
        }}
      >
        ⏰ {timeLeft}
      </Text>

      {/* Scrollable Quiz List */}
      <ScrollView
        style={{
          backgroundColor: "rgba(255,220,120,0.8)",
          borderRadius: 20,
          width: "90%",
          paddingVertical: 10,
          marginBottom: 20,
        }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {questions.map((q, idx) => {
          const selectedLetter  = selectedAnswers[q.id];
          const selectedOption =
            selectedLetter === "A"
              ? q.optionA
              : selectedLetter === "B"
              ? q.optionB
              : selectedLetter === "C"
              ? q.optionC
              : null;

          const selected = selectedOption;
          return (
            <View
              key={q.id}
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 20,
                marginVertical: 10,
                width: "90%",
                alignItems: "center",
                borderColor: "#ff9933",
                borderWidth: 3,
                shadowColor: "#cc33ff",
                shadowOpacity: 0.8,
                shadowOffset: { width: 2, height: 3 },
                shadowRadius: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: "PressStart2P",
                  fontSize: 8,
                  color: "#3B0A00",
                  marginBottom: 6,
                  textAlign: "center",
                }}
              >
                Question {idx + 1}
              </Text>

              <Text
                style={{
                  fontFamily: "PressStart2P",
                  fontSize: 7,
                  color: "#3B0A00",
                  marginBottom: 12,
                  textAlign: "center",
                  lineHeight: 10,
                }}
              >
                {q.question_desc}
              </Text>

              {[q.optionA, q.optionB, q.optionC].map((option: string, i: number) => {
                const isSelected = selected === option;
                const isCorrect = isSelected && option === q.answer;
                const isWrong = isSelected && option !== q.answer;

                const bgColor =
                isCorrect
                ? "#4CAF50" // ✅ green for correct
                : isWrong
                ? "#FF6B6B" // ❌ red for wrong
                : !isCorrect && selected && option === q.answer
                ? "#6bdcffff" // light blue for actual answer
                : !selected
                ? "#FFFFFF" // ⬜ normal if not answered yet
                : "#FFFFFF";

            return (
              <Pressable
                key={i}
                onPress={() => handleAnswer(q.id, option, q.answer, q.points)}
                style={{
                  backgroundColor: bgColor,
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  width: "100%",
                  borderWidth: 2,
                  borderColor: "#ff9933",
                  marginVertical: 5,
                }}
                  >
                    <Text
                      style={{
                        fontFamily: "PressStart2P",
                        fontSize: 7,
                        color: "#3B0A00",
                        textAlign: "center",
                      }}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
      <Pressable
        onPress={() => router.push('/menu')}
        style={{
          backgroundColor: '#FFA726',
          borderColor: '#FF4081',
          borderWidth: 4,
          paddingVertical: 14,
          paddingHorizontal: 40,
          borderRadius: 8,
          marginTop: 10,
          marginBottom: 30,
          shadowColor: '#000',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          alignSelf: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 10,
            color: '#3B0A00',
            textAlign: 'center',
          }}
        >
          BACK TO HOME
        </Text>
      </Pressable>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
