import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerShadowVisible: false,
      headerTintColor: '#1a202c',
      headerTitleStyle: {
        fontWeight: '900',
        fontSize: 20,
      },
      contentStyle: {
        backgroundColor: '#fff'
      }
    }}>
      <Stack.Screen name="login" options={{ title: 'Sign In', headerShown: false }} />
      <Stack.Screen name="index" options={{ title: 'Glauco-Guard' }} />
      <Stack.Screen name="scan" options={{ title: 'Analyze Scan' }} />
      <Stack.Screen name="results" options={{ title: 'Medical Report', presentation: 'card' }} />
    </Stack>
  );
}
