import React, { useState } from "react";
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
import { PrimaryButton } from "@/components/PrimaryButton";
export default function QRAttendanceScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    setScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setTimeout(() => {
        alert("Điểm danh thành công!");
        router.back();
      }, 500);
    }, 2000);
  };

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 500 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#111827",
            textAlign: "center",
          }}
        >
          Điểm danh QR Code
        </Text>
      </View>

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
              borderWidth: 1,
              borderColor: "#E5E7EB",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                backgroundColor: "#D1FAE5",
                borderRadius: 12,
                padding: 16,
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
                  fontSize: 18,
                  lineHeight: 28,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Lập trình cơ bản
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: "#4B5563" }}>
                CS101 • Phòng A102 • 08:00 - 10:00
              </Text>
            </View>
          </View>

          {/* Scanner Card */}
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
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Scanner Area */}
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 16,
                aspectRatio: 1,
                maxWidth: isDesktop ? 400 : "100%",
                alignSelf: "center",
                width: "100%",
                borderWidth: 3,
                borderColor: scanning ? "#3FA9F5" : "#E5E7EB",
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                padding: isDesktop ? 24 : 16,
              }}
            >
              {!scanning && !scanned && (
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 36,
                        lineHeight: 44,
                        fontWeight: "bold",
                        color: "#6B7280",
                      }}
                    >
                      QR
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 24,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    Sẵn sàng quét
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    Nhấn nút bên dưới để bắt đầu
                  </Text>
                </View>
              )}
              {scanning && (
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#DBEAFE",
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 36,
                        lineHeight: 44,
                        fontWeight: "bold",
                        color: "#3FA9F5",
                      }}
                    >
                      ...
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 24,
                      fontWeight: "600",
                      color: "#3FA9F5",
                      marginBottom: 8,
                    }}
                  >
                    Đang quét...
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    Hướng camera vào QR code
                  </Text>
                </View>
              )}

              {scanned && (
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{ fontSize: 70, lineHeight: 80, marginBottom: 16 }}
                  >
                    ✅
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 24,
                      fontWeight: "600",
                      color: "#10B981",
                      marginBottom: 8,
                    }}
                  >
                    Quét thành công!
                  </Text>
                  <Text
                    style={{ fontSize: 14, lineHeight: 20, color: "#6B7280" }}
                  >
                    Đang xử lý...
                  </Text>
                </View>
              )}
            </View>

            <PrimaryButton
              title={
                scanning
                  ? "Đang quét..."
                  : scanned
                    ? "Hoàn tất"
                    : "Bắt đầu quét"
              }
              onPress={handleScan}
              disabled={scanning || scanned}
              loading={scanning}
            />
          </View>

          {/* Help Text */}
          <View
            style={{
              backgroundColor: "#E0F2FE",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#BFDBFE",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "600",
                color: "#1E40AF",
                marginBottom: 8,
              }}
            >
              Hướng dẫn:
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: "#1E3A8A" }}>
              Nhấn "Bắt đầu quét" và hướng camera vào QR code mà giảng viên hiển
              thị để hoàn tất điểm danh.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Updated: 2026-01-02 13:16:08
