import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { PrimaryButton } from "@/components/PrimaryButton";
import { UploadIcon, SchoolIcon, UsersIcon } from "@/components/Icons";
import Toast, { useToast } from "@/components/Toast";

export default function ImportDataScreen() {
  const params = useLocalSearchParams();
  const importType = (params.type as string) || "classes";
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const paddingHorizontal = isDesktop ? 32 : 16;

  const importOptions = [
    {
      id: "classes",
      title: "Import lớp học",
      description: "Tải lên file Excel chứa thông tin các lớp học",
      icon: <SchoolIcon size={32} color={Colors.primary} />,
      route: "/academic-staff/import-classes",
    },
    {
      id: "students",
      title: "Import sinh viên",
      description: "Tải lên file Excel chứa thông tin sinh viên",
      icon: <UsersIcon size={32} color={Colors.primary} />,
      route: "/academic-staff/import-students",
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: isDesktop ? 800 : "100%",
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: isDesktop ? 32 : 28,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Import dữ liệu
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 20,
              }}
            >
              Chọn loại dữ liệu bạn muốn import từ file Excel
            </Text>
          </View>

          {/* Import Options */}
          <View style={{ gap: 16 }}>
            {importOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => router.push(option.route as any)}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: 24,
                  borderWidth: 2,
                  borderColor:
                    importType === option.id
                      ? Colors.primary
                      : "#E5E7EB",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: Colors.primary + "15",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  {option.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 4,
                    }}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      lineHeight: 20,
                    }}
                  >
                    {option.description}
                  </Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: Colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#FFF", fontSize: 12 }}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: "#F0F9FF",
              borderRadius: 12,
              padding: 20,
              marginTop: 24,
              borderWidth: 1,
              borderColor: "#BAE6FD",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1E40AF",
                marginBottom: 12,
              }}
            >
              Lưu ý khi import
            </Text>
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 20 }}>
                • File Excel phải đúng định dạng (.xlsx hoặc .xls)
              </Text>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 20 }}>
                • Dòng đầu tiên là header, các dòng tiếp theo là dữ liệu
              </Text>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 20 }}>
                • Kiểm tra kỹ dữ liệu trước khi import để tránh lỗi
              </Text>
              <Text style={{ fontSize: 14, color: "#1E40AF", lineHeight: 20 }}>
                • Hệ thống sẽ báo cáo chi tiết các dòng lỗi sau khi import
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

