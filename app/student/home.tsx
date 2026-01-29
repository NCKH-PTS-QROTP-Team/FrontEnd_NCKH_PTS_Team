import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ImageBackground,
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

  // State cho carousel lịch học
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);

  // Auto-rotate lịch học mỗi 3 giây
  useEffect(() => {
    if (todaySchedules.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentScheduleIndex((prev) =>
        prev === todaySchedules.length - 1 ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [todaySchedules.length]);

  // Responsive breakpoints - Dynamic based on window size
  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;

  // Responsive values - Optimized for web
  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const padding = isMobile ? 16 : isTablet ? 24 : 32;

  // Quick action cards: Desktop 3-4 columns, Mobile 2 cards in row
  const quickActionGap = isMobile ? 12 : isDesktop ? 24 : 16;

  // Stats cards: Desktop 4 columns, Mobile 2x2 grid
  const statsGap = isMobile ? 12 : isDesktop ? 20 : 16;

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
          <ImageBackground
            source={require("@/assets/student_banner.png")}
            style={{
              width: "100%",
              minHeight: isDesktop ? 220 : isMobile ? 140 : 180,
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: isMobile ? 20 : 32,
            }}
            imageStyle={{
              borderRadius: 12,
            }}
            resizeMode="cover"
          >
            <View
              style={{
                flex: 1,
                padding: isDesktop ? 32 : isMobile ? 20 : 24,
                // backgroundColor: "rgba(63, 169, 245, 0.85)",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: isDesktop ? 28 : isMobile ? 20 : 24,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                Xin chào!
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  opacity: 0.9,
                  fontSize: isDesktop ? 16 : isMobile ? 14 : 15,
                  marginBottom: isDesktop ? 20 : isMobile ? 12 : 16,
                }}
              >
                Hôm nay bạn có {todaySchedules.length} buổi học
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/student/schedule")}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 8,
                  width: isDesktop ? 150 : isMobile ? 120 : 140,
                  height: isMobile ? 40 : 44,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#3FA9F5",
                  }}
                >
                  Xem lịch học →
                </Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>

          {/* Today's Schedule - Single card with auto-rotate */}
          <View style={{ marginBottom: isMobile ? 20 : 24 }}>
            {" "}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              <Text
                style={{
                  fontSize: isDesktop ? 18 : isMobile ? 16 : 17,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Lịch học hôm nay
              </Text>
              {todaySchedules.length > 1 && (
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {todaySchedules.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentScheduleIndex(index)}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          index === currentScheduleIndex
                            ? "#3FA9F5"
                            : "#D1D5DB",
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
            {todaySchedules.length > 0 ? (
              <TouchableOpacity
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
                  {todaySchedules[currentScheduleIndex]?.courseName || ""}
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    color: "#6B7280",
                    lineHeight: 21,
                    marginBottom: isMobile ? 8 : 12,
                  }}
                >
                  {todaySchedules[currentScheduleIndex]?.teacher || ""}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                      {todaySchedules[currentScheduleIndex]?.time || ""}
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 14,
                        color: "#6B7280",
                        lineHeight: 21,
                      }}
                    >
                      Phòng:{" "}
                      {todaySchedules[currentScheduleIndex]?.room || "N/A"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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

          {/* Quick Actions - 2 cards in row on mobile */}
          <View style={{ marginBottom: isMobile ? 24 : 32 }}>
            <Text
              style={{
                fontSize: isDesktop ? 18 : isMobile ? 16 : 17,
                fontWeight: "600",
                color: "#111827",
                marginBottom: isMobile ? 16 : 20,
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
                  minHeight: isDesktop ? 200 : isMobile ? 120 : 160,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: isDesktop ? 24 : isMobile ? 16 : 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: "#EFF6FF",
                    borderRadius: 10,
                    width: isDesktop ? 56 : isMobile ? 40 : 48,
                    height: isDesktop ? 56 : isMobile ? 40 : 48,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isDesktop ? 16 : isMobile ? 8 : 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isDesktop ? 24 : isMobile ? 18 : 20,
                      fontWeight: "700",
                      color: "#3FA9F5",
                    }}
                  >
                    OTP
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: isDesktop ? 17 : isMobile ? 14 : 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  Mã OTP
                </Text>
                <Text
                  style={{
                    fontSize: isDesktop ? 14 : isMobile ? 12 : 13,
                    color: "#6B7280",
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
                  minHeight: isDesktop ? 200 : isMobile ? 120 : 160,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: isDesktop ? 24 : isMobile ? 16 : 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: "#ECFDF5",
                    borderRadius: 10,
                    width: isDesktop ? 56 : isMobile ? 40 : 48,
                    height: isDesktop ? 56 : isMobile ? 40 : 48,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isDesktop ? 16 : isMobile ? 8 : 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isDesktop ? 22 : isMobile ? 16 : 18,
                      fontWeight: "700",
                      color: "#10B981",
                    }}
                  >
                    QR
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: isDesktop ? 17 : isMobile ? 14 : 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  QR Code
                </Text>
                <Text
                  style={{
                    fontSize: isDesktop ? 14 : isMobile ? 12 : 13,
                    color: "#6B7280",
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
          {/* Stats - 2x2 grid on mobile, 4 columns on desktop */}
          <View style={{ marginBottom: isMobile ? 24 : 32 }}>
            <Text
              style={{
                fontSize: isDesktop ? 18 : isMobile ? 16 : 17,
                fontWeight: "600",
                color: "#111827",
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              Thống kê tuần này
            </Text>

            {/* Desktop: Single row with 4 columns, Mobile: 2x2 grid */}
            {isDesktop ? (
              <View style={{ flexDirection: "row", gap: statsGap }}>
                {/* Tổng buổi */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 20,
                    borderLeftWidth: 3,
                    borderLeftColor: "#3FA9F5",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Tổng buổi
                  </Text>
                  <Text
                    style={{
                      fontSize: 40,
                      fontWeight: "700",
                      color: "#3FA9F5",
                    }}
                  >
                    12
                  </Text>
                </View>

                {/* Có mặt */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 20,
                    borderLeftWidth: 3,
                    borderLeftColor: "#10B981",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Có mặt
                  </Text>
                  <Text
                    style={{
                      fontSize: 40,
                      fontWeight: "700",
                      color: "#10B981",
                    }}
                  >
                    10
                  </Text>
                </View>

                {/* Đi muộn */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 20,
                    borderLeftWidth: 3,
                    borderLeftColor: "#F59E0B",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Đi muộn
                  </Text>
                  <Text
                    style={{
                      fontSize: 40,
                      fontWeight: "700",
                      color: "#F59E0B",
                    }}
                  >
                    2
                  </Text>
                </View>

                {/* Vắng */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 20,
                    borderLeftWidth: 3,
                    borderLeftColor: "#EF4444",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Vắng
                  </Text>
                  <Text
                    style={{
                      fontSize: 40,
                      fontWeight: "700",
                      color: "#EF4444",
                    }}
                  >
                    0
                  </Text>
                </View>
              </View>
            ) : (
              <>
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
                      borderRadius: 8,
                      padding: isMobile ? 12 : 16,
                      borderLeftWidth: 3,
                      borderLeftColor: "#3FA9F5",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 14,
                        color: "#6B7280",
                        marginBottom: isMobile ? 4 : 8,
                        fontWeight: "500",
                      }}
                    >
                      Tổng buổi
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? 32 : 36,
                        fontWeight: "700",
                        color: "#3FA9F5",
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
                      borderRadius: 8,
                      padding: isMobile ? 12 : 16,
                      borderLeftWidth: 3,
                      borderLeftColor: "#10B981",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 14,
                        color: "#6B7280",
                        marginBottom: isMobile ? 4 : 8,
                        fontWeight: "500",
                      }}
                    >
                      Có mặt
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? 32 : 36,
                        fontWeight: "700",
                        color: "#10B981",
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
                      borderRadius: 8,
                      padding: isMobile ? 12 : 16,
                      borderLeftWidth: 3,
                      borderLeftColor: "#F59E0B",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 14,
                        color: "#6B7280",
                        marginBottom: isMobile ? 4 : 8,
                        fontWeight: "500",
                      }}
                    >
                      Đi muộn
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? 32 : 36,
                        fontWeight: "700",
                        color: "#F59E0B",
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
                      borderRadius: 8,
                      padding: isMobile ? 12 : 16,
                      borderLeftWidth: 3,
                      borderLeftColor: "#EF4444",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 14,
                        color: "#6B7280",
                        marginBottom: isMobile ? 4 : 8,
                        fontWeight: "500",
                      }}
                    >
                      Vắng
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? 32 : 36,
                        fontWeight: "700",
                        color: "#EF4444",
                      }}
                    >
                      0
                    </Text>
                  </View>
                </View>
              </>
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
