import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { LogoutIcon } from "@/components/Icons";
import { authService } from "@/apis/services/auth.service";
import {
  reportService,
  type TeacherSummary,
} from "@/apis/services/report.service";
import ProfileAndSettings from "@/components/ProfileAndSettings";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog, { useConfirmDialog } from "@/components/ConfirmDialog";

export default function TeacherProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { showToast } = useToast();

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
        } catch (e) {
          // Ignore
        }
        router.replace("/auth/login");
      },
    });
  };

  const [userInfo, setUserInfo] = useState<any>(null);
  const [summary, setSummary] = useState<TeacherSummary | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tokenUser = await authService.getCurrentUser();
        if (tokenUser) setUserInfo(tokenUser);

        const summaryData = await reportService.getTeacherSummary();
        setSummary(summaryData);
      } catch (error) {
        console.error("Failed to load user info or summary:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: isMobile ? 18 : 24,
          paddingBottom: isMobile ? 100 : 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileAndSettings
          user={userInfo}
          onShowToast={showToast}
          statsItems={[
            {
              label: "Tổng lớp",
              value: summary?.totalClasses || 0,
              tone: Colors.primary,
            },
            {
              label: "Tổng sinh viên",
              value: summary?.totalStudents || 0,
              tone: "#10B981",
            },
            {
              label: "Tỷ lệ điểm danh TB",
              value: `${Math.round(summary?.averageAttendanceRate || 0)}%`,
              tone: "#1f3d8e",
            },
          ]}
        />

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
      </ScrollView>
      <ConfirmDialog {...dialogProps} />
    </SafeAreaView>
  );
}
