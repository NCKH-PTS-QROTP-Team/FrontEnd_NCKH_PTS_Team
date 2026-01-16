import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { mockSchedules } from "@/constants/mockData";
import WeeklySchedule from "@/components/WeeklySchedule";

export default function StudentHomeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const todaySchedules = mockSchedules.filter((s) => s.status !== "completed");
  const isWeb = Platform.OS === "web";

  // Responsive breakpoints - Dynamic based on window size
  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;

  // Responsive values - Match Figma exactly
  const contentMaxWidth = isDesktop ? 800 : "100%";
  const padding = isMobile ? 16 : isTablet ? 20 : 0;

  // Quick action cards: Mobile 2 cards in row, Desktop 384px each with 32px gap
  const quickActionGap = isMobile ? 8 : isDesktop ? 32 : 16;

  // Stats cards: Mobile 2x2 grid, Desktop 256px each with 16px gap
  const statsGap = isMobile ? 8 : isDesktop ? 16 : 12;

  const content = (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: isDesktop ? 20 : 16,
          paddingBottom: isMobile ? 100 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Content with padding */}
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: padding,
          }}
        >
          {/* Welcome Card */}
          <View
            style={{
              width: "100%",
              minHeight: isMobile ? 140 : 160,
              backgroundColor: "#3FA9F5",
              borderRadius: isMobile ? 12 : 16,
              padding: isMobile ? 20 : 24,
              marginBottom: isMobile ? 16 : 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: isMobile ? 20 : 24,
                fontWeight: "bold",
                lineHeight: isMobile ? 28 : 32,
                marginBottom: 6,
              }}
            >
              Xin chào!
            </Text>
            <Text
              style={{
                color: "#DBEAFE",
                fontSize: isMobile ? 14 : 16,
                lineHeight: isMobile ? 20 : 24,
                marginBottom: isMobile ? 12 : 16,
              }}
            >
              Hôm nay bạn có {todaySchedules.length} buổi học
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/student/schedule")}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: isMobile ? 8 : 12,
                width: isMobile ? 120 : 140,
                height: isMobile ? 36 : 40,
                justifyContent: "center",
                alignItems: "center",
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: "600",
                  color: "#3FA9F5",
                  lineHeight: 21,
                }}
              >
                Xem lịch học →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions - 2 cards in row on mobile */}
          <View style={{ marginBottom: isMobile ? 16 : 40 }}>
            <Text
              style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: "bold",
                color: "#111827",
                lineHeight: 28,
                marginBottom: isMobile ? 12 : 16,
              }}
            >
              Điểm danh nhanh
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: quickActionGap,
              }}
            >
              {/* OTP Card */}
              <TouchableOpacity
                onPress={() => router.push("/student/otp-attendance")}
                style={{
                  flex: 1,
                  minHeight: isMobile ? 120 : 160,
                  backgroundColor: "#FFFFFF",
                  borderRadius: isMobile ? 12 : 16,
                  padding: isMobile ? 16 : 20,
                  borderWidth: 2,
                  borderColor: "#DBEAFE",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: "#DBEAFE",
                    borderRadius: isMobile ? 10 : 12,
                    width: isMobile ? 40 : 48,
                    height: isMobile ? 40 : 48,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isMobile ? 8 : 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 18 : 24,
                      fontWeight: "bold",
                      color: "#3FA9F5",
                      lineHeight: isMobile ? 24 : 32,
                    }}
                  >
                    OTP
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    fontWeight: "bold",
                    color: "#111827",
                    lineHeight: isMobile ? 20 : 24,
                    marginBottom: 4,
                  }}
                >
                  Mã OTP
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    color: "#6B7280",
                    lineHeight: isMobile ? 18 : 21,
                  }}
                >
                  Nhập mã từ GV
                </Text>
              </TouchableOpacity>

              {/* QR Card */}
              <TouchableOpacity
                onPress={() => router.push("/student/qr-attendance")}
                style={{
                  flex: 1,
                  minHeight: isMobile ? 120 : 160,
                  backgroundColor: "#FFFFFF",
                  borderRadius: isMobile ? 12 : 16,
                  padding: isMobile ? 16 : 20,
                  borderWidth: 2,
                  borderColor: "#D1FAE5",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: "#D1FAE5",
                    borderRadius: isMobile ? 10 : 12,
                    width: isMobile ? 40 : 48,
                    height: isMobile ? 40 : 48,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isMobile ? 8 : 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 16 : 22,
                      fontWeight: "bold",
                      color: "#10B981",
                      lineHeight: isMobile ? 24 : 28,
                    }}
                  >
                    QR
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    fontWeight: "bold",
                    color: "#111827",
                    lineHeight: isMobile ? 20 : 24,
                    marginBottom: 4,
                  }}
                >
                  QR Code
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    color: "#6B7280",
                    lineHeight: isMobile ? 18 : 21,
                  }}
                >
                  Quét mã trên lớp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Weekly Schedule Table - Full width without padding */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: isDesktop ? 24 : padding,
            marginBottom: isMobile ? 16 : 40,
          }}
        >
          <WeeklySchedule />
        </View>

        {/* Content with padding continues */}
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: padding,
          }}
        >
          {/* Stats - 2x2 grid on mobile */}
          <View style={{ marginBottom: isMobile ? 16 : 40 }}>
            <Text
              style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: "bold",
                color: "#111827",
                lineHeight: 28,
                marginBottom: isMobile ? 12 : 16,
              }}
            >
              Thống kê tuần này
            </Text>

            {/* First row: Tổng buổi + Có mặt */}
            <View
              style={{
                flexDirection: "row",
                gap: statsGap,
                marginBottom: statsGap,
              }}
            >
              {/* Tổng buổi */}
              <View
                style={{
                  flex: 1,
                  minHeight: isMobile ? 100 : 120,
                  backgroundColor: "#FFFFFF",
                  borderRadius: isMobile ? 8 : 12,
                  padding: isMobile ? 12 : 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    color: "#6B7280",
                    lineHeight: 21,
                    marginBottom: isMobile ? 4 : 8,
                  }}
                >
                  Tổng buổi
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 28 : 36,
                    fontWeight: "600",
                    color: "#3FA9F5",
                    lineHeight: isMobile ? 32 : 40,
                  }}
                >
                  12
                </Text>
              </View>

              {/* Có mặt */}
              <View
                style={{
                  flex: 1,
                  minHeight: isMobile ? 100 : 120,
                  backgroundColor: "#FFFFFF",
                  borderRadius: isMobile ? 8 : 12,
                  padding: isMobile ? 12 : 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    color: "#6B7280",
                    lineHeight: 21,
                    marginBottom: isMobile ? 4 : 8,
                  }}
                >
                  Có mặt
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 28 : 36,
                    fontWeight: "600",
                    color: "#10B981",
                    lineHeight: isMobile ? 32 : 40,
                  }}
                >
                  10
                </Text>
              </View>
            </View>

            {/* Second row: Đi muộn + Vắng */}
            <View
              style={{
                flexDirection: "row",
                gap: statsGap,
              }}
            >
              {/* Đi muộn */}
              <View
                style={{
                  flex: 1,
                  minHeight: isMobile ? 100 : 120,
                  backgroundColor: "#FFFFFF",
                  borderRadius: isMobile ? 8 : 12,
                  padding: isMobile ? 12 : 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    color: "#6B7280",
                    lineHeight: 21,
                    marginBottom: isMobile ? 4 : 8,
                  }}
                >
                  Đi muộn
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 28 : 36,
                    fontWeight: "600",
                    color: "#F59E0B",
                    lineHeight: isMobile ? 32 : 40,
                  }}
                >
                  2
                </Text>
              </View>

              {/* Vắng */}
              <View
                style={{
                  flex: 1,
                  minHeight: isMobile ? 100 : 120,
                  backgroundColor: "#FFFFFF",
                  borderRadius: isMobile ? 8 : 12,
                  padding: isMobile ? 12 : 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    color: "#6B7280",
                    lineHeight: 21,
                    marginBottom: isMobile ? 4 : 8,
                  }}
                >
                  Vắng
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 28 : 36,
                    fontWeight: "600",
                    color: "#EF4444",
                    lineHeight: isMobile ? 32 : 40,
                  }}
                >
                  0
                </Text>
              </View>
            </View>
          </View>

          {/* Today's Schedule */}
          <View style={{ marginBottom: isMobile ? 16 : 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: isMobile ? 12 : 16,
              }}
            >
              <Text
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: "bold",
                  color: "#111827",
                  lineHeight: 28,
                }}
              >
                Lịch học hôm nay
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/student/schedule")}
              >
                <Text
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: "600",
                    color: "#3FA9F5",
                    lineHeight: 21,
                  }}
                >
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>

            {todaySchedules.length > 0 ? (
              <View>
                {todaySchedules.slice(0, 2).map((schedule, index) => (
                  <TouchableOpacity
                    key={schedule.id}
                    onPress={() => router.push("/student/otp-attendance")}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: isMobile ? 8 : 12,
                      padding: isMobile ? 16 : 24,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      minHeight: isMobile ? 100 : 120,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                      marginBottom:
                        index < todaySchedules.slice(0, 2).length - 1
                          ? isMobile
                            ? 12
                            : 16
                          : 0,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: isMobile ? 15 : 18,
                        fontWeight: "600",
                        color: "#111827",
                        lineHeight: isMobile ? 22 : 28,
                        marginBottom: 4,
                      }}
                    >
                      {schedule.courseName || ""}
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        color: "#6B7280",
                        lineHeight: 21,
                        marginBottom: isMobile ? 8 : 12,
                      }}
                    >
                      {schedule.teacher || ""}
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 2,
                          height: isMobile ? 20 : 24,
                          backgroundColor: "#3FA9F5",
                          borderRadius: 1,
                          marginRight: isMobile ? 8 : 12,
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            fontSize: isMobile ? 14 : 16,
                            color: "#111827",
                            lineHeight: isMobile ? 20 : 24,
                            marginBottom: 2,
                          }}
                        >
                          {schedule.time || ""}
                        </Text>
                        <Text
                          style={{
                            fontSize: isMobile ? 12 : 14,
                            color: "#6B7280",
                            lineHeight: 21,
                          }}
                        >
                          Phòng: {schedule.room || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: isMobile ? 12 : 16,
                  padding: isMobile ? 24 : 32,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                <View
                  style={{
                    width: isMobile ? 48 : 60,
                    height: isMobile ? 48 : 60,
                    backgroundColor: "#F3F4F6",
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{ fontSize: isMobile ? 24 : 28, color: "#6B7280" }}
                  >
                    ☰
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    color: "#6B7280",
                    lineHeight: 21,
                  }}
                >
                  Không có lịch học hôm nay
                </Text>
              </View>
            )}
          </View>

          {/* History Link */}
          <TouchableOpacity
            onPress={() => router.push("/student/history")}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: isMobile ? 12 : 16,
              padding: isMobile ? 14 : 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              height: isMobile ? 56 : 64,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: isMobile ? 36 : 40,
                  height: isMobile ? 36 : 40,
                  backgroundColor: "#F3F4F6",
                  borderRadius: isMobile ? 10 : 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: isMobile ? 10 : 12,
                }}
              >
                <Text
                  style={{ fontSize: isMobile ? 16 : 18, color: "#6B7280" }}
                >
                  ☰
                </Text>
              </View>
              <Text
                style={{
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: "600",
                  color: "#111827",
                  lineHeight: 24,
                }}
              >
                Lịch sử điểm danh
              </Text>
            </View>
            <Text style={{ fontSize: isMobile ? 18 : 20, color: "#9CA3AF" }}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return content;
}
