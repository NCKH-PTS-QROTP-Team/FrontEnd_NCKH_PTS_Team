import React, { useState, useEffect } from "react";
import {
  RefreshControl,
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
import { otpService, attendanceService, scheduleService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import { AttendanceMethod } from "@/apis/types/attendance.types";
import { useToast } from "@/components/ToastProvider";
import type { Schedule } from "@/apis/services/schedule.service";
import { CalendarIcon, LocationIcon } from "@/components/Icons";
import { Colors } from "@/constants/colors";

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
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const { showToast } = useToast();
  
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
    loadTodaySchedules();
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

  const loadTodaySchedules = async () => {
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) return;

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const schedules = await scheduleService.getSchedules({
        teacherId,
        fromDate: dateStr,
        toDate: dateStr,
      });
      setTodaySchedules(schedules);
    } catch (error) {
      console.warn("Không tải được lịch dạy hôm nay:", error);
    }
  };

  const loadActiveSession = async () => {
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        showToast("Không tìm thấy thông tin giảng viên", "error");
        return;
      }

      // Lấy active sessions của teacher
      const sessions = await attendanceService.getSessions({
        teacherId,
        active: true,
      });

      // Tìm session OTP của teacher
      const otpSession = sessions.find(
        (s) => s.method === AttendanceMethod.OTP && s.status === "ACTIVE",
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
      console.error("Error generating OTP:", error?.response?.data || error);
      const backendMessage =
        error?.response?.data?.message || error?.response?.data?.error;
      showToast(
        backendMessage ||
          error.message ||
          "Không thể tạo mã OTP. Vui lòng thử lại.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSessionFromSchedule = async (schedule: Schedule) => {
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        showToast("Không tìm thấy thông tin giảng viên", "error");
        return;
      }

      // Kiểm tra đã có session ACTIVE của lớp này chưa (bất kể teacherId)
      const existing = await attendanceService.getSessions({
        classId: schedule.classId,
      });

      const otpSession = existing.find(
        (s) => s.method === AttendanceMethod.OTP && s.status === "ACTIVE",
      );
      const anyActive = existing.find((s) => s.status === "ACTIVE");

      let sessionId = otpSession?.id;

      if (!otpSession) {
        // Nếu đã có phiên điểm danh ACTIVE (QR hoặc loại khác) thì không tạo thêm, tránh lỗi backend
        if (anyActive) {
          showToast(
            "Lớp này đang có phiên điểm danh đang hoạt động. Vui lòng kết thúc phiên đó trước khi tạo OTP mới.",
            "error",
          );
          return;
        }

        // Không có phiên nào ACTIVE -> tạo session mới cho lớp/môn này với phương thức OTP
        const newSession = await attendanceService.createSession({
          classId: schedule.classId,
          subjectId: schedule.subjectId,
          teacherId,
          method: AttendanceMethod.OTP,
          // Không gửi scheduledStartTime để tránh lỗi parse thời gian
        });
        sessionId = newSession.id;
      }

      if (!sessionId) return;

      // Cập nhật UI với session mới/chọn sẵn
      setSessionInfo({
        id: sessionId,
        classId: schedule.classId,
        classCode: schedule.classCode,
        className: schedule.className,
        subjectId: schedule.subjectId,
        subjectName: schedule.subjectName,
      });
      setCurrentSessionId(sessionId);
      setIsActive(false);
      setOtp("");
      setCountdown(300);

      showToast("Đã chọn môn từ lịch dạy. Bạn có thể tạo mã OTP.", "success");
    } catch (error: any) {
      console.error("Error creating session from schedule:", error);
      showToast(
        error.message || "Không thể tạo phiên điểm danh từ lịch dạy.",
        "error",
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = countdown === 0;

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadActiveSession(), loadTodaySchedules()]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

      <ScrollView
        refreshControl={
          isMobile ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1E3A8A"]}
              tintColor="#1E3A8A"
            />
          ) : undefined
        }
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
          {/* Gợi ý từ lịch dạy hôm nay */}
          {todaySchedules.length > 0 && (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: Colors.textHeading,
                  marginBottom: 12,
                }}
              >
                Lịch dạy hôm nay
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {todaySchedules.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleCreateSessionFromSchedule(item)}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        backgroundColor: Colors.gray50,
                        minWidth: 220,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: Colors.textHeading,
                          marginBottom: 4,
                        }}
                      >
                        {item.subjectName}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: Colors.textSecondary }}
                      >
                        {item.className}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 8,
                        }}
                      >
                        <CalendarIcon size={14} color={Colors.textSecondary} />
                        <Text
                          style={{
                            fontSize: 12,
                            color: Colors.textSecondary,
                            marginLeft: 6,
                          }}
                        >
                          {item.startTime} - {item.endTime}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <LocationIcon size={14} color={Colors.textSecondary} />
                        <Text
                          style={{
                            fontSize: 12,
                            color: Colors.textSecondary,
                            marginLeft: 6,
                          }}
                        >
                          Phòng {item.room}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors.primary,
                          fontWeight: "600",
                          marginTop: 8,
                        }}
                      >
                        Chọn để tạo phiên OTP
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

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

          {/* Actions - tạo OTP + kết thúc phiên */}
          <View
            style={{
              maxWidth: isDesktop ? 480 : "100%",
              alignSelf: "center",
              width: "100%",
              flexDirection: isDesktop ? "row" : "column",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title={isActive ? "Tạo mã mới" : "Tạo mã OTP"}
                onPress={generateOTP}
                loading={loading}
                disabled={!currentSessionId}
              />
            </View>

            {currentSessionId && (
              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: Colors.white,
                }}
                onPress={async () => {
                  try {
                    await attendanceService.completeSession(currentSessionId);
                    setIsActive(false);
                    setOtp("");
                    setCountdown(300);
                    setCurrentSessionId(null);
                    setSessionInfo(null);
                    showToast("Đã kết thúc phiên điểm danh.", "success");
                  } catch (error: any) {
                    console.error("Error completing session:", error);
                    showToast(
                      error?.response?.data?.message ||
                        "Không thể kết thúc phiên điểm danh.",
                      "error",
                    );
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: Colors.text,
                  }}
                >
                  Kết thúc phiên
                </Text>
              </TouchableOpacity>
            )}
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
    </SafeAreaView>
  );
}
