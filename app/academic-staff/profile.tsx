import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast, { useToast } from "@/components/Toast";
import { authService } from "@/apis";
import ProfileAndSettings from "@/components/ProfileAndSettings";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      console.error("Error loading user info:", error);
      showToast("Không thể tải thông tin tài khoản", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 32 : isMobile ? 20 : 24,
        }}
      >
        <View
          style={{
            maxWidth: isDesktop ? 1200 : "100%",
            width: "100%",
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              fontSize: isDesktop ? 32 : isMobile ? 24 : 28,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 24,
            }}
          >
            Thông tin tài khoản & Cài đặt
          </Text>

          <ProfileAndSettings
            user={user}
            loading={loading}
            onShowToast={showToast}
          />
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}
