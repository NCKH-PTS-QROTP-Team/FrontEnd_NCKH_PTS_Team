import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import {
  TeacherIcon,
  LogoutIcon,
  ChevronRightIcon,
  ClipboardIcon,
  ChartIcon,
  BellIcon,
  CalendarIcon,
} from "@/components/Icons";
import { authService } from "@/apis/services/auth.service";
import {
  reportService,
  type TeacherSummary,
} from "@/apis/services/report.service";
import ProfileAndSettings from "@/components/ProfileAndSettings";
import Toast, { useToast } from "@/components/Toast";

export default function TeacherProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { showToast } = useToast();

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

  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = isMobile ? 320 : 290;
  const HEADER_MIN_HEIGHT = isMobile ? 120 : HEADER_MAX_HEIGHT;
  const HEADER_SCROLL_DISTANCE = Math.max(
    1,
    HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
  );

  const headerHeight = isMobile
    ? scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: "clamp",
      })
    : HEADER_MAX_HEIGHT;

  const contentOpacity = isMobile
    ? scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0.2, 0],
        extrapolate: "clamp",
      })
    : 1;

  const contentTranslateY = isMobile
    ? scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -10],
        extrapolate: "clamp",
      })
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar style="light" />

      {/* ── Purple Hero Header ── */}
      <Animated.View
        style={{
          backgroundColor: "#8B5CF6", // Purple theme
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
          shadowColor: "#8B5CF6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "rgba(255,255,255,0.8)",
            marginBottom: 16,
          }}
        >
          Tài khoản
        </Text>
        <Animated.View
          style={{
            alignItems: "center",
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
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
            <TeacherIcon size={40} color="#fff" />
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#ffffff",
              marginBottom: 4,
            }}
          >
            {userInfo?.name || "Trần Thị Bình"}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
              marginBottom: 2,
            }}
          >
            Mã GV: {userInfo?.username || "GV2021001"}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {userInfo?.email || "tranthib@teacher.edu.vn"}
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: HEADER_MAX_HEIGHT + 24,
          paddingBottom: isMobile ? 100 : 32,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <ProfileAndSettings
          user={userInfo}
          onShowToast={showToast}
          headerContent={
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
                    Tổng lớp
                  </Text>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "bold",
                      color: Colors.primary,
                    }}
                  >
                    {summary?.totalClasses || 0}
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
                    {summary?.totalStudents || 0}
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
              </View>
            </>
          }
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
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
