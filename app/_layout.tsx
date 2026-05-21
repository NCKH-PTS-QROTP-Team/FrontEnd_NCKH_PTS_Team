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
        if (Platform.OS === 'web') {
          // Load fonts directly from CDN using expo-font to bypass Vercel's node_modules blocking
          await Font.loadAsync({
            AntDesign: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/AntDesign.ttf',
            Entypo: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Entypo.ttf',
            EvilIcons: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/EvilIcons.ttf',
            Feather: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Feather.ttf',
            FontAwesome: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome.ttf',
            FontAwesome5_Brands: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome5_Brands.ttf',
            FontAwesome5_Regular: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome5_Regular.ttf',
            FontAwesome5_Solid: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome5_Solid.ttf',
            FontAwesome6_Brands: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome6_Brands.ttf',
            FontAwesome6_Regular: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome6_Regular.ttf',
            FontAwesome6_Solid: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome6_Solid.ttf',
            Fontisto: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Fontisto.ttf',
            Foundation: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Foundation.ttf',
            Ionicons: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Ionicons.ttf',
            MaterialCommunityIcons: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/MaterialCommunityIcons.ttf',
            MaterialIcons: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/MaterialIcons.ttf',
            Octicons: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Octicons.ttf',
            SimpleLineIcons: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/SimpleLineIcons.ttf',
            Zocial: 'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Zocial.ttf',
          });
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
