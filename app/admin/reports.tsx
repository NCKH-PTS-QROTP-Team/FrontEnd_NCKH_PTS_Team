import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { AppHeader } from "@/components/AppHeader";
import Card from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import Tabs from "@/components/Tabs";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;
  const showTable = isDesktop;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <AppHeader title="Báo cáo & Thống kê" showLogout={true} />

      <Tabs
        tabs={[
          { key: "overview", label: "Tổng quan" },
          { key: "class", label: "Theo lớp" },
          { key: "teacher", label: "Theo GV" },
          { key: "student", label: "Theo SV" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView className="flex-1">
        <View
          className="p-4"
          style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}
        >
          {activeTab === "overview" && (
            <>
              {/* Summary Stats */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: isMobile ? 16 : 24, marginHorizontal: -8 }}>
                {[
                  {
                    label: "Tổng buổi học",
                    value: "1,234",
                    color: Colors.primary,
                  },
                  {
                    label: "Tổng sinh viên",
                    value: "5,678",
                    color: Colors.success,
                  },
                  {
                    label: "Tỷ lệ điểm danh TB",
                    value: "87%",
                    color: Colors.warning,
                  },
                  {
                    label: "Số lớp hoạt động",
                    value: "45",
                    color: Colors.info,
                  },
                ].map((stat, index) => (
                  <View key={index} className="w-1/2 px-2 mb-3">
                    <Card>
                      <Text
                        className="text-3xl font-bold mb-1"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.textSecondary }}
                      >
                        {stat.label}
                      </Text>
                    </Card>
                  </View>
                ))}
              </View>

              {/* Chart Placeholder */}
              <Card className="mb-4">
                <Text
                  className="font-semibold text-base mb-3"
                  style={{ color: Colors.text }}
                >
                  Biểu đồ điểm danh theo thời gian
                </Text>
                <View
                  style={{
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: isMobile ? 250 : 300,
                    backgroundColor: Colors.gray50,
                    borderWidth: 1,
                    borderColor: Colors.gray200,
                    borderStyle: 'dashed',
                  }}
                >
                  <Text style={{ color: Colors.textSecondary }}>
                    📊 Chart Placeholder
                  </Text>
                </View>
              </Card>

              {/* Faculty-wide Stats */}
              <Card className="mb-4">
                <Text
                  className="font-semibold text-base mb-3"
                  style={{ color: Colors.text }}
                >
                  Thống kê toàn trường
                </Text>
                {[
                  {
                    label: "Khoa CNTT",
                    present: 456,
                    late: 34,
                    absent: 23,
                    total: 513,
                  },
                  {
                    label: "Khoa Kinh tế",
                    present: 389,
                    late: 28,
                    absent: 31,
                    total: 448,
                  },
                  {
                    label: "Khoa Ngoại ngữ",
                    present: 234,
                    late: 19,
                    absent: 12,
                    total: 265,
                  },
                ].map((faculty, index) => (
                  <View
                    key={index}
                    className="py-3 border-b"
                    style={{
                      borderBottomColor:
                        index === 2 ? "transparent" : Colors.border,
                    }}
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text
                        className="font-medium"
                        style={{ color: Colors.text }}
                      >
                        {faculty.label}
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: Colors.primary }}
                      >
                        {Math.round((faculty.present / faculty.total) * 100)}%
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text
                        className="text-xs"
                        style={{ color: Colors.success }}
                      >
                        ✓ {faculty.present}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.warning }}
                      >
                        ⏱ {faculty.late}
                      </Text>
                      <Text className="text-xs" style={{ color: Colors.error }}>
                        ✕ {faculty.absent}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: Colors.textSecondary }}
                      >
                        Σ {faculty.total}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </>
          )}

          {activeTab === "class" && (
            <Card>
              <Text
                className="font-semibold mb-3"
                style={{ color: Colors.text }}
              >
                Báo cáo theo lớp học
              </Text>
              <Text
                className="text-sm mb-4"
                style={{ color: Colors.textSecondary }}
              >
                Chọn lớp và khoảng thời gian để xem báo cáo chi tiết
              </Text>
              <PrimaryButton
                title="Chọn lớp học"
                variant="outline"
                onPress={() => alert("Chọn lớp")}
              />
            </Card>
          )}

          {activeTab === "teacher" && (
            <Card>
              <Text
                className="font-semibold mb-3"
                style={{ color: Colors.text }}
              >
                Báo cáo theo giảng viên
              </Text>
              <Text
                className="text-sm mb-4"
                style={{ color: Colors.textSecondary }}
              >
                Xem thống kê điểm danh của từng giảng viên
              </Text>
              <PrimaryButton
                title="Chọn giảng viên"
                variant="outline"
                onPress={() => alert("Chọn GV")}
              />
            </Card>
          )}

          {activeTab === "student" && (
            <Card>
              <Text
                className="font-semibold mb-3"
                style={{ color: Colors.text }}
              >
                Báo cáo theo sinh viên
              </Text>
              <Text
                className="text-sm mb-4"
                style={{ color: Colors.textSecondary }}
              >
                Xem lịch sử điểm danh chi tiết của sinh viên
              </Text>
              <PrimaryButton
                title="Chọn sinh viên"
                variant="outline"
                onPress={() => alert("Chọn SV")}
              />
            </Card>
          )}

          {/* Export Section */}
          <Card style={{ marginTop: isMobile ? 16 : 24, padding: isMobile ? 16 : 24 }}>
            <Text style={{ fontWeight: '600', marginBottom: isMobile ? 16 : 20, fontSize: isMobile ? 16 : 18, color: Colors.text }}>
              Xuất báo cáo
            </Text>
            <View style={{ flexDirection: isMobile ? 'column' : 'row', marginHorizontal: -8, gap: isMobile ? 12 : 0 }}>
              <View style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8, marginBottom: isMobile ? 0 : 0 }}>
                <PrimaryButton
                  title="Excel"
                  variant="outline"
                  onPress={() => alert("Export Excel")}
                />
              </View>
              <View style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8, marginBottom: isMobile ? 0 : 0 }}>
                <PrimaryButton
                  title="PDF"
                  variant="outline"
                  onPress={() => alert("Export PDF")}
                />
              </View>
              <View style={{ flex: isMobile ? undefined : 1, paddingHorizontal: 8 }}>
                <PrimaryButton
                  title="CSV"
                  variant="outline"
                  onPress={() => alert("Export CSV")}
                />
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
