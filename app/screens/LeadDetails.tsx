import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ButtonPrimary from '../components/ButtonPrimary';

const LeadDetails: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; location?: string; score?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Lead Details</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{params.name || 'Unknown'}</Text>

        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{params.location || 'Unknown'}</Text>

        {params.score && (
          <>
            <Text style={styles.label}>Match Score:</Text>
            <Text style={styles.value}>{params.score}%</Text>
          </>
        )}
      </View>

      <ButtonPrimary title="Go Back" onPress={() => router.back()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, elevation: 3 },
  label: { fontWeight: 'bold', marginTop: 10 },
  value: { fontSize: 16, marginBottom: 5 },
});

export default LeadDetails;
