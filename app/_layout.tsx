import { Stack } from "expo-router";
import { View } from "react-native";
import { Spinner } from "@/components/Spinner";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
// Temporarily disabled to fix web text node errors
// import '../global.css';

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading time or add actual initialization
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Spinner size={48} color="#3FA9F5" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/verify-otp" />
      <Stack.Screen name="student" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="teacher/dashboard" />
      <Stack.Screen name="teacher/generate-otp" />
      <Stack.Screen name="teacher/generate-qr" />
      <Stack.Screen name="teacher/class-list" />
      <Stack.Screen name="teacher/reports" />
    </Stack>
  );
}

// Updated: 2026-01-02 13:16:05
