import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

// Haversine formula to calculate distance in KM
const getDistanceKm = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
};

export default function LeafletMap() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [dynamicLeads, setDynamicLeads] = useState<
    { name: string; latitude: number; longitude: number; distance?: number }[]
  >([]);
  const [nearestLead, setNearestLead] = useState<any>(null);

  const webviewRef = useRef<any>(null);

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    const firstCoords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    setCoords(firstCoords);

    // Generate sample leads around the user dynamically
    const nearbyLeads = [
      {
        name: "Lead A",
        latitude: firstCoords.lat + 0.002,
        longitude: firstCoords.lng + 0.002,
      },
      {
        name: "Lead B",
        latitude: firstCoords.lat - 0.003,
        longitude: firstCoords.lng + 0.001,
      },
      {
        name: "Lead C",
        latitude: firstCoords.lat + 0.001,
        longitude: firstCoords.lng - 0.003,
      },
    ];
    updateLeadsWithDistance(firstCoords, nearbyLeads);

    // Auto update every 2 min / 50 meters
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 120000,
        distanceInterval: 50,
      },
      (l) => {
        const newCoords = { lat: l.coords.latitude, lng: l.coords.longitude };
        setCoords(newCoords);
        updateLeadsWithDistance(newCoords, nearbyLeads);
      }
    );
  };

  const updateLeadsWithDistance = (
    coords: { lat: number; lng: number },
    leads: { name: string; latitude: number; longitude: number }[]
  ) => {
    const leadsWithDistance = leads.map((lead) => ({
      ...lead,
      distance: getDistanceKm(
        { latitude: coords.lat, longitude: coords.lng }, // ✅ FIXED
        { latitude: lead.latitude, longitude: lead.longitude }
      ),
    }));

    // Sort nearest-first
    leadsWithDistance.sort((a, b) => a.distance! - b.distance!);
    setDynamicLeads(leadsWithDistance);
    setNearestLead(leadsWithDistance[0]);
  };

  // Function to recenter map when pressing button
  const recenterMap = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    const newCoords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    setCoords(newCoords);
    updateLeadsWithDistance(newCoords, dynamicLeads);

    if (webviewRef.current) {
      const jsCode = `
        map.setView([${newCoords.lat}, ${newCoords.lng}], 15);
        if (window.userMarker) map.removeLayer(window.userMarker);
        window.userMarker = L.marker([${newCoords.lat}, ${newCoords.lng}])
          .addTo(map)
          .bindPopup("📍 You are here")
          .openPopup();
      `;
      webviewRef.current.injectJavaScript(jsCode);
    }
  };

  if (!coords) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${coords.lat}, ${coords.lng}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          window.userMarker = L.marker([${coords.lat}, ${coords.lng}])
            .addTo(map)
            .bindPopup("📍 You are here")
            .openPopup();

          ${dynamicLeads
            .map(
              (lead) =>
                `L.marker([${lead.latitude}, ${lead.longitude}]).addTo(map).bindPopup("${lead.name}");`
            )
            .join("")}
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        style={styles.webview}
      />

      {/* Lead cards */}
      <FlatList
        data={dynamicLeads}
        keyExtractor={(item) => item.name}
        style={styles.cardList}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.leadName}>{item.name}</Text>
            <Text style={styles.distance}>
              {item.distance?.toFixed(2)} km away
            </Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={recenterMap}>
        <Text style={styles.fabText}>📍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  cardList: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginLeft: "2%",
  },
  leadName: { fontSize: 16, fontWeight: "bold" },
  distance: { fontSize: 14, marginTop: 5 },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  fabText: { fontSize: 24, color: "white" },
});
