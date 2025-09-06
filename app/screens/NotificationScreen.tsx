import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ButtonPrimary from "../components/ButtonPrimary";

interface Lead {
  name: string;
  location: string;
}

const NotificationScreen: React.FC = () => {
  const router = useRouter();
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [declinedLeads, setDeclinedLeads] = useState<Lead[]>([]);

  // Mock lead (always displayed for demo/testing)
  useEffect(() => {
    const mockLead: Lead = { name: "Lead A", location: "San Francisco" };
    setCurrentLead(mockLead);
  }, []);

  const handleAccept = () => {
    if (!currentLead) return;
    router.push({ pathname: "/screens/LeadDetails", params: currentLead });
    setCurrentLead(null); // clear current notification
  };

  const handleReject = () => {
    if (!currentLead) return;
    setDeclinedLeads((prev) => [...prev, currentLead]);
    setCurrentLead(null); // clear current notification
  };

  return (
    <View style={styles.container}>
      {currentLead ? (
        <>
          <Text style={styles.title}>📢 New Lead Notification</Text>
          <Text style={styles.leadText}>Name: {currentLead.name}</Text>
          <Text style={styles.leadText}>Location: {currentLead.location}</Text>
          <View style={styles.buttonContainer}>
            <ButtonPrimary title="Accept" onPress={handleAccept} />
            <ButtonPrimary title="Reject" onPress={handleReject} />
          </View>
        </>
      ) : (
        <Text style={styles.title}>No active lead</Text>
      )}

      {declinedLeads.length > 0 && (
        <View style={styles.declinedContainer}>
          <Text style={styles.subtitle}>Declined Leads:</Text>
          {declinedLeads.map((lead, idx) => (
            <Text key={idx} style={styles.leadText}>
              {lead.name} ({lead.location})
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  leadText: { fontSize: 18, marginBottom: 10 },
  buttonContainer: { flexDirection: "row", gap: 20, marginTop: 20 },
  declinedContainer: { marginTop: 20, alignItems: "center" },
});

export default NotificationScreen;
