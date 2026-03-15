import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import {
  UserIcon,
  CalendarIcon,
  BellIcon,
  SettingsIcon,
  LogoutIcon,
  ChevronRightIcon,
} from "@/components/Icons";
import { authService, attendanceService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";

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
            (r: any) => r.status === "PRESENT" || r.status === "LATE"
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

  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = isMobile ? 320 : 290;
  const HEADER_MIN_HEIGHT = isMobile ? 120 : HEADER_MAX_HEIGHT;
  const HEADER_SCROLL_DISTANCE = Math.max(1, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT);

  const headerHeight = isMobile ? scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  }) : HEADER_MAX_HEIGHT;

  const contentOpacity = isMobile ? scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.2, 0],
    extrapolate: "clamp",
  }) : 1;

  const contentTranslateY = isMobile ? scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -10],
    extrapolate: "clamp",
  }) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="light" />

      {/* ── Blue Hero Header ── */}
      <Animated.View
        style={{
          backgroundColor: "#3b82f6", // Blue theme
          paddingTop: isMobile ? 48 : 64,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          zIndex: 10,
          overflow: "hidden",
          shadowColor: "#3b82f6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>
          Tài khoản
        </Text>
        <Animated.View
          style={{
            alignItems: "center",
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }]
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <UserIcon size={40} color="#fff" />
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#ffffff",
              marginBottom: 4,
            }}
          >
            {user?.name || "N/A"}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
              marginBottom: 2,
            }}
          >
            MSSV: {user?.studentId || "N/A"}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {user?.email || "N/A"}
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: HEADER_MAX_HEIGHT + 24,
          paddingBottom: isMobile ? 120 : 32,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
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
                  Tỷ lệ điểm danh
                </Text>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#10B981",
                  }}
                >
                  {attendanceStats.attendanceRate}%
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
                  Tổng buổi điểm danh
                </Text>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: Colors.primary,
                  }}
                >
                  {attendanceStats.totalSessions}
                </Text>
              </View>
            </View>
          </>
        )}

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
              <UserIcon size={20} color={Colors.primary} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textHeading,
                fontWeight: "500",
              }}
            >
              Thông tin cá nhân
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
              Lịch học của tôi
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
                backgroundColor: "#F59E0B15",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <BellIcon size={20} color="#F59E0B" />
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
            <View
              style={{
                backgroundColor: "#EF4444",
                borderRadius: 10,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginRight: 8,
              }}
            >
              <Text
                style={{ fontSize: 11, color: Colors.white, fontWeight: "600" }}
              >
                3
              </Text>
            </View>
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
            onPress={() => router.push("/student/register-face")}
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
              <UserIcon size={20} color="#8B5CF6" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: Colors.textHeading,
                fontWeight: "500",
              }}
            >
              Đăng ký nhận diện khuôn mặt
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
      </Animated.ScrollView>

      {/* Toast Notification */}
      <Toast
        visible={false}
        message=""
        type="success"
        onHide={() => { }}
      />
    </SafeAreaView>
  );
}
