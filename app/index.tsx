import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const routes = [
  { name: 'OCR Capture & Validation', path: '/screens/OCRScreen', icon: '📸' },
  { name: 'Chat AI Interface', path: '/screens/ChatScreen', icon: '🤖' },
  { name: 'Full-Screen Notification', path: '/screens/NotificationScreen', icon: '🔔' },
  { name: 'Location & Nearest Lead', path: '/screens/LocationScreen', icon: '📍' },
  { name: 'Lead Allocation Dashboard', path: '/screens/LeadDashboard', icon: '📊' },
] as const;

const Dashboard: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          Alert.alert('Location Permission', 'Location permission is required for this app.');
        }

        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('Camera Permission', 'Camera permission is required for OCR feature.');
        }

        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaStatus !== 'granted') {
          Alert.alert('Gallery Permission', 'Gallery permission is required to pick images.');
        }
      } catch (err) {
        console.error('Permission request error:', err);
      }
    };

    requestPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Lead Management App</Text>

      <FlatList
        data={routes}
        keyExtractor={(item) => item.path}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(item.path)}
          >
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.card}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardText}>{item.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f7' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  cardText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
    flexShrink: 1,
  },
});

export default Dashboard;
