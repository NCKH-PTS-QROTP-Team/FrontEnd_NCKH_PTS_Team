import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import {
  TeacherIcon,
  CalendarIcon,
  BellIcon,
  SettingsIcon,
  LogoutIcon,
  ChevronRightIcon,
  ClipboardIcon,
  ChartIcon,
} from "@/components/Icons";

export default function TeacherProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          // Handle logout logic
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: Colors.white,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: Colors.textHeading,
            textAlign: "center",
          }}
        >
          Tài khoản
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: isMobile ? 100 : 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <TeacherIcon size={40} color={Colors.primary} />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: Colors.textHeading,
              marginBottom: 4,
            }}
          >
            Trần Thị Bình
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.textSecondary,
              marginBottom: 2,
            }}
          >
            Mã GV: GV2021001
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.textSecondary,
            }}
          >
            tranthib@teacher.edu.vn
          </Text>
        </View>

        {/* Stats Grid */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: Colors.textSecondary,
                marginBottom: 8,
              }}
            >
              Tổng lớp
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: Colors.primary,
              }}
            >
              5
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: Colors.textSecondary,
                marginBottom: 8,
              }}
            >
              Tổng sinh viên
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#10B981",
              }}
            >
              182
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/teacher/class-list")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.primary + "15",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <ClipboardIcon size={20} color={Colors.primary} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textHeading,
                fontWeight: "500",
              }}
            >
              Danh sách lớp học
            </Text>
            <ChevronRightIcon size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/teacher/dashboard")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#10B98115",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <CalendarIcon size={20} color="#10B981" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textHeading,
                fontWeight: "500",
              }}
            >
              Lịch dạy
            </Text>
            <ChevronRightIcon size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/teacher/reports")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#F59E0B15",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <ChartIcon size={20} color="#F59E0B" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textHeading,
                fontWeight: "500",
              }}
            >
              Báo cáo & Thống kê
            </Text>
            <ChevronRightIcon size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#8B5CF615",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <BellIcon size={20} color="#8B5CF6" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textHeading,
                fontWeight: "500",
              }}
            >
              Thông báo
            </Text>
            <ChevronRightIcon size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.gray100,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <SettingsIcon size={20} color={Colors.textSecondary} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textHeading,
                fontWeight: "500",
              }}
            >
              Cài đặt
            </Text>
            <ChevronRightIcon size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

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
    </SafeAreaView>
  );
}
