import React from "react";
import { View, Text, Pressable, ImageBackground, ScrollView, StyleSheet } from "react-native";
import { useRouter } from 'expo-router';
import { useChallenges } from '@/app/model/challenge_model';

export default function ChallengesComponent() {
  const router = useRouter();
  const { 
    questions, 
    selectedAnswers, 
    greenScore, 
    timeLeft, 
    loading, 
    handleAnswer 
  } = useChallenges(); 
  //Our logic is all handled at the model , from lec slides : Contains the processing (operations) and the data involved.

  if (loading || questions.length === 0) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/bg-city.png")}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      {/* Header */}
      <Text style={styles.header}>
        QUIZ
      </Text>

      {/* User Score */}
      <Text style={styles.scoreText}>
        Your Score: {greenScore}
      </Text>

      {/* Time Left */}
      <Text style={styles.timeText}>
        ⏰ {timeLeft}
      </Text>

      {/* Scrollable Quiz List */}
      <ScrollView
        style={styles.quizContainer}
        contentContainerStyle={styles.quizContent}
      >
        {questions.map((q, idx) => {
          const selectedLetter = selectedAnswers[q.id];
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
            <View key={q.id} style={styles.questionCard}>
              <Text style={styles.questionNumber}>
                Question {idx + 1}
              </Text>

              <Text style={styles.questionText}>
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
                    style={[styles.optionButton, { backgroundColor: bgColor }]}
                  >
                    <Text style={styles.optionText}>
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
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>
          BACK TO HOME
        </Text>
      </Pressable>
    </ImageBackground>
  );
}

// Keep all your styles the same as before
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontFamily: "PressStart2P",
    fontSize: 16,
    color: "#FF69B4",
    textShadowColor: "#800080",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    marginTop: 40,
    marginBottom: 20,
  },
  scoreText: {
    fontFamily: "PressStart2P",
    fontSize: 10,
    color: "#ffffffff",
    marginBottom: 10,
  },
  timeText: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#FFD700",
    marginBottom: 15,
    textAlign: "center",
  },
  quizContainer: {
    backgroundColor: "rgba(255,220,120,0.8)",
    borderRadius: 20,
    width: "90%",
    paddingVertical: 10,
    marginBottom: 20,
  },
  quizContent: {
    alignItems: "center",
  },
  questionCard: {
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
  },
  questionNumber: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#3B0A00",
    marginBottom: 6,
    textAlign: "center",
  },
  questionText: {
    fontFamily: "PressStart2P",
    fontSize: 7,
    color: "#3B0A00",
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 10,
  },
  optionButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: "100%",
    borderWidth: 2,
    borderColor: "#ff9933",
    marginVertical: 5,
  },
  optionText: {
    fontFamily: "PressStart2P",
    fontSize: 7,
    color: "#3B0A00",
    textAlign: "center",
  },
  backButton: {
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
  },
  backButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#3B0A00',
    textAlign: 'center',
  },
});
