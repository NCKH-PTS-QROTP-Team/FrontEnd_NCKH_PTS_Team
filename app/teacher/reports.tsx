import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function ReportsScreen() {
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 900 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const isMobile = width < 768;

  const statsData = [
    { value: "156", label: "Tổng buổi", color: "#3FA9F5", bgColor: "#EFF6FF" },
    { value: "128", label: "Có mặt", color: "#10B981", bgColor: "#ECFDF5" },
    { value: "18", label: "Đi muộn", color: "#F59E0B", bgColor: "#FEF3C7" },
    { value: "10", label: "Vắng", color: "#EF4444", bgColor: "#FEE2E2" },
  ];

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
          {/* Summary Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                lineHeight: 28,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 20,
              }}
            >
              Tổng quan học kỳ
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginHorizontal: -8,
              }}
            >
              {statsData.map((stat, index) => (
                <View
                  key={index}
                  style={{
                    width: isMobile ? "50%" : "25%",
                    paddingHorizontal: 8,
                    marginBottom: isMobile ? 16 : 0,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: stat.bgColor,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 32,
                        lineHeight: 40,
                        fontWeight: "bold",
                        color: stat.color,
                        marginBottom: 4,
                      }}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        color: "#6B7280",
                        textAlign: "center",
                      }}
                    >
                      {stat.label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Chart Placeholder */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                lineHeight: 28,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Biểu đồ chuyên cần
            </Text>
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                padding: 48,
                height: 250,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{ fontSize: 32, lineHeight: 40, color: "#6B7280" }}
                >
                  ☰
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: "#6B7280",
                  textAlign: "center",
                }}
              >
                Biểu đồ thống kê sẽ hiển thị ở đây
              </Text>
            </View>
          </View>

          {/* Export Options */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                lineHeight: 28,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Xuất báo cáo
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "#D1FAE5",
                borderWidth: 2,
                borderColor: "#A7F3D0",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#D1FAE5",
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        lineHeight: 24,
                        fontWeight: "bold",
                        color: "#10B981",
                      }}
                    >
                      =
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        lineHeight: 24,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      Xuất file Excel
                    </Text>
                    <Text
                      style={{ fontSize: 14, lineHeight: 20, color: "#6B7280" }}
                    >
                      Danh sách điểm danh chi tiết
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: "#047857",
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: "600",
                  }}
                >
                  Tải về
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#FEE2E2",
                borderWidth: 2,
                borderColor: "#FECACA",
                borderRadius: 12,
                padding: 16,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#FEE2E2",
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        lineHeight: 24,
                        fontWeight: "bold",
                        color: "#EF4444",
                      }}
                    >
                      P
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        lineHeight: 24,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      Xuất file PDF
                    </Text>
                    <Text
                      style={{ fontSize: 14, lineHeight: 20, color: "#6B7280" }}
                    >
                      Báo cáo tổng hợp
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: "#DC2626",
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: "600",
                  }}
                >
                  Tải về
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
