import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#070809' },
          headerStyle: { backgroundColor: '#0D0F11' },
          headerTintColor: '#F8F9FA',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, title: 'Lotus App Builder' }} />
      </Stack>
    </>
  );
}
