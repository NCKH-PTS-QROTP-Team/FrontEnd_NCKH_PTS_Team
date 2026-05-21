import { Stack } from "expo-router";
import { View, Platform } from "react-native";
import { Spinner } from "@/components/Spinner";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SocketProvider } from "@/apis/socket/SocketProvider";
import { ToastProvider } from "@/components/ToastProvider";
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
          // Inject vector icons styles from CDN to avoid Vercel omitting the node_modules fonts
          const iconFontStyles = `
            @font-face {
              font-family: 'AntDesign';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/AntDesign.ttf') format('truetype');
            }
            @font-face {
              font-family: 'Entypo';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Entypo.ttf') format('truetype');
            }
            @font-face {
              font-family: 'EvilIcons';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/EvilIcons.ttf') format('truetype');
            }
            @font-face {
              font-family: 'Feather';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Feather.ttf') format('truetype');
            }
            @font-face {
              font-family: 'FontAwesome';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome.ttf') format('truetype');
            }
            @font-face {
              font-family: 'FontAwesome5_Brands';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome5_Brands.ttf') format('truetype');
            }
            @font-face {
              font-family: 'FontAwesome5_Regular';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome5_Regular.ttf') format('truetype');
            }
            @font-face {
              font-family: 'FontAwesome5_Solid';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome5_Solid.ttf') format('truetype');
            }
            @font-face {
              font-family: 'FontAwesome6_Brands';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome6_Brands.ttf') format('truetype');
            }
            @font-face {
              font-family: 'FontAwesome6_Regular';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome6_Regular.ttf') format('truetype');
            }
            @font-face {
              font-family: 'FontAwesome6_Solid';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/FontAwesome6_Solid.ttf') format('truetype');
            }
            @font-face {
              font-family: 'Fontisto';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Fontisto.ttf') format('truetype');
            }
            @font-face {
              font-family: 'Foundation';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Foundation.ttf') format('truetype');
            }
            @font-face {
              font-family: 'Ionicons';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Ionicons.ttf') format('truetype');
            }
            @font-face {
              font-family: 'MaterialCommunityIcons';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/MaterialCommunityIcons.ttf') format('truetype');
            }
            @font-face {
              font-family: 'MaterialIcons';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/MaterialIcons.ttf') format('truetype');
            }
            @font-face {
              font-family: 'Octicons';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Octicons.ttf') format('truetype');
            }
            @font-face {
              font-family: 'SimpleLineIcons';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/SimpleLineIcons.ttf') format('truetype');
            }
            @font-face {
              font-family: 'Zocial';
              src: url('https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Zocial.ttf') format('truetype');
            }
          `;

          const style = document.createElement('style');
          style.type = 'text/css';
          if ((style as any).styleSheet) {
            (style as any).styleSheet.cssText = iconFontStyles;
          } else {
            style.appendChild(document.createTextNode(iconFontStyles));
          }
          document.head.appendChild(style);
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
