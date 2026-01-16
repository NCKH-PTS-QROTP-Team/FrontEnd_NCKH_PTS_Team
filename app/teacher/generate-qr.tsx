import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function GenerateQRScreen() {
  const [isActive, setIsActive] = useState(false);
  const isWeb = Platform.OS === "web";
  const qrData = "CS101_A102_20260102_0800";
const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

const contentMaxWidth = isDesktop ? 600 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />
      <AppHeader title="Tạo QR Code" showBack showLogout={!isWeb} />

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
          {/* Course Info */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
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
                fontSize: 14,
                lineHeight: 20,
                color: "#6B7280",
                marginBottom: 4,
              }}
            >
              Môn học
            </Text>
            <Text
              style={{
                fontSize: 20,
                lineHeight: 28,
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              Lập trình cơ bản
            </Text>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: "#4B5563",
                marginTop: 4,
              }}
            >
CS101 • Phòng A102 • 08:00 - 10:00
            </Text>
          </View>

          {/* QR Code Display */}
          {isActive ? (
<View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 32,
                marginBottom: 24,
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#D1FAE5",
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 28,
                      lineHeight: 36,
                      fontWeight: "bold",
                      color: "#10B981",
                    }}
                  >
                    QR
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#6B7280",
                    marginBottom: 24,
                  }}
                >
                  QR Code điểm danh
                </Text>

                {/* QR Code Placeholder */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderWidth: 4,
                    borderColor: "#111827",
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 24,
                    width: 280,
                    height: 280,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#111827",
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 18,
                        lineHeight: 28,
                        fontWeight: "bold",
                        textAlign: "center",
                        paddingHorizontal: 16,
                      }}
                    >
                      QR CODE{"\n"}PLACEHOLDER
</Text>
                  </View>
                </View>

<Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  Sinh viên quét mã này để điểm danh
                </Text>

                <View
                  style={{
                    backgroundColor: "#D1FAE5",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    marginTop: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#047857",
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: "600",
                    }}
                  >
✓ QR Code đang hoạt động
                  </Text>
                </View>
              </View>
            </View>
          ) : (
<View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 32,
                marginBottom: 24,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{ fontSize: 32, lineHeight: 40, color: "#6B7280" }}
                >
                  □
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  lineHeight: 28,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                Chưa có QR Code
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: "#6B7280",
                  textAlign: "center",
                }}
              >
Nhấn nút bên dưới để tạo QR code mới
              </Text>
            </View>
          )}

          <PrimaryButton
            title={isActive ? "Tạo mã mới" : "Tạo QR Code"}
            onPress={() => setIsActive(!isActive)}
          />

          {/* Instructions */}
<View
            style={{
              backgroundColor: "#D1FAE5",
              borderWidth: 1,
              borderColor: "#A7F3D0",
              borderRadius: 12,
              padding: 16,
              marginTop: 24,
            }}
          >
            <Text style={{ fontSize: 14, lineHeight: 20, color: "#047857" }}>
              <Text style={{ fontWeight: "600" }}>Hướng dẫn:</Text>
              {"\n"}• Hiển thị QR code trên màn hình/máy chiếu
              {"\n"}• Sinh viên quét mã bằng camera
              {"\n"}• QR code cập nhật mỗi phiên học
</Text>
          </View>
        </View>
      </ScrollView>
</SafeAreaView>
);
}
