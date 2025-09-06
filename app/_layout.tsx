import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="screens/OCRScreen" />
      <Stack.Screen name="screens/ChatScreen" />
      <Stack.Screen name="screens/NotificationScreen" />
      <Stack.Screen name="screens/LocationScreen" />
      <Stack.Screen name="screens/LeadDashboard" />
      <Stack.Screen name="screens/LeadDetails" />
    </Stack>
  );
}
