import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Modal, Pressable, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useRouter } from 'expo-router';


const { width, height } = Dimensions.get('window');

// test
const towns = [
  { id: 'amk', name: 'Ang Mo Kio', latitude: 1.3691, longitude: 103.8490, electricity: 1200, water: 3400, green_score: 72 },
  { id: 'bishan', name: 'Bishan', latitude: 1.3500, longitude: 103.8520, electricity: 950, water: 2800, green_score: 68 },
  { id: 'bukit_timah', name: 'Bukit Timah', latitude: 1.3431, longitude: 103.7766, electricity: 800, water: 2300, green_score: 80 },
  { id: 'orchard', name: 'Orchard', latitude: 1.3039, longitude: 103.8328, electricity: 2000, water: 4500, green_score: 60 },
  { id: 'woodlands', name: 'Woodlands', latitude: 1.4376, longitude: 103.7863, electricity: 1100, water: 3000, green_score: 70 },
  { id: 'jurong', name: 'Jurong', latitude: 1.3326, longitude: 103.7423, electricity: 1300, water: 3600, green_score: 65 },
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

  const [mapComponents, setMapComponents] = useState<{
    MapView: any;
    Marker: any;
    Polygon: any;
  } | null>(null);

  useEffect(() => {
    if (isBrowser && Platform.OS === 'web') {
      setShowWebMap(true);
    }
  }, []);

  // mobile app
  // 
  /*
  if (!showWebMap) {
   useEffect(() => {
        const loadNativeMap = async () => {
          const { default: MapView, Marker, Polygon } = await import('react-native-maps');
          setNativeMap({ MapView, Marker, Polygon });
        };
        //loadNativeMap();

    // test polygon (can use qgis or labelling tools to get actual boundaries)
    const townPolygons: Record<typeof towns[number]['id'], { latitude: number; longitude: number }[]> = {
      amk: [
        { latitude: 1.370, longitude: 103.845 },
        { latitude: 1.372, longitude: 103.850 },
        { latitude: 1.368, longitude: 103.853 },
        { latitude: 1.366, longitude: 103.848 },
      ],
      bishan: [
        { latitude: 1.352, longitude: 103.850 },
        { latitude: 1.354, longitude: 103.854 },
        { latitude: 1.350, longitude: 103.856 },
        { latitude: 1.348, longitude: 103.852 },
      ],
      bukit_timah: [
        { latitude: 1.344, longitude: 103.774 },
        { latitude: 1.346, longitude: 103.778 },
        { latitude: 1.342, longitude: 103.780 },
        { latitude: 1.340, longitude: 103.776 },
      ],
      orchard: [
        { latitude: 1.305, longitude: 103.830 },
        { latitude: 1.307, longitude: 103.834 },
        { latitude: 1.303, longitude: 103.836 },
        { latitude: 1.301, longitude: 103.832 },
      ],
      woodlands: [
        { latitude: 1.438, longitude: 103.784 },
        { latitude: 1.440, longitude: 103.788 },
        { latitude: 1.436, longitude: 103.790 },
        { latitude: 1.434, longitude: 103.786 },
      ],
      jurong: [
        { latitude: 1.334, longitude: 103.740 },
        { latitude: 1.336, longitude: 103.744 },
        { latitude: 1.332, longitude: 103.746 },
        { latitude: 1.330, longitude: 103.742 },
      ],
    };
    const polygonColors: Record<typeof towns[number]['id'], string> = {
      amk: 'rgba(255, 99, 132, 0.4)',
      bishan: 'rgba(54, 162, 235, 0.4)',
      bukit_timah: 'rgba(255, 206, 86, 0.4)',
      orchard: 'rgba(75, 192, 192, 0.4)',
      woodlands: 'rgba(153, 102, 255, 0.4)',
      jurong: 'rgba(255, 159, 64, 0.4)',
    };
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
          {towns.map((town) => (
            <Polygon
              key={town.id}
              coordinates={townPolygons[town.id]}
              fillColor={polygonColors[town.id]}
              strokeColor={polygonColors[town.id].replace('0.4', '1')}
              tappable={true}
              onPress={() => setSelected(town)}
            />
          ))}

        </MapView>


        <Modal
          visible={!!selected}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelected(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCardWrapper}>
              <Card>
                <CardHeader>
                  <CardTitle>{selected?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <View style={styles.row}>
                    <Text className="text-gray-600">⚡ Electricity</Text>
                    <Text className="font-medium">{selected?.electricity} kWh</Text>
                  </View>
                  <View style={styles.row}>
                    <Text className="text-gray-600">💧 Water</Text>
                    <Text className="font-medium">{selected?.water} L</Text>
                  </View>
                  <View style={styles.row}>
                    <Text className="text-gray-600">🌱 Green Score</Text>
                    <Text className="font-medium">{selected?.green_score} pts</Text>
                  </View>
                  <Pressable style={styles.closeButton} onPress={() => setSelected(null)}>
                    <Text className="text-center">Close</Text>
                  </Pressable>
                </CardContent>
              </Card>
            </View>

          </View>
        </Modal>

      </View>
    );
      }, []);
  }
*/
 if (showWebMap)  { 
  // web app (some window error as well need exception check used chatgpt but idk how it works)
  
    // test polygons
    const townPolygons: Record<typeof towns[number]['id'], [number, number][]> = {
      amk: [
        [1.370, 103.845],
        [1.372, 103.850],
        [1.368, 103.853],
        [1.366, 103.848],
      ],
      bishan: [
        [1.352, 103.850],
        [1.354, 103.854],
        [1.350, 103.856],
        [1.348, 103.852],
      ],
      bukit_timah: [
        [1.344, 103.774],
        [1.346, 103.778],
        [1.342, 103.780],
        [1.340, 103.776],
      ],
      orchard: [
        [1.305, 103.830],
        [1.307, 103.834],
        [1.303, 103.836],
        [1.301, 103.832],
      ],
      woodlands: [
        [1.438, 103.784],
        [1.440, 103.788],
        [1.436, 103.790],
        [1.434, 103.786],
      ],
      jurong: [
        [1.334, 103.740],
        [1.336, 103.744],
        [1.332, 103.746],
        [1.330, 103.742],
      ],
    };
    const polygonColors: Record<typeof towns[number]['id'], string> = {
      amk: 'rgba(255, 99, 132, 0.4)',
      bishan: 'rgba(54, 162, 235, 0.4)',
      bukit_timah: 'rgba(255, 206, 86, 0.4)',
      orchard: 'rgba(75, 192, 192, 0.4)',
      woodlands: 'rgba(153, 102, 255, 0.4)',
      jurong: 'rgba(255, 159, 64, 0.4)',
    };
    return (
      <View style={styles.webContainer}>
        <MapContainer
          center={[1.3521, 103.8198]}
          zoom={12}
          style={{ height: height * 0.7, width: width * 0.9, borderRadius: 12 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {towns.map((town) => (
            <LeafletPolygon
              key={town.id}
              positions={townPolygons[town.id]}
              pathOptions={{ color: polygonColors[town.id], fillColor: polygonColors[town.id], fillOpacity: 0.6 }}
              eventHandlers={{
                click: () => setSelected(town),
              }}
            />
          ))}
          {selected && (
            <Popup
              position={townPolygons[selected.id][0]}
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

  // Web: Use Google Maps iframe and clickable town list
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
