import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function GenerateQRScreen() {
  const [isActive, setIsActive] = useState(false);
  const isWeb = Platform.OS === "web";
  const qrData = "CS101_A102_20260102_0800";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 1200 : "100%";
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
          paddingVertical: isDesktop ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Desktop: Two-column layout, Mobile: Stacked */}
          <View
            style={{
              flexDirection: isDesktop ? "row" : "column",
              gap: isDesktop ? 24 : 0,
              marginBottom: 24,
            }}
          >
            {/* Left Column - Course Info */}
            <View
              style={{
                flex: isDesktop ? 1 : undefined,
                marginBottom: isMobile ? 20 : 0,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: 24,
                  height: isDesktop ? "100%" : "auto",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#6B7280",
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Môn học
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 16,
                  }}
                >
                  Lập trình cơ bản
                </Text>
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#10B981",
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 14, color: "#4B5563" }}>
                      CS101
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#10B981",
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 14, color: "#4B5563" }}>
                      Phòng A102
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#10B981",
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 14, color: "#4B5563" }}>
                      08:00 - 10:00
                    </Text>
                  </View>
                </View>

                {/* Instructions moved here for desktop */}
                {isDesktop && (
                  <View
                    style={{
                      backgroundColor: "#ECFDF5",
                      borderRadius: 8,
                      padding: 16,
                      marginTop: 24,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#047857",
                        marginBottom: 8,
                      }}
                    >
                      Hướng dẫn
                    </Text>
                    <Text
                      style={{ fontSize: 13, lineHeight: 20, color: "#047857" }}
                    >
                      • Hiển thị QR trên màn hình/máy chiếu{"\n"}• Sinh viên
                      quét mã bằng camera{"\n"}• QR code cập nhật mỗi phiên học
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {/* Right Column - QR Code Display */}
            <View
              style={{
                flex: isDesktop ? 1 : undefined,
              }}
            >
              {isActive ? (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: isDesktop ? 40 : 32,
                    height: isDesktop ? "100%" : "auto",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: "#6B7280",
                      marginBottom: 24,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    QR Code điểm danh
                  </Text>

                  {/* QR Code Placeholder */}
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderWidth: 3,
                      borderColor: "#E5E7EB",
                      borderRadius: 12,
                      padding: isDesktop ? 24 : 20,
                      marginBottom: 24,
                      width: isDesktop ? 340 : 280,
                      height: isDesktop ? 340 : 280,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#111827",
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 18,
                          fontWeight: "600",
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
                      fontSize: 13,
                      color: "#6B7280",
                      textAlign: "center",
                      marginBottom: 16,
                    }}
                  >
                    Sinh viên quét mã này để điểm danh
                  </Text>

                  <View
                    style={{
                      backgroundColor: "#ECFDF5",
                      borderRadius: 6,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#047857",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      Đang hoạt động
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: isDesktop ? 40 : 32,
                    height: isDesktop ? "100%" : "auto",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 40,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Text style={{ fontSize: 40, color: "#9CA3AF" }}>□</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 8,
                    }}
                  >
                    Chưa có QR Code
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    Nhấn nút bên dưới để tạo mã mới
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Button - Full width on mobile, constrained on desktop */}
          <View
            style={{
              maxWidth: isDesktop ? 400 : "100%",
              alignSelf: "center",
              width: "100%",
            }}
          >
            <PrimaryButton
              title={isActive ? "Tạo mã mới" : "Tạo QR Code"}
              onPress={() => setIsActive(!isActive)}
            />
          </View>

          {/* Instructions - Only show on mobile/tablet */}
          {!isDesktop && (
            <View
              style={{
                backgroundColor: "#ECFDF5",
                borderRadius: 8,
                padding: 16,
                marginTop: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#047857",
                  marginBottom: 8,
                }}
              >
                Hướng dẫn
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 20, color: "#047857" }}>
                • Hiển thị QR trên màn hình/máy chiếu{"\n"}• Sinh viên quét mã
                bằng camera{"\n"}• QR code cập nhật mỗi phiên học
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
