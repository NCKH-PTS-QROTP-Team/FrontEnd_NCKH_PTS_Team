import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ProfileAndSettings from "@/components/ProfileAndSettings";
import Toast, { useToast } from "@/components/Toast";
import { authService } from "@/apis/services/auth.service";

export default function DepartmentProfile() {
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

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { padding: 0 }]}
      contentContainerStyle={{ padding: 0, paddingBottom: 100 }}
    >
      <View style={{ padding: 16 }}>
        <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#0F172A",
              marginBottom: 8,
            }}
          >
            Hồ sơ giáo vụ
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#64748B",
              marginBottom: 16,
            }}
          >
            Cập nhật thông tin tài khoản và các cài đặt bảo mật.
          </Text>

          <ProfileAndSettings user={userInfo} onShowToast={showToast} />

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
    marginLeft: 8,
  },
});
