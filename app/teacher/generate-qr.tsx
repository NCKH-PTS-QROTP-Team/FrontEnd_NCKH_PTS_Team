import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { QRViewer } from "@/components/QRViewer";
import { qrService, attendanceService, scheduleService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import Toast, { useToast } from "@/components/Toast";
import { QRStatus } from "@/apis/types/qr.types";
import type { AttendanceSessionResponse } from "@/apis/types/attendance.types";
import { Colors } from "@/constants/colors";
import type { Schedule } from "@/apis/services/schedule.service";
import { CalendarIcon, LocationIcon } from "@/components/Icons";

export default function GenerateQRScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<AttendanceSessionResponse[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSessionResponse | null>(null);
  const [currentQR, setCurrentQR] = useState<any>(null);
  const [qrHistory, setQrHistory] = useState<any[]>([]);
  const [expiryMinutes, setExpiryMinutes] = useState<string>("5");
  const [loadingQR, setLoadingQR] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  useEffect(() => {
    loadSessions();
    loadTodaySchedules();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadCurrentQR();
      loadQRHistory();
    }
  }, [selectedSession]);

  // Đếm ngược thời gian còn lại của QR hiện tại theo thời gian thực
  useEffect(() => {
    if (!currentQR || !currentQR.expiresAt) {
      setTimeLeft(null);
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const expiry = new Date(currentQR.expiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0 || currentQR.status !== QRStatus.ACTIVE) {
        setTimeLeft("Đã hết hạn");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [currentQR]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const teacherId = await getTeacherIdFromToken();
      const allSessions = await attendanceService.getSessions({
        teacherId,
        active: true,
      });
      // Filter sessions by teacher & phương thức QR (nếu cần)
      const mySessions = allSessions.filter((s) => s.status === "ACTIVE");
      setSessions(mySessions);
      if (mySessions.length > 0 && !selectedSession) {
        setSelectedSession(mySessions[0]);
      }
    } catch (error: any) {
      console.error("Error loading sessions:", error);
      showToast("Không thể tải danh sách phiên điểm danh", "error");
    } finally {
      setLoading(false);
    }
  };

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
      console.warn("Không tải được lịch dạy hôm nay (QR):", error);
    }
  };

  const loadCurrentQR = async () => {
    if (!selectedSession) return;
    try {
      setLoadingQR(true);
      const qr = await qrService.getCurrentQR(selectedSession.id);
      setCurrentQR(qr);
    } catch (error: any) {
      // Không có QR code ACTIVE
      setCurrentQR(null);
    } finally {
      setLoadingQR(false);
    }
  };

  const loadQRHistory = async () => {
    if (!selectedSession) return;
    try {
      const history = await qrService.getQRCodesBySession(selectedSession.id);
      setQrHistory(history);
    } catch (error: any) {
      console.error("Error loading QR history:", error);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedSession) {
      showToast("Vui lòng chọn phiên điểm danh", "error");
      return;
    }

    const minutes = parseInt(expiryMinutes);
    if (isNaN(minutes) || minutes <= 0 || minutes > 60) {
      showToast("Thời hạn phải từ 1 đến 60 phút", "error");
      return;
    }

    try {
      setLoadingQR(true);
      const teacherId = await getTeacherIdFromToken();
      const qr = await qrService.generateQR({
        sessionId: selectedSession.id,
        teacherId,
        expiryMinutes: minutes,
      });
      setCurrentQR(qr);
      await loadQRHistory();
      showToast("Tạo QR code thành công", "success");
    } catch (error: any) {
      console.error("Error generating QR:", error);
      showToast(
        error.response?.data?.message || "Không thể tạo QR code",
        "error"
      );
    } finally {
      setLoadingQR(false);
    }
  };

  const handleCreateSessionFromSchedule = async (schedule: Schedule) => {
    try {
      const teacherId = await getTeacherIdFromToken();
      if (!teacherId) {
        showToast("Không tìm thấy thông tin giảng viên", "error");
        return;
      }

      const existing = await attendanceService.getSessions({
        classId: schedule.classId,
      });

      const qrSession = existing.find(
        (s) => s.method === "QR" && s.status === "ACTIVE",
      );
      const anyActive = existing.find((s) => s.status === "ACTIVE");

      let session = qrSession;

      if (!qrSession) {
        // Nếu đã có phiên điểm danh ACTIVE (OTP hoặc loại khác) thì không tạo thêm
        if (anyActive) {
          showToast(
            "Lớp này đang có phiên điểm danh đang hoạt động. Vui lòng kết thúc phiên đó trước khi tạo QR mới.",
            "error",
          );
          return;
        }

        session = await attendanceService.createSession({
          classId: schedule.classId,
          subjectId: schedule.subjectId,
          teacherId,
          method: "QR",
          // Không gửi scheduledStartTime để tránh lỗi parse thời gian
        });
      }

      if (!session) return;

      setSelectedSession(session);
      setCurrentQR(null);
      setQrHistory([]);
      showToast(
        "Đã chọn môn từ lịch dạy. Bạn có thể tạo QR Code cho phiên này.",
        "success",
      );
    } catch (error: any) {
      console.error("Error creating QR session from schedule:", error);
      showToast(
        error.message || "Không thể tạo phiên điểm danh từ lịch dạy.",
        "error",
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "Đã hết hạn";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <Toast />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingVertical: isDesktop ? 32 : 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadSessions();
              if (selectedSession) {
                await loadCurrentQR();
                await loadQRHistory();
              }
              setRefreshing(false);
            }}
          />
        }
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
                        Chọn để tạo phiên QR
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Session Selection */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#6B7280",
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              Chọn phiên điểm danh
            </Text>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : sessions.length === 0 ? (
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                Không có phiên điểm danh đang hoạt động
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {sessions.map((session) => (
                    <TouchableOpacity
                      key={session.id}
                      onPress={() => setSelectedSession(session)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 8,
                        backgroundColor:
                          selectedSession?.id === session.id
                            ? Colors.primary
                            : "#F3F4F6",
                        minWidth: 200,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color:
                            selectedSession?.id === session.id
                              ? "#FFFFFF"
                              : "#111827",
                        }}
                      >
                        {session.subjectName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color:
                            selectedSession?.id === session.id
                              ? "#FFFFFF"
                              : "#6B7280",
                          marginTop: 4,
                        }}
                      >
                        {session.className}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {selectedSession && (
            <>
              {/* Course Info */}
              <View
                style={{
                  flexDirection: isDesktop ? "row" : "column",
                  gap: isDesktop ? 24 : 0,
                  marginBottom: 24,
                }}
              >
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
                      {selectedSession.subjectName}
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
                          {selectedSession.className}
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
                          Bắt đầu: {formatDate(selectedSession.startTime)}
                        </Text>
                      </View>
                    </View>

                    {/* Expiry Time Input */}
                    <View style={{ marginTop: 24 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: "#6B7280",
                          marginBottom: 8,
                        }}
                      >
                        Thời hạn QR code (phút)
                      </Text>
                      <TextInput
                        value={expiryMinutes}
                        onChangeText={setExpiryMinutes}
                        keyboardType="numeric"
                        style={{
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          backgroundColor: "#FFFFFF",
                        }}
                        placeholder="5"
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          marginTop: 4,
                        }}
                      >
                        Từ 1 đến 60 phút (mặc định: 5 phút)
                      </Text>
                    </View>
                  </View>
                </View>

                {/* QR Code Display */}
                <View style={{ flex: isDesktop ? 1 : undefined }}>
                  {loadingQR ? (
                    <View
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        padding: 40,
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 400,
                      }}
                    >
                      <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                  ) : currentQR ? (
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

                      <QRViewer
                        value={currentQR.token}
                        size={isDesktop ? 340 : 280}
                      />

                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                          textAlign: "center",
                          marginTop: 16,
                          marginBottom: 16,
                        }}
                      >
                        Sinh viên quét mã này để điểm danh
                      </Text>

                      <View
                        style={{
                          backgroundColor:
                            currentQR.status === QRStatus.ACTIVE
                              ? "#ECFDF5"
                              : "#FEE2E2",
                          borderRadius: 6,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              currentQR.status === QRStatus.ACTIVE
                                ? "#047857"
                                : "#991B1B",
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                        >
                          {currentQR.status === QRStatus.ACTIVE && timeLeft
                            ? `Còn hạn: ${timeLeft}`
                            : "Đã hết hạn"}
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          textAlign: "center",
                        }}
                      >
                        Hết hạn: {formatDate(currentQR.expiresAt)}
                      </Text>
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

              {/* Actions: tạo QR + kết thúc phiên */}
              <View
                style={{
                  maxWidth: isDesktop ? 480 : "100%",
                  alignSelf: "center",
                  width: "100%",
                  marginBottom: 24,
                  flexDirection: isDesktop ? "row" : "column",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    title={currentQR ? "Tạo mã mới" : "Tạo QR Code"}
                    onPress={handleGenerateQR}
                    loading={loadingQR}
                  />
                </View>

                {selectedSession && (
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
                        await attendanceService.completeSession(
                          selectedSession.id,
                        );
                        setSelectedSession(null);
                        setCurrentQR(null);
                        setQrHistory([]);
                        await loadSessions();
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

              {/* QR History */}
              {qrHistory.length > 0 && (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 24,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: 16,
                    }}
                  >
                    Lịch sử QR codes
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 12 }}
                  >
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      {qrHistory.map((qr) => (
                        <View
                          key={qr.id}
                          style={{
                            padding: 16,
                            borderRadius: 8,
                            backgroundColor:
                              qr.status === QRStatus.ACTIVE
                                ? "#ECFDF5"
                                : "#F3F4F6",
                            borderWidth: 1,
                            borderColor:
                              qr.status === QRStatus.ACTIVE
                                ? "#10B981"
                                : "#E5E7EB",
                            minWidth: 200,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color:
                                qr.status === QRStatus.ACTIVE
                                  ? "#047857"
                                  : "#6B7280",
                              marginBottom: 8,
                            }}
                          >
                            {qr.status === QRStatus.ACTIVE
                              ? "Còn hạn"
                              : "Hết hạn"}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#6B7280",
                              marginBottom: 4,
                            }}
                          >
                            Tạo: {formatDate(qr.createdAt)}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#6B7280",
                            }}
                          >
                            Hết hạn: {formatDate(qr.expiresAt)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
