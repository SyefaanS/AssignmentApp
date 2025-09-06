import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface ChatLead {
  name: string;
  location: string;
  score: number;
}

interface Props {
  lead: ChatLead;
}

const ChatCard: React.FC<Props> = ({ lead }) => (
  <View style={[styles.card, lead.score > 80 && styles.highlight]}>
    <Text style={styles.name}>{lead.name}</Text>
    <Text>Location: {lead.location}</Text>
    <Text>Match Score: {lead.score}%</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  highlight: { borderColor: "green", borderWidth: 2 },
  name: { fontWeight: "bold", fontSize: 16 },
});

export default ChatCard;
