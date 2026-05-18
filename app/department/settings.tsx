import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ProfileAndSettings from "@/components/ProfileAndSettings";
import { useToast } from "@/components/ToastProvider";
import { authService } from "@/apis/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import ConfirmDialog, { useConfirmDialog } from "@/components/ConfirmDialog";

export default function DepartmentSettingsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tokenUser = await authService.getCurrentUser();
        if (tokenUser) setUserInfo(tokenUser);
      } catch (error) {
        console.error("Failed to load user info:", error);
      }
    };

    fetchUserData();
  }, []);

  const { confirm, dialogProps } = useConfirmDialog();

  const handleLogout = () => {
    confirm({
      title: "Đăng xuất",
      message: "Bạn có chắc chắn muốn đăng xuất?",
      confirmText: "Đăng xuất",
      variant: "danger",
      onConfirm: async () => {
        try {
          await authService.logout();
        } catch (e) {}
        router.replace("/auth/login");
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "800",
              color: "#0F172A",
              marginBottom: 8,
            }}
          >
            Cài đặt giáo vụ khoa
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#64748B",
              marginBottom: 18,
            }}
          >
            Quản lý hồ sơ, bảo mật tài khoản và truy cập nhanh theo vai trò.
          </Text>

          <ProfileAndSettings user={userInfo} onShowToast={showToast} />

          <TouchableOpacity
            style={{
              marginTop: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#FECACA",
              backgroundColor: "#fff",
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 15 }}>
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ConfirmDialog {...dialogProps} />
    </View>
  );
}
