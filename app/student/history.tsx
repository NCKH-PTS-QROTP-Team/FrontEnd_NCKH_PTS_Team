import React from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AttendanceStatusTag } from "@/components/AttendanceStatusTag";
import { mockAttendanceHistory } from "@/constants/mockData";

export default function HistoryScreen() {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "qr":
        return "QR";
      case "otp":
        return "123";
      default:
        return "-";
    }
  };

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 800 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Stats Summary */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Tổng quan
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    lineHeight: 32,
                    fontWeight: "bold",
                    color: "#10B981",
                  }}
                >
                  75%
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    marginTop: 4,
                  }}
                >
                  Có mặt
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: "#E5E7EB" }} />
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    lineHeight: 32,
                    fontWeight: "bold",
                    color: "#F59E0B",
                  }}
                >
                  10%
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    marginTop: 4,
                  }}
                >
                  Đi muộn
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: "#E5E7EB" }} />
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    lineHeight: 32,
                    fontWeight: "bold",
                    color: "#EF4444",
                  }}
                >
                  15%
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    marginTop: 4,
                  }}
                >
                  Vắng
                </Text>
              </View>
            </View>
          </View>

          {/* History List */}
          <Text
            style={{
              fontSize: 18,
              lineHeight: 28,
              fontWeight: "bold",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Lịch sử chi tiết
          </Text>

          <View>
            {mockAttendanceHistory.map((record) => (
              <View
                key={record.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        lineHeight: 24,
                        fontWeight: "bold",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {record.courseName}
                    </Text>
                    <Text
                      style={{ fontSize: 14, lineHeight: 20, color: "#6B7280" }}
                    >
                      {record.courseCode}
                    </Text>
                  </View>
                  <AttendanceStatusTag status={record.status} size="sm" />
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#F3F4F6",
                    marginVertical: 12,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, lineHeight: 20, color: "#6B7280" }}
                    >
                      {record.date}
                    </Text>
                    <Text
                      style={{ fontSize: 14, lineHeight: 20, color: "#6B7280" }}
                    >
                      {record.time}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      {getMethodIcon(record.method)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        color: "#6B7280",
                        textTransform: "lowercase",
                      }}
                    >
                      {record.method}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Updated: 2026-01-02 13:16:08
