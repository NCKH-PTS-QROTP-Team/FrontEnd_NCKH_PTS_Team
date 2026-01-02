import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/verify-otp" />
      <Stack.Screen name="student/home" />
      <Stack.Screen name="student/otp-attendance" />
      <Stack.Screen name="student/qr-attendance" />
      <Stack.Screen name="student/schedule" />
      <Stack.Screen name="student/history" />
      <Stack.Screen name="teacher/dashboard" />
      <Stack.Screen name="teacher/generate-otp" />
      <Stack.Screen name="teacher/generate-qr" />
      <Stack.Screen name="teacher/class-list" />
      <Stack.Screen name="teacher/reports" />
    </Stack>
  );
}


// Updated: 2026-01-02 13:16:05
