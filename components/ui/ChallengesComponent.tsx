import React from "react";
import { View, Text, Pressable, ImageBackground, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';

interface ChallengeItem {
  id: number;
  type: number;
  description: string;
  points: number;
  end_date: string; // ISO string format
}

interface AcceptedChallenge extends ChallengeItem {
  progress: number;
  target: number;
  timeRemaining: string;
  status: 'in-progress' | 'completed' | 'failed';
}

// Utility function to calculate time remaining
const calculateTimeRemaining = (endDate: string): string => {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const timeLeft = end - now;

  if (timeLeft <= 0) {
    return "Expired";
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} left`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''} left`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''} left`;
  }
};

export default function ChallengesComponent() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [acceptedChallenges, setAcceptedChallenges] = useState<AcceptedChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<AcceptedChallenge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    fetchChallenges();
    loadAcceptedChallenges();
  }, []);

  // Real-time timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update selected challenge time remaining if modal is open
      if (modalVisible && selectedChallenge) {
        setSelectedChallenge(prev => prev ? {
          ...prev,
          timeRemaining: calculateTimeRemaining(selectedChallenge.end_date)
        } : null);
      }
      
      // Update accepted challenges time remaining
      setAcceptedChallenges(prev => prev.map(challenge => ({
        ...challenge,
        timeRemaining: calculateTimeRemaining(challenge.end_date)
      })));
      
    }, 1000);

    return () => clearInterval(timer);
  }, [modalVisible, selectedChallenge]);

  async function fetchChallenges() {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .limit(100);
      const filtered_data = data?.filter(item => item != null) || [];
      setChallenges(filtered_data as ChallengeItem[]);
    } catch (e) {
      console.log(e);
    }
  }

  async function loadAcceptedChallenges() {
    // In a real app, you would load this from AsyncStorage or your database
    setAcceptedChallenges([]);
  }

  const acceptChallenge = (challenge: ChallengeItem) => {
    const newAcceptedChallenge: AcceptedChallenge = {
      ...challenge,
      progress: 0,
      target: 100,
      timeRemaining: calculateTimeRemaining(challenge.end_date),
      status: 'in-progress'
    };
    
    setAcceptedChallenges(prev => [...prev, newAcceptedChallenge]);
    closeModal();
  };

  const toggleModal = (challenge: ChallengeItem) => {
    const acceptedChallenge = acceptedChallenges.find(ac => ac.id === challenge.id);
    
    if (modalVisible && selectedChallenge?.id === challenge.id) {
      closeModal();
    } else {
      const challengeToShow: AcceptedChallenge = acceptedChallenge || {
        ...challenge,
        progress: 0,
        target: 100,
        timeRemaining: calculateTimeRemaining(challenge.end_date),
        status: 'in-progress'
      };
      
      setSelectedChallenge(challengeToShow);
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedChallenge(null);
  };

  const completeChallenge = (challengeId: number) => {
    setAcceptedChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, status: 'completed', progress: 100 } 
          : challenge
      )
    );
    closeModal();
  };

  return (
    <ImageBackground
      source={require("@/assets/images/bg-city.png")}
      resizeMode="cover"
      style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      {/* Header */}
      <Text
        style={{
          fontFamily: "PressStart2P",
          color: "white",
          fontSize: 8,
          textAlign: "center",
          marginTop: 40,
          marginBottom: 10,
        }}
      >
        {/*Your Green Score: 843*/}
      </Text>

      <Text
        style={{
          fontFamily: "PressStart2P",
          fontSize: 16,
          color: "#FF69B4",
          textShadowColor: "#800080",
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 1,
          marginBottom: 20,
        }}
      >
        CHALLENGES
      </Text>

      {/* Scrollable Challenges List */}
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
        {challenges.map((c, index) => {
          const isAccepted = acceptedChallenges.some(ac => ac.id === c.id);
          const acceptedChallenge = acceptedChallenges.find(ac => ac.id === c.id);
          const isSelected = selectedChallenge?.id === c.id && modalVisible;
          const progress = acceptedChallenge?.progress || 0;
          
          return (
            <View
              key={index}
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 20,
                marginVertical: 10,
                width: "90%",
                alignItems: "center",
                borderColor: isSelected ? "#FF69B4" : (isAccepted ? "#4CAF50" : "#ff9933"),
                borderWidth: isSelected ? 4 : 3,
                shadowColor: isSelected ? "#FF69B4" : (isAccepted ? "#4CAF50" : "#cc33ff"),
                shadowOpacity: isSelected ? 1 : 0.8,
                shadowOffset: { width: 2, height: 3 },
                shadowRadius: isSelected ? 6 : 4,
                transform: isSelected ? [{ scale: 1.02 }] : [],
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
                {c.type == 0 ? "Weekly Challenge" : "Seasonal Event"}
                {isAccepted && " ✓"}
              </Text>
              {c.points ? (
                <Text
                  style={{
                    fontFamily: "PressStart2P",
                    fontSize: 6,
                    color: "#4B0082",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {c.points != null ? '+ ' + c.points + ' POINTS' : ''} 
                </Text>
              ) : null}
              <Text
                style={{
                  fontFamily: "PressStart2P",
                  fontSize: 6,
                  color: "#555",
                  marginBottom: 12,
                  textAlign: "center",
                  lineHeight: 10,
                }}
              >
                {c.description}
              </Text>

              {/* Progress Bar on Challenge Card */}
              {isAccepted && (
                <View style={{ width: "100%", marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontFamily: "PressStart2P", fontSize: 5, color: "#3B0A00" }}>
                      PROGRESS
                    </Text>
                    <Text style={{ fontFamily: "PressStart2P", fontSize: 5, color: "#4B0082" }}>
                      {progress}%
                    </Text>
                  </View>
                  
                  {/* Progress Bar */}
                  <View
                    style={{
                      height: 12,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#ff9933",
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        backgroundColor: progress === 100 ? "#4CAF50" : "#FFA726",
                        borderRadius: 5,
                      }}
                    />
                  </View>
                </View>
              )}

              {/* Time Remaining on Challenge Card */}
              {isAccepted && (
                <Text
                  style={{
                    fontFamily: "PressStart2P",
                    fontSize: 5,
                    color: acceptedChallenge?.timeRemaining === "Expired" ? "#FF0000" : "#FF6B6B",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {acceptedChallenge?.timeRemaining}
                </Text>
              )}

              <LinearGradient
                colors={isAccepted ? ["#4CAF50", "#8BC34A"] : ["#ff66cc", "#ff9933"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 6,
                  padding: 2,
                  shadowColor: isAccepted ? "#4CAF50" : "#cc33ff",
                  shadowOpacity: 1,
                  shadowRadius: 6,
                  shadowOffset: { width: 3, height: 3 },
                }}
              >
                <Pressable
                  onPress={() => toggleModal(c)}
                  style={{
                    backgroundColor: isAccepted ? "#66BB6A" : "#FFA726",
                    borderRadius: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "PressStart2P",
                      fontSize: 6,
                      color: isAccepted ? "white" : "#3B0A00",
                      textAlign: "center",
                    }}
                  >
                    {isAccepted ? "VIEW PROGRESS" : "VIEW DETAILS"}
                  </Text>
                </Pressable>
              </LinearGradient>
            </View>
          );
        })}
      </ScrollView>

      {/* Challenge Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 20,
        }}>
          {/* Modal Content */}
          <View style={{
            backgroundColor: "white",
            borderRadius: 25,
            paddingHorizontal: 25,
            paddingVertical: 30,
            width: "90%",
            alignItems: "center",
            borderColor: "#ff9933",
            borderWidth: 4,
            shadowColor: "#cc33ff",
            shadowOpacity: 0.9,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 8,
            maxHeight: "80%",
          }}>
            {/* Close Button */}
            <Pressable
              onPress={closeModal}
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                zIndex: 1,
                backgroundColor: '#FF6B6B',
                borderRadius: 15,
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#3B0A00',
              }}
            >
              <Text style={{
                fontFamily: "PressStart2P",
                fontSize: 8,
                color: "#3B0A00",
              }}>
                X
              </Text>
            </Pressable>

            {selectedChallenge && (
              <>
                <Text
                  style={{
                    fontFamily: "PressStart2P",
                    fontSize: 12,
                    color: "#3B0A00",
                    marginBottom: 15,
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  {selectedChallenge.type === 0 ? "WEEKLY CHALLENGE" : "SEASONAL EVENT"}
                </Text>

                <Text
                  style={{
                    fontFamily: "PressStart2P",
                    fontSize: 10,
                    color: "#4B0082",
                    marginBottom: 15,
                    textAlign: "center",
                  }}
                >
                  {selectedChallenge.points != null ? '+ ' + selectedChallenge.points + ' POINTS' : ''} 
                </Text>

                <Text
                  style={{
                    fontFamily: "PressStart2P",
                    fontSize: 8,
                    color: "#555",
                    marginBottom: 20,
                    textAlign: "center",
                    lineHeight: 14,
                  }}
                >
                  {selectedChallenge.description}
                </Text>

                {/* Progress Section */}
                <View style={{ width: "100%", marginBottom: 20 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                    <Text style={{ fontFamily: "PressStart2P", fontSize: 8, color: "#3B0A00" }}>
                      PROGRESS
                    </Text>
                    <Text style={{ fontFamily: "PressStart2P", fontSize: 8, color: "#4B0082" }}>
                      {selectedChallenge.progress}% COMPLETE
                    </Text>
                  </View>
                  
                  {/* Progress Bar */}
                  <View
                    style={{
                      height: 25,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: "#ff9933",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${selectedChallenge.progress}%`,
                        backgroundColor: selectedChallenge.progress === 100 ? "#4CAF50" : "#FFA726",
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {selectedChallenge.progress > 50 && (
                        <Text style={{
                          fontFamily: "PressStart2P",
                          fontSize: 6,
                          color: "white",
                        }}>
                          {selectedChallenge.progress}%
                        </Text>
                      )}
                    </View>
                  </View>
                  {selectedChallenge.progress <= 50 && (
                    <Text style={{
                      fontFamily: "PressStart2P",
                      fontSize: 6,
                      color: "#3B0A00",
                      textAlign: 'center',
                      marginTop: 4,
                    }}>
                      {selectedChallenge.progress}%
                    </Text>
                  )}
                </View>

                {/* Time Remaining - Now updates in real-time */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 20 }}>
                  <Text style={{ fontFamily: "PressStart2P", fontSize: 8, color: "#3B0A00" }}>
                    TIME REMAINING:
                  </Text>
                  <Text style={{ 
                    fontFamily: "PressStart2P", 
                    fontSize: 8, 
                    color: selectedChallenge.timeRemaining === "Expired" ? "#FF0000" : "#FF6B6B" 
                  }}>
                    {selectedChallenge.timeRemaining}
                  </Text>
                </View>

                {/* Status */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 25 }}>
                  <Text style={{ fontFamily: "PressStart2P", fontSize: 8, color: "#3B0A00" }}>
                    STATUS:
                  </Text>
                  <Text 
                    style={{ 
                      fontFamily: "PressStart2P", 
                      fontSize: 8, 
                      color: selectedChallenge.status === 'completed' ? '#4CAF50' : 
                            selectedChallenge.status === 'failed' ? '#FF6B6B' : '#FFA726' 
                    }}
                  >
                    {selectedChallenge.status.toUpperCase().replace('-', ' ')}
                  </Text>
                </View>

                {/* Action Buttons */}
                {!acceptedChallenges.some(ac => ac.id === selectedChallenge.id) ? (
                  <LinearGradient
                    colors={["#ff66cc", "#ff9933"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 8,
                      padding: 3,
                      shadowColor: "#cc33ff",
                      shadowOpacity: 1,
                      shadowRadius: 6,
                      shadowOffset: { width: 3, height: 3 },
                      marginBottom: 15,
                      width: "80%",
                    }}
                  >
                    <Pressable
                      onPress={() => acceptChallenge(selectedChallenge)}
                      style={{
                        backgroundColor: "#FFA726",
                        borderRadius: 6,
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "PressStart2P",
                          fontSize: 8,
                          color: "#3B0A00",
                          textAlign: "center",
                        }}
                      >
                        ACCEPT CHALLENGE
                      </Text>
                    </Pressable>
                  </LinearGradient>
                ) :(<> </>
                )}

                <Pressable
                  onPress={closeModal}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "PressStart2P",
                      fontSize: 7,
                      color: "#666",
                      textAlign: "center",
                      textDecorationLine: "underline",
                    }}
                  >
                    CLOSE
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Back to Home Button */}
      <LinearGradient
        colors={["#ff66cc", "#ff9933"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 6,
          padding: 2,
          shadowColor: "#cc33ff",
          shadowOpacity: 1,
          shadowRadius: 8,
          shadowOffset: { width: 3, height: 3 },
        }}
      >
        <Pressable
          onPress={() => router.push("/menu")}
          style={{
            backgroundColor: "#FFA726",
            borderRadius: 6,
            paddingVertical: 10,
            paddingHorizontal: 30,
          }}
        >
          <Text
            style={{
              fontFamily: "PressStart2P",
              fontSize: 8,
              color: "#3B0A00",
              textAlign: "center",
            }}
          >
            BACK TO HOME
          </Text>
        </Pressable>
      </LinearGradient>
    </ImageBackground>
  );
}
