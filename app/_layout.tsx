import { Stack } from "expo-router";
import { View, Platform } from "react-native";
import { Spinner } from "@/components/Spinner";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SocketProvider } from "@/apis/socket/SocketProvider";
import { ToastProvider } from "@/components/ToastProvider";
import * as Font from 'expo-font';

// Temporarily disabled to fix web text node errors
// import '../global.css';

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        if (Platform.OS === "web") {
          // Backup: +html.tsx đã inject @font-face "ionicons" trước khi React chạy
          const ioniconsUrl =
            "https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Ionicons.ttf";
          if (!Font.isLoaded("ionicons")) {
            await Font.loadAsync({
              ionicons: { uri: ioniconsUrl },
            });
          }
        }
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
    <ToastProvider>
    <SocketProvider autoConnect={false}>
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
        <Stack.Screen name="teacher" options={{ headerShown: false }} />
        <Stack.Screen name="department" options={{ headerShown: false }} />
      </Stack>
    </SocketProvider>
    </ToastProvider>
  );
}

// Updated: 2026-01-02 13:16:05
