import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

const ButtonPrimary: React.FC<Props> = ({ title, onPress, style }) => (
  <TouchableOpacity style={[styles.wrapper, style]} activeOpacity={0.8} onPress={onPress}>
    <LinearGradient
      colors={['#ff6a00', '#ee0979']} // vibrant orange-pink gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.button}
    >
      <Text style={styles.text}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 50, // pill shape
    marginVertical: 8,
    shadowColor: '#ff6a00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 50, // pill shape
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ButtonPrimary;
