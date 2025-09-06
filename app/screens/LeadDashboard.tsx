import React, { useState, useEffect } from "react";
import { ScrollView, FlatList, Text, Alert, View, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import InputField from "../components/InputField";
import ButtonPrimary from "../components/ButtonPrimary";
import LeadCard, { Lead } from "../components/LeadCard";
import { getDistanceKm } from "../utils/distance";

const STORAGE_KEY = "@leads_storage";

interface LeadWithId extends Lead {
  id: string;
  latitude: number;
  longitude: number;
}

const LeadDashboard: React.FC = () => {
  const [leads, setLeads] = useState<LeadWithId[]>([]);
  const [sortBy, setSortBy] = useState<"score" | "distance">("score");
  const [filterHighScore, setFilterHighScore] = useState(true);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [newLead, setNewLead] = useState({
    name: "",
    latitude: "",
    longitude: "",
    score: "",
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Load leads from storage
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setLeads(JSON.parse(stored));
    })();
  }, []);

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        return Alert.alert("Permission denied", "Cannot access location");
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  const saveLeads = async (updated: LeadWithId[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setLeads(updated);
  };

  const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const addLead = () => {
    if (!newLead.name || !newLead.score) return;

    let lat: number, lon: number;

    if (useCurrentLocation) {
      if (!userLocation)
        return Alert.alert(
          "Location not available",
          "Please allow location access"
        );
      lat = userLocation.latitude;
      lon = userLocation.longitude;
    } else {
      if (!newLead.latitude || !newLead.longitude)
        return Alert.alert("Invalid input", "Enter latitude & longitude");
      lat = parseFloat(newLead.latitude);
      lon = parseFloat(newLead.longitude);
    }

    const score = parseInt(newLead.score);

    const duplicate = leads.find(
      (l) =>
        l.name.toLowerCase() === newLead.name.toLowerCase() ||
        (l.latitude === lat && l.longitude === lon)
    );
    if (duplicate)
      return Alert.alert(
        "Duplicate Lead",
        "Lead with same name or location exists."
      );

    const lead: LeadWithId = {
      id: generateId(),
      name: newLead.name,
      latitude: lat,
      longitude: lon,
      score,
    };

    saveLeads([...leads, lead]);
    setNewLead({ name: "", latitude: "", longitude: "", score: "" });
  };

  const deleteLead = (id: string) => {
    Alert.alert("Delete Lead", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => saveLeads(leads.filter((l) => l.id !== id)),
      },
    ]);
  };

  const editLead = (id: string, updatedData: Partial<Lead>) => {
    saveLeads(leads.map((l) => (l.id === id ? { ...l, ...updatedData } : l)));
  };

  // Display leads with distance from user
  const displayed = leads
    .filter((l) => !filterHighScore || l.score > 70)
    .map((l) => ({
      ...l,
      distance: userLocation
        ? getDistanceKm(userLocation, {
            latitude: l.latitude,
            longitude: l.longitude,
          })
        : 0,
    }))
    .sort((a, b) =>
      sortBy === "score" ? b.score - a.score : a.distance - b.distance
    );

  const bestLead = displayed[0];

  return (
    <ScrollView style={{ padding: 15 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
        Add New Lead
      </Text>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <Text>Use Current Location</Text>
        <Switch
          value={useCurrentLocation}
          onValueChange={setUseCurrentLocation}
          style={{ marginLeft: 10 }}
        />
      </View>

      <InputField
        placeholder="Name"
        value={newLead.name}
        onChangeText={(t) => setNewLead({ ...newLead, name: t })}
      />
      {!useCurrentLocation && (
        <>
          <InputField
            placeholder="Latitude"
            value={newLead.latitude}
            onChangeText={(t) => setNewLead({ ...newLead, latitude: t })}
            keyboardType="numeric"
          />
          <InputField
            placeholder="Longitude"
            value={newLead.longitude}
            onChangeText={(t) => setNewLead({ ...newLead, longitude: t })}
            keyboardType="numeric"
          />
        </>
      )}
      <InputField
        placeholder="Match Score"
        value={newLead.score}
        onChangeText={(t) => setNewLead({ ...newLead, score: t })}
        keyboardType="numeric"
      />

      <ButtonPrimary title="Add Lead" onPress={addLead} />

      <View style={{ marginVertical: 10 }}>
        <ButtonPrimary
          title={`Sort by ${sortBy === "score" ? "Distance" : "Score"}`}
          onPress={() => setSortBy(sortBy === "score" ? "distance" : "score")}
        />
      </View>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <Text>Filter: Score {">"} 70</Text>
        <Switch
          value={filterHighScore}
          onValueChange={setFilterHighScore}
          style={{ marginLeft: 10 }}
        />
      </View>

      <Text style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}>
        Leads
      </Text>
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LeadCard
            lead={item}
            isBest={item.id === bestLead?.id}
            onDelete={() => deleteLead(item.id)}
            onEdit={(d) => editLead(item.id, d)}
          />
        )}
      />
    </ScrollView>
  );
};

export default LeadDashboard;
