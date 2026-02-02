import React from "react";
import { View, Text, ScrollView, useWindowDimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { SchoolIcon, UsersIcon, CalendarIcon } from "@/components/Icons";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function ClassManagementScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 32 : isMobile ? 20 : 24,
        }}
      >
        <View
          style={{
            maxWidth: isDesktop ? 1200 : "100%",
            width: "100%",
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              fontSize: isDesktop ? 32 : isMobile ? 24 : 28,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 24,
            }}
          >
            Quản lý lớp học
          </Text>
          
          {/* Quick Actions */}
          <View
            style={{
              flexDirection: isDesktop ? "row" : "column",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/academic-staff/classes" as any)}
              style={{
                flex: isDesktop ? 1 : undefined,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: isMobile ? 16 : 20,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: Colors.primary + "15",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <SchoolIcon size={24} color={Colors.primary} />
              </View>
              <Text
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Danh sách lớp học
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 13 : 14,
                  color: "#6B7280",
                }}
              >
                Xem và quản lý tất cả lớp học
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/academic-staff/students" as any)}
              style={{
                flex: isDesktop ? 1 : undefined,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: isMobile ? 16 : 20,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#10B98115",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <UsersIcon size={24} color="#10B981" />
              </View>
              <Text
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Quản lý sinh viên
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 13 : 14,
                  color: "#6B7280",
                }}
              >
                Phân công sinh viên vào lớp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/academic-staff/schedules" as any)}
              style={{
                flex: isDesktop ? 1 : undefined,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: isMobile ? 16 : 20,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#8B5CF615",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <CalendarIcon size={24} color="#8B5CF6" />
              </View>
              <Text
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Lịch học
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 13 : 14,
                  color: "#6B7280",
                }}
              >
                Xem và quản lý lịch học
              </Text>
            </TouchableOpacity>
          </View>

          {/* Import Section */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: isMobile ? 20 : 24,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontSize: isMobile ? 18 : 20,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Import dữ liệu
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 14 : 15,
                color: "#6B7280",
                marginBottom: 16,
                lineHeight: 22,
              }}
            >
              Import lớp học hoặc sinh viên từ file Excel để quản lý hàng loạt
            </Text>
            <PrimaryButton
              title="Import lớp học"
              onPress={() => router.push("/academic-staff/import-classes" as any)}
              style={{ marginBottom: 12 }}
            />
            <PrimaryButton
              title="Import sinh viên"
              variant="outline"
              onPress={() => router.push("/academic-staff/import-students" as any)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

