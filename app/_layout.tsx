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
          // CDN + đúng font-family của @expo/vector-icons (Vercel không serve /assets/node_modules/...)
          const cdn =
            'https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts';
          await Font.loadAsync({
            anticon: `${cdn}/AntDesign.ttf`,
            entypo: `${cdn}/Entypo.ttf`,
            evilicons: `${cdn}/EvilIcons.ttf`,
            feather: `${cdn}/Feather.ttf`,
            FontAwesome: `${cdn}/FontAwesome.ttf`,
            'FontAwesome5Free-Brand': `${cdn}/FontAwesome5_Brands.ttf`,
            'FontAwesome5Free-Regular': `${cdn}/FontAwesome5_Regular.ttf`,
            'FontAwesome5Free-Solid': `${cdn}/FontAwesome5_Solid.ttf`,
            'FontAwesome6Free-Brands': `${cdn}/FontAwesome6_Brands.ttf`,
            'FontAwesome6Free-Regular': `${cdn}/FontAwesome6_Regular.ttf`,
            'FontAwesome6Free-Solid': `${cdn}/FontAwesome6_Solid.ttf`,
            Fontisto: `${cdn}/Fontisto.ttf`,
            foundation: `${cdn}/Foundation.ttf`,
            ionicons: `${cdn}/Ionicons.ttf`,
            'material-community': `${cdn}/MaterialCommunityIcons.ttf`,
            material: `${cdn}/MaterialIcons.ttf`,
            octicons: `${cdn}/Octicons.ttf`,
            'simple-line-icons': `${cdn}/SimpleLineIcons.ttf`,
            zocial: `${cdn}/Zocial.ttf`,
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
