import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Modal, Pressable, Platform } from 'react-native';
import { Text } from '@/views/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/views/ui/card';

import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

interface TownItem {
  id: number;
  town_name: string;
  green_score: number;
  gas: number;
  water?: number;
  electricity?: number;
  recycle?: number;
  vertices?: [];
}

export default function MapComponent() {
  const router = useRouter();
  const [selected, setSelected] = useState<TownItem | null>(null);
  const [showWebMap, setShowWebMap] = useState(false);
  const [townData, setTownData] = useState<TownItem[]>([]);
  const [mapComponents, setMapComponents] = useState<{
    MapView: any;
    Marker: any;
    Polygon: any;
  } | null>(null);

  async function fetchTown() {
    try {
      const { data, error } = await supabase
        .from('scoreboard')
        .select('*')
        .limit(100);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      const filtered_data = data?.filter(item => item != null) || [];
      setTownData(filtered_data as TownItem[]);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    }
  }

  useEffect(() => {
    fetchTown();
    
    // Load native map components
    if (Platform.OS !== 'web') {
      const { default: MapView, Marker, Polygon } = require('react-native-maps');
      setMapComponents({ MapView, Marker, Polygon });
    } else {
      setShowWebMap(true);
    }
  }, []);

  // Function to generate polygon coordinates from vertices
  const generateTownPolygons = (townsData: TownItem[]) => {
    const polygons: Record<number, { latitude: number; longitude: number }[]> = {};
    
    townsData.forEach(town => {
      let polygonArr: { latitude: number; longitude: number }[] = [];
      
      if (town != null && town.vertices != null) {
        for (let step = 0; step < town.vertices.length / 2; step++) {
          polygonArr.push({
            latitude: town.vertices[step * 2],
            longitude: town.vertices[(step * 2) + 1]
          });
        }
        polygons[town.id] = polygonArr;
      }
    });
    
    return polygons;
  };

  // Generate colors for all towns
  const generateColors = () => {
    const colors = [
      'rgba(255, 99, 132, 0.4)',    // Red
      'rgba(54, 162, 235, 0.4)',    // Blue
      'rgba(255, 206, 86, 0.4)',    // Yellow
      'rgba(75, 192, 192, 0.4)',    // Teal
      'rgba(153, 102, 255, 0.4)',   // Purple
      'rgba(255, 159, 64, 0.4)',    // Orange
      'rgba(199, 199, 199, 0.4)',   // Gray
      'rgba(83, 102, 255, 0.4)',    // Indigo
      'rgba(40, 159, 64, 0.4)',     // Green
      'rgba(210, 114, 225, 0.4)',   // Pink
      'rgba(102, 159, 255, 0.4)',   // Light Blue
      'rgba(255, 102, 159, 0.4)',   // Light Red
      'rgba(159, 255, 102, 0.4)',   // Light Green
      'rgba(255, 203, 102, 0.4)',   // Light Orange
      'rgba(102, 255, 203, 0.4)',   // Mint
      'rgba(203, 102, 255, 0.4)',   // Lavender
      'rgba(255, 102, 203, 0.4)',   // Hot Pink
      'rgba(102, 203, 255, 0.4)',   // Sky Blue
      'rgba(203, 255, 102, 0.4)',   // Lime
      'rgba(255, 153, 102, 0.4)',   // Coral
    ];
    
    const polygonColors: Record<number, string> = {};
    townData.forEach((town, index) => {
      polygonColors[town.id] = colors[index % colors.length];
    });
    return polygonColors;
  };

  // Handle polygon click
  const handlePolygonClick = (town: TownItem) => {
    setSelected(town);
  };

  // Handle popup close
  const handlePopupClose = () => {
    setSelected(null);
  };

  // Show loading while map components are loading
  if (Platform.OS !== 'web' && !mapComponents) {
    return (
      <View style={styles.container}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  // Native app (iOS/Android)
  if (Platform.OS !== 'web' && mapComponents) {
    const { MapView, Polygon } = mapComponents;
    const townPolygons = generateTownPolygons(townData);
    const polygonColors = generateColors();

    return (
      <View style={styles.container}>
        <Pressable
          onPress={() => router.push('/menu')}
          style={{
            backgroundColor: '#FFA726',
            borderColor: '#FF4081',
            borderWidth: 4,
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 8,
            marginTop: 32,
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            zIndex: 1000,
            position: 'absolute',
            top: 50,
            alignSelf: 'center',
          }}
        >
          <Text style={{
            fontFamily: 'PressStart2P',
            fontSize: 10,
            color: '#3B0A00',
            textAlign: 'center',
          }}>
            BACK TO HOME
          </Text>
        </Pressable>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 1.3521,
            longitude: 103.8198,
            latitudeDelta: 0.25,
            longitudeDelta: 0.25,
          }}
        >
          {townData.map((town) => {
            const vertices = townPolygons[town.id];
            if (!vertices || vertices.length === 0) return null;
            
            return (
              <Polygon
                key={town.id}
                coordinates={vertices}
                fillColor={polygonColors[town.id]}
                strokeColor={polygonColors[town.id].replace('0.4', '1')}
                strokeWidth={2}
                tappable={true}
                onPress={() => handlePolygonClick(town)}
              />
            );
          })}
        </MapView>

        <Modal
          visible={!!selected}
          animationType="slide"
          transparent={true}
          onRequestClose={handlePopupClose}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCardWrapper}>
              <Card>
                <CardHeader>
                  <CardTitle>{selected?.town_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {selected?.electricity && (
                    <View style={styles.row}>
                      <Text className="text-gray-600">⚡ Electricity</Text>
                      <Text className="font-medium">{selected.electricity} kWh</Text>
                    </View>
                  )}
                  {selected?.gas && (
                    <View style={styles.row}>
                      <Text className="text-gray-600">⛽ Gas</Text>
                      <Text className="font-medium">{selected.gas} L</Text>
                    </View>
                  )}
                  {selected?.water && (
                    <View style={styles.row}>
                      <Text className="text-gray-600">💧 Water</Text>
                      <Text className="font-medium">{selected.water} L</Text>
                    </View>
                  )}
                  {selected?.recycle && (
                    <View style={styles.row}>
                      <Text className="text-gray-600">♻️ Recycle</Text>
                      <Text className="font-medium">{selected.recycle} kg</Text>
                    </View>
                  )}
                  <View style={styles.row}>
                    <Text className="text-gray-600">🌱 Green Score</Text>
                    <Text className="font-medium">{selected?.green_score} pts</Text>
                  </View>
                  <Pressable style={styles.closeButton} onPress={handlePopupClose}>
                    <Text className="text-center">Close</Text>
                  </Pressable>
                </CardContent>
              </Card>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Web app fallback
  return (
    <View style={styles.container}>
      <Text className="text-lg font-bold mb-4">Map not supported on this platform</Text>
      <Pressable
        onPress={() => router.push('/menu')}
        style={{
          backgroundColor: '#FFA726',
          borderColor: '#FF4081',
          borderWidth: 4,
          paddingVertical: 14,
          paddingHorizontal: 40,
          borderRadius: 8,
          marginTop: 32,
        }}
      >
        <Text style={{
          fontFamily: 'PressStart2P',
          fontSize: 10,
          color: '#3B0A00',
          textAlign: 'center',
        }}>
          BACK TO HOME
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: width,
    height: height,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCardWrapper: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
  },
});
