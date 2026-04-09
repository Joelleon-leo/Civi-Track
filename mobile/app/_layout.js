import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="authority" />
        <Stack.Screen name="create-complaint" />
        <Stack.Screen name="complaint/[id]" />
      </Stack>
    </AuthProvider>
  );
}
