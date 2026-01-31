import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { otpService, attendanceService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import { AttendanceMethod } from "@/apis/types/attendance.types";
import Toast, { useToast } from "@/components/Toast";

interface SessionInfo {
  id: string;
  classId: string;
  classCode: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

export default function GenerateOTPScreen() {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();
  
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  // Load active session on mount
  useEffect(() => {
    loadActiveSession();
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, countdown]);

  // Refresh OTP info periodically
  useEffect(() => {
    if (currentSessionId && isActive) {
      const interval = setInterval(() => {
        refreshOTPInfo();
      }, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [currentSessionId, isActive]);

  const loadActiveSession = async () => {
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        showToast("Không tìm thấy thông tin giảng viên", "error");
        return;
      }

      // Lấy active sessions của teacher
      const sessions = await attendanceService.getSessions({
        status: "ACTIVE",
      });
      
      // Tìm session OTP của teacher
      const otpSession = sessions.find(
        (s) => s.method === AttendanceMethod.OTP && s.status === "ACTIVE"
      );

      if (otpSession) {
        setSessionInfo({
          id: otpSession.id,
          classId: otpSession.classId,
          classCode: otpSession.classCode || "",
          className: otpSession.className || "",
          subjectId: otpSession.subjectId,
          subjectName: otpSession.subjectName || "",
        });
        setCurrentSessionId(otpSession.id);
        
        // Load current OTP if exists
        try {
          const otpResponse = await otpService.getCurrent(otpSession.id);
          if (otpResponse) {
            setOtp(otpResponse.code);
            setCountdown(otpResponse.remainingSeconds || 300);
            setIsActive(true);
          }
        } catch (error) {
          // No OTP yet
        }
      }
    } catch (error: any) {
      console.error("Error loading active session:", error);
      // Không hiển thị error nếu chưa có session
    }
  };

  const refreshOTPInfo = async () => {
    if (!currentSessionId) return;
    
    try {
      const otpResponse = await otpService.getCurrent(currentSessionId);
      if (otpResponse && otpResponse.remainingSeconds !== undefined) {
        setCountdown(otpResponse.remainingSeconds);
        if (otpResponse.remainingSeconds <= 0) {
          setIsActive(false);
        }
      }
    } catch (error) {
      // OTP expired or not found
      setIsActive(false);
    }
  };

  const generateOTP = async () => {
    if (!currentSessionId) {
      showToast("Vui lòng tạo phiên điểm danh trước", "error");
      return;
    }

    setLoading(true);
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        showToast("Không tìm thấy thông tin giảng viên", "error");
        setLoading(false);
        return;
      }

      const otpResponse = await otpService.generate({
        sessionId: currentSessionId,
        teacherId: teacherId,
      });

      setOtp(otpResponse.code);
      setCountdown(otpResponse.remainingSeconds || 300);
      setIsActive(true);
      showToast("Tạo mã OTP thành công!", "success");
    } catch (error: any) {
      console.error("Error generating OTP:", error);
      showToast(
        error.message || "Không thể tạo mã OTP. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = countdown === 0;

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
                  {sessionInfo?.subjectName || "Chưa chọn lớp"}
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
                      {sessionInfo?.classCode || "N/A"}
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
                      {sessionInfo?.className || "N/A"}
                    </Text>
                  </View>
                  {!sessionInfo && (
                    <View
                      style={{
                        backgroundColor: "#FEF3C7",
                        borderRadius: 8,
                        padding: 12,
                        marginTop: 12,
                      }}
                    >
                      <Text style={{ fontSize: 13, color: "#92400E" }}>
                        Vui lòng tạo phiên điểm danh OTP từ danh sách lớp
                      </Text>
                    </View>
                  )}
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
              loading={loading}
              disabled={!currentSessionId}
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
