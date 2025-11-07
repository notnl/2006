import React from "react";
import { View, Text, Pressable, ImageBackground, ScrollView, StyleSheet } from "react-native";
import { useRouter } from 'expo-router';
import { useChallenges } from '@/app/model/challenge_model';
import Loading from '@/views/ui/LoadingComponent';

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

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>
          QUIZ CHALLENGE
        </Text>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statValue}>{greenScore}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TIME LEFT</Text>
            <Text style={styles.timeValue}>⏰ {timeLeft}</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Quiz List */}
      <ScrollView
        style={styles.quizContainer}
        contentContainerStyle={styles.quizContent}
        showsVerticalScrollIndicator={false}
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
              {/* Question Header */}
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>
                  QUESTION {idx + 1}
                </Text>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+{q.points} pts</Text>
                </View>
              </View>

              {/* Question Text */}
              <Text style={styles.questionText}>
                {q.question_desc}
              </Text>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {[
                  { letter: "A", option: q.optionA },
                  { letter: "B", option: q.optionB },
                  { letter: "C", option: q.optionC }
                ].map(({ letter, option }, i) => {
                  const isSelected = selected === option;
                  const isCorrect = isSelected && option === q.answer;
                  const isWrong = isSelected && option !== q.answer;
                  const showCorrect = selected && option === q.answer && !isSelected;

                  const bgColor =
                    isCorrect
                      ? "#4CAF50" // ✅ green for correct
                      : isWrong
                      ? "#FF6B6B" // ❌ red for wrong
                      : showCorrect
                      ? "#6bdcff" // light blue for actual answer when another is wrong
                      : "#FFFFFF"; // ⬜ normal if not answered yet

                  const borderColor =
                    isCorrect
                      ? "#2E7D32"
                      : isWrong
                      ? "#C62828"
                      : showCorrect
                      ? "#0288D1"
                      : "#FF9800";

                  return (
                    <Pressable
                      key={i}
                      onPress={() => handleAnswer(q.id, option, q.answer, q.points)}
                      style={[
                        styles.optionButton,
                        { 
                          backgroundColor: bgColor,
                          borderColor: borderColor 
                        }
                      ]}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.optionLetter}>
                          <Text style={styles.optionLetterText}>{letter}</Text>
                        </View>
                        <Text style={styles.optionText}>
                          {option}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      {/* Back Button */}
      <Pressable
        onPress={() => router.push('/menu')}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>
          BACK TO HOME
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A237E',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontFamily: "PressStart2P",
    fontSize: 20,
    color: "#FFA726",
    textShadowColor: "#FF0044",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFA726',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statValue: {
    fontFamily: "PressStart2P",
    fontSize: 16,
    color: "#4CAF50",
  },
  timeValue: {
    fontFamily: "PressStart2P",
    fontSize: 12,
    color: "#FFD700",
  },
  quizContainer: {
    flex: 1,
    marginBottom: 20,
  },
  quizContent: {
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#FF9800",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontFamily: "PressStart2P",
    fontSize: 10,
    color: "#3B0A00",
  },
  pointsBadge: {
    backgroundColor: '#FFA726',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF4081',
  },
  pointsText: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#3B0A00",
  },
  questionText: {
    fontFamily: "PressStart2P",
    fontSize: 10,
    color: "#3B0A00",
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 14,
    flexWrap: 'wrap',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A237E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#FFFFFF",
  },
  optionText: {
    fontFamily: "PressStart2P",
    fontSize: 9,
    color: "#3B0A00",
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 12,
  },
  backButton: {
    backgroundColor: '#FFA726',
    borderColor: '#FF4081',
    borderWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    alignSelf: 'center',
    minWidth: 200,
  },
  backButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#3B0A00',
    textAlign: 'center',
  },
});
