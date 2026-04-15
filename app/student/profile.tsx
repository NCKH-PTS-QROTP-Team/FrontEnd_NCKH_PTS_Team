import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { LogoutIcon } from "@/components/Icons";
import { authService, attendanceService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";
import ProfileAndSettings from "@/components/ProfileAndSettings";

export default function StudentProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    attendanceRate: 0,
    totalSessions: 0,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load user info
      const userData = await authService.getCurrentUser();
      setUser(userData);

      // Load attendance stats
      const studentId = await getStudentIdFromToken();
      if (studentId) {
        try {
          const records = await attendanceService.getRecords({ studentId });

          // Tính tỷ lệ điểm danh
          const totalSessions = records.length;
          const presentCount = records.filter(
            (r: any) => r.status === "PRESENT" || r.status === "LATE",
          ).length;
          const attendanceRate =
            totalSessions > 0
              ? Math.round((presentCount / totalSessions) * 100)
              : 0;

          setAttendanceStats({
            attendanceRate,
            totalSessions,
          });
        } catch (error) {
          console.error("Error loading attendance stats:", error);
        }
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      showToast("Không thể tải thông tin tài khoản", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
            router.replace("/auth/login");
          } catch (error) {
            console.error("Logout error:", error);
            router.replace("/auth/login");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="dark" />

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: isMobile ? 18 : 24,
          paddingBottom: isMobile ? 120 : 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 48,
            }}
          >
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                marginTop: 16,
              }}
            >
              Đang tải thông tin...
            </Text>
          </View>
        ) : (
          <>
            <ProfileAndSettings
              user={user}
              onShowToast={showToast}
              statsItems={[
                {
                  label: "Tỷ lệ điểm danh",
                  value: `${attendanceStats.attendanceRate}%`,
                  tone: "#10B981",
                },
                {
                  label: "Tổng buổi học",
                  value: attendanceStats.totalSessions,
                  tone: Colors.primary,
                },
                {
                  label: "Mã sinh viên",
                  value: user?.studentId || "N/A",
                  tone: "#1f3d8e",
                },
              ]}
            />
          </>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: Colors.white,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#EF444415",
            marginBottom: 16,
          }}
        >
          <LogoutIcon size={20} color="#EF4444" />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#EF4444",
              marginLeft: 8,
            }}
          >
            Đăng xuất
          </Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text
          style={{
            fontSize: 12,
            color: Colors.textLight,
            textAlign: "center",
          }}
        >
          Phiên bản 1.0.0
        </Text>
      </Animated.ScrollView>

      {/* Toast Notification */}
      <Toast visible={false} message="" type="success" onHide={() => {}} />
    </SafeAreaView>
  );
}
