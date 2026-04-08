import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
// Optional map import depending on platform support
// import MapView, { Marker } from 'react-native-maps';

export default function MapPickerScreen() {
  const router = useRouter();
  const [region, setRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleSelect = () => {
    // In a real app we would pass these back to the previous screen using params or Context
    router.back();
  };

  if (Platform.OS === 'web') {
      return (
          <View className="flex-1 justify-center items-center p-6 bg-slate-50">
             <Text className="text-xl font-bold mb-4">Map view not supported on Web Expo</Text>
             <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-xl" onPress={handleSelect}>
                 <Text className="text-white font-bold">Return to Form</Text>
             </TouchableOpacity>
          </View>
      )
  }

  return (
    <View style={styles.container}>
      {/* 
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={(reg) => setRegion(reg)}
      >
        <Marker coordinate={region} />
      </MapView> 
      */}
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          Selected: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleSelect}>
          <Text style={styles.buttonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
