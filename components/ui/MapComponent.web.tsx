import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Modal, Pressable, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


import { useRouter } from 'expo-router';

import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

// Base towns array - this will be fetched from database
const towns = [
  { id: 'amk', name: 'Ang Mo Kio', latitude: 1.3691, longitude: 103.8490, electricity: 1200, water: 3400, green_score: 72 },
  { id: 'bishan', name: 'Bishan', latitude: 1.3500, longitude: 103.8520, electricity: 950, water: 2800, green_score: 68 },
  { id: 'bukit_timah', name: 'Bukit Timah', latitude: 1.3431, longitude: 103.7766, electricity: 800, water: 2300, green_score: 80 },
  { id: 'orchard', name: 'Orchard', latitude: 1.3039, longitude: 103.8328, electricity: 2000, water: 4500, green_score: 60 },
  { id: 'woodlands', name: 'Woodlands', latitude: 1.4376, longitude: 103.7863, electricity: 1100, water: 3000, green_score: 70 },
  { id: 'jurong_east', name: 'Jurong East', latitude: 1.3326, longitude: 103.7423, electricity: 1300, water: 3600, green_score: 65 },
  { id: 'bukit_merah', name: 'Bukit Merah', latitude: 1.2810, longitude: 103.8250, electricity: 1500, water: 3800, green_score: 58 },
  { id: 'downtown_core', name: 'Downtown Core', latitude: 1.2800, longitude: 103.8500, electricity: 2500, water: 5000, green_score: 55 },
  { id: 'geylang', name: 'Geylang', latitude: 1.3180, longitude: 103.8820, electricity: 1400, water: 3700, green_score: 62 },
  { id: 'kallang', name: 'Kallang', latitude: 1.3050, longitude: 103.8650, electricity: 1200, water: 3200, green_score: 68 },
  { id: 'marine_parade', name: 'Marine Parade', latitude: 1.3020, longitude: 103.9050, electricity: 1100, water: 2900, green_score: 75 },
  { id: 'newton', name: 'Newton', latitude: 1.3120, longitude: 103.8400, electricity: 1800, water: 4200, green_score: 63 },
  { id: 'novena', name: 'Novena', latitude: 1.3220, longitude: 103.8450, electricity: 1600, water: 3900, green_score: 66 },
  { id: 'outram', name: 'Outram', latitude: 1.2820, longitude: 103.8400, electricity: 1700, water: 4100, green_score: 61 },
  { id: 'queenstown', name: 'Queenstown', latitude: 1.2950, longitude: 103.8000, electricity: 1300, water: 3500, green_score: 69 },
  { id: 'river_valley', name: 'River Valley', latitude: 1.2950, longitude: 103.8350, electricity: 1900, water: 4400, green_score: 59 },
  { id: 'rochor', name: 'Rochor', latitude: 1.3050, longitude: 103.8550, electricity: 1600, water: 3800, green_score: 64 },
  { id: 'singapore_river', name: 'Singapore River', latitude: 1.2880, longitude: 103.8450, electricity: 2100, water: 4700, green_score: 57 },
  { id: 'southern_islands', name: 'Southern Islands', latitude: 1.2550, longitude: 103.8250, electricity: 500, water: 1500, green_score: 85 },
  { id: 'tanglin', name: 'Tanglin', latitude: 1.3080, longitude: 103.8200, electricity: 1700, water: 4000, green_score: 67 },
  { id: 'toa_payoh', name: 'Toa Payoh', latitude: 1.3380, longitude: 103.8500, electricity: 1250, water: 3300, green_score: 71 },
  { id: 'bedok', name: 'Bedok', latitude: 1.3230, longitude: 103.9300, electricity: 1400, water: 3600, green_score: 70 },
  { id: 'changi', name: 'Changi', latitude: 1.3570, longitude: 103.9800, electricity: 900, water: 2500, green_score: 78 },
  { id: 'pasir_ris', name: 'Pasir Ris', latitude: 1.3730, longitude: 103.9500, electricity: 1100, water: 3100, green_score: 73 },
  { id: 'paya_lebar', name: 'Paya Lebar', latitude: 1.3550, longitude: 103.8850, electricity: 1300, water: 3400, green_score: 69 },
  { id: 'tampines', name: 'Tampines', latitude: 1.3520, longitude: 103.9300, electricity: 1450, water: 3700, green_score: 72 },
  { id: 'hougang', name: 'Hougang', latitude: 1.3720, longitude: 103.8800, electricity: 1350, water: 3500, green_score: 70 },
  { id: 'punggol', name: 'Punggol', latitude: 1.4050, longitude: 103.9100, electricity: 1200, water: 3200, green_score: 74 },
  { id: 'seletar', name: 'Seletar', latitude: 1.4130, longitude: 103.8700, electricity: 800, water: 2200, green_score: 79 },
  { id: 'sengkang', name: 'Sengkang', latitude: 1.3920, longitude: 103.8900, electricity: 1250, water: 3300, green_score: 73 },
  { id: 'serangoon', name: 'Serangoon', latitude: 1.3550, longitude: 103.8700, electricity: 1300, water: 3400, green_score: 71 },
  { id: 'mandai', name: 'Mandai', latitude: 1.4150, longitude: 103.7750, electricity: 700, water: 2000, green_score: 82 },
  { id: 'sembawang', name: 'Sembawang', latitude: 1.4450, longitude: 103.8250, electricity: 950, water: 2700, green_score: 76 },
  { id: 'sungei_kadut', name: 'Sungei Kadut', latitude: 1.4250, longitude: 103.7550, electricity: 600, water: 1800, green_score: 81 },
  { id: 'yishun', name: 'Yishun', latitude: 1.4300, longitude: 103.8350, electricity: 1150, water: 3100, green_score: 72 },
  { id: 'bukit_batok', name: 'Bukit Batok', latitude: 1.3630, longitude: 103.7550, electricity: 1100, water: 3000, green_score: 74 },
  { id: 'bukit_panjang', name: 'Bukit Panjang', latitude: 1.3850, longitude: 103.7750, electricity: 1050, water: 2900, green_score: 75 },
  { id: 'choa_chu_kang', name: 'Choa Chu Kang', latitude: 1.3850, longitude: 103.7450, electricity: 1200, water: 3200, green_score: 73 },
  { id: 'clementi', name: 'Clementi', latitude: 1.3150, longitude: 103.7650, electricity: 1350, water: 3500, green_score: 70 },
  { id: 'jurong_west', name: 'Jurong West', latitude: 1.3450, longitude: 103.7050, electricity: 1400, water: 3700, green_score: 66 },
  { id: 'pioneer', name: 'Pioneer', latitude: 1.3250, longitude: 103.6900, electricity: 950, water: 2600, green_score: 77 },
  { id: 'tengah', name: 'Tengah', latitude: 1.3600, longitude: 103.7300, electricity: 850, water: 2400, green_score: 80 },
];

let MapContainer: any, TileLayer: any, LeafletPolygon: any, Popup: any;
const isBrowser = typeof window !== 'undefined';
if (isBrowser && Platform.OS === 'web') {
  const leaflet = require('react-leaflet');
  MapContainer = leaflet.MapContainer;
  TileLayer = leaflet.TileLayer;
  LeafletPolygon = leaflet.Polygon;
  Popup = leaflet.Popup;
  require('leaflet/dist/leaflet.css');
}

export default function MapComponent() {
  const router = useRouter();
  const [selected, setSelected] = useState<typeof towns[0] | null>(null);
  const [showWebMap, setShowWebMap] = useState(false);
  const [townData, setTownData] = useState<typeof towns>([]);


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

      const filtered_data = data.filter(item => { return (item != null)  } )


      setTownData(filtered_data);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    } finally {
    }
  }

  useEffect(() => {

    fetchTown();
    if (isBrowser && Platform.OS === 'web') {
      setShowWebMap(true);
    }
    


    // In your actual implementation, you would fetch from database here
    // For now, we'll use the static towns array
  }, []);

  // Function to generate polygon coordinates relative to town center
  const generateTownPolygons = (townsData: typeof towns) => {
    const polygons: Record<string, [number, number][]> = {};
    
    townsData.forEach(town => {
      // Define polygon size (in degrees)
      const latOffset = 0.008; // ~0.9km
      const lngOffset = 0.010; // ~1.1km
      
      // Generate a diamond-shaped polygon around the town center
      polygons[town.id] = [
        [town.latitude + latOffset, town.longitude], // Top
        [town.latitude, town.longitude + lngOffset], // Right
        [town.latitude - latOffset, town.longitude], // Bottom
        [town.latitude, town.longitude - lngOffset], // Left
      ];
    });
    
    return polygons;
  };

  if (showWebMap) { 
    // Generate town polygons dynamically based on town coordinates
    const townPolygons = generateTownPolygons(townData);

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
      
      const polygonColors: Record<string, string> = {};
      townData.forEach((town, index) => {
        polygonColors[town.id] = colors[index % colors.length];
      });
      return polygonColors;
    };

    const polygonColors = generateColors();

    return (
      <View style={styles.webContainer}>
        <MapContainer
          center={[1.3521, 103.8198]}
          zoom={11}
          style={{ height: height * 0.7, width: width * 0.9, borderRadius: 12 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {townData.map((town) => (
            <LeafletPolygon
              key={town.id}
              positions={townPolygons[town.id]}
              pathOptions={{ 
                color: polygonColors[town.id], 
                fillColor: polygonColors[town.id], 
                fillOpacity: 0.6,
                weight: 2
              }}
              eventHandlers={{
                click: () => setSelected(town),
              }}
            />
          ))}
          {selected && (
            <Popup
              position={[selected.latitude, selected.longitude]}
              eventHandlers={{ close: () => setSelected(null) }}
            >
              <div style={{ minWidth: 180 }}>
                <strong>{selected.name}</strong><br />
                ⚡ Electricity: {selected.electricity} kWh<br />
                💧 Water: {selected.water} L<br />
                🌱 Green Score: {selected.green_score} pts<br />
                <button style={{ marginTop: 8 }} onClick={() => setSelected(null)}>Close</button>
              </div>
            </Popup>
          )}
        </MapContainer>

        {/* Back to Home Button */}
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

  // Fallback for SSR or if window is not defined
  if (Platform.OS === 'web' && !showWebMap) {
    return (
      <View style={styles.webContainer}>
        <Text className="text-lg font-bold mb-4">Loading interactive map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.webContainer}>
      <Text className="text-lg font-bold mb-4">Interactive polygons are not supported in the current web map. For full interactivity, use a library like react-google-maps/api or react-leaflet.</Text>

      {/* Back to Home Button */}
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
  },
  map: {
    width: width,
    height: height,
  },
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
    width: '100%',
  },
  townList: {
    marginTop: 16,
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  townButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    margin: 4,
    minWidth: 100,
    alignItems: 'center',
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
