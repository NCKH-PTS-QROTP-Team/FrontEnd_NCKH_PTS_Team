import React, { useState, useEffect } from "react";
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

export default function GenerateOTPScreen() {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, countdown]);

  const generateOTP = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newOTP);
    setCountdown(300);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = countdown === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />
      <AppHeader title="Tạo mã OTP" showBack showLogout={!isWeb} />

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
                    letterSpacing: 0.5,
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
                        backgroundColor: "#3FA9F5",
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
                        backgroundColor: "#3FA9F5",
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
                        backgroundColor: "#3FA9F5",
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
                      backgroundColor: "#F0F9FF",
                      borderRadius: 8,
                      padding: 16,
                      marginTop: 24,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#1E40AF",
                        marginBottom: 8,
                      }}
                    >
                      Hướng dẫn
                    </Text>
                    <Text
                      style={{ fontSize: 13, lineHeight: 20, color: "#1E40AF" }}
                    >
                      • Hiển thị mã OTP cho sinh viên{"\n"}• Mã có hiệu lực
                      trong 5 phút{"\n"}• Sinh viên nhập mã để điểm danh
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {/* Right Column - OTP Display */}
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
                    padding: isDesktop ? 32 : 24,
                    height: isDesktop ? "100%" : "auto",
                    justifyContent: "center",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: "#6B7280",
                        marginBottom: 16,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Mã OTP hiện tại
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#3FA9F5",
                        paddingHorizontal: isDesktop ? 48 : 32,
                        paddingVertical: isDesktop ? 32 : 24,
                        borderRadius: 16,
                        marginBottom: 24,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isDesktop ? 72 : 56,
                          fontWeight: "700",
                          color: "#FFFFFF",
                          letterSpacing: 8,
                        }}
                      >
                        {otp}
                      </Text>
                    </View>

                    <View
                      style={{
                        width: "100%",
                        paddingTop: 20,
                        borderTopWidth: 1,
                        borderTopColor: "#E5E7EB",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: "#6B7280",
                          marginBottom: 12,
                        }}
                      >
                        Thời gian còn lại
                      </Text>
                      <Text
                        style={{
                          fontSize: isDesktop ? 48 : 40,
                          fontWeight: "700",
                          color: countdown < 60 ? "#EF4444" : "#3FA9F5",
                        }}
                      >
                        {formatTime(countdown)}
                      </Text>
                      {countdown < 60 && (
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: "#EF4444",
                            marginTop: 8,
                          }}
                        >
                          Sắp hết hạn!
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: isDesktop ? 32 : 24,
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
                    <Text style={{ fontSize: 40, color: "#9CA3AF" }}>○</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 8,
                    }}
                  >
                    Chưa có mã OTP
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
              title={isActive ? "Tạo mã mới" : "Tạo mã OTP"}
              onPress={generateOTP}
            />
          </View>

          {/* Instructions - Only show on mobile/tablet */}
          {!isDesktop && (
            <View
              style={{
                backgroundColor: "#F0F9FF",
                borderRadius: 8,
                padding: 16,
                marginTop: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#1E40AF",
                  marginBottom: 8,
                }}
              >
                Hướng dẫn
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 20, color: "#1E40AF" }}>
                • Hiển thị mã OTP cho sinh viên{"\n"}• Mã có hiệu lực trong 5
                phút{"\n"}• Sinh viên nhập mã để điểm danh
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
