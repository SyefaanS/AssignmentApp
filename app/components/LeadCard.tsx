import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ButtonPrimary from './ButtonPrimary';

export interface Lead {
  id?: string;
  name: string;
  score: number;
  distance?: number;
}

interface LeadCardProps {
  lead: Lead;
  isBest?: boolean;
  onDelete: () => void;
  onEdit: (data: Partial<Lead>) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, isBest = false, onDelete, onEdit }) => {
  return (
    <View style={[styles.card, isBest && styles.bestCard]}>
      <Text style={styles.name}>
        {lead.name} {isBest ? '🏆' : ''}
      </Text>

      <Text style={styles.detail}>
        Distance: {lead.distance != null ? lead.distance.toFixed(2) + ' km' : '–'}
      </Text>

      <Text style={styles.detail}>Match Score: {lead.score}</Text>

      <View style={styles.buttons}>
        <ButtonPrimary
          title="Edit"
          onPress={() => onEdit({})}
          style={{ flex: 1 }}
        />
        <View style={{ width: 10 }} />
        <ButtonPrimary
          title="Delete"
          onPress={onDelete}
          style={{ flex: 1, backgroundColor: '#FF4D4D' }} // vibrant red delete button
        />
      </View>
    </View>
  );
};

export default LeadCard;

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  bestCard: {
    backgroundColor: '#e6ffed',
    borderColor: '#00c851',
    borderWidth: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
