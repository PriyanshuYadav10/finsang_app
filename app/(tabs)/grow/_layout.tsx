import { Stack } from 'expo-router';

export default function GrowLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="category" options={{ headerShown: false }} />
      <Stack.Screen name="poster" options={{ headerShown: false }} />
    </Stack>
  );
} 