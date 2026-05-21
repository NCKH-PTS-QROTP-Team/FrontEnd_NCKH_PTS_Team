import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { QRViewer } from "@/components/QRViewer";
import { qrService, attendanceService, scheduleService } from "@/apis";
import { getTeacherIdFromToken } from "@/apis/utils/jwt";
import { useToast } from "@/components/ToastProvider";
import { QRStatus } from "@/apis/types/qr.types";
import {
  AttendanceMethod,
  type AttendanceSessionResponse,
} from "@/apis/types/attendance.types";
import { Colors } from "@/constants/colors";
import type { Schedule } from "@/apis/services/schedule.service";
import { CalendarIcon, LocationIcon } from "@/components/Icons";
import MobileGradientHeader from "@/components/MobileGradientHeader";

export default function GenerateQRScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const { showToast, toast, hideToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<AttendanceSessionResponse[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<AttendanceSessionResponse | null>(null);
  const [currentQR, setCurrentQR] = useState<any>(null);
  const [qrHistory, setQrHistory] = useState<any[]>([]);
  const [expirySeconds, setExpirySeconds] = useState<string>("10");
  const [loadingQR, setLoadingQR] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const contentMaxWidth = isDesktop ? 1280 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 12;

  const getMinutesFromHHmm = (time?: string) => {
    if (!time || !time.includes(":")) return null;
    const [h, m] = time.split(":");
    const hour = Number(h);
    const minute = Number(m);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
  };

  const getScheduleAvailability = (schedule: Schedule) => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = getMinutesFromHHmm(schedule.startTime);
    const endMinutes = getMinutesFromHHmm(schedule.endTime);

    if (startMinutes === null || endMinutes === null) {
      return {
        canCreate: false,
        statusText: "Không đủ dữ liệu thời gian",
        statusColor: "#92400E",
        statusBg: "#FEF3C7",
      };
    }

    if (nowMinutes < startMinutes) {
      return {
        canCreate: false,
        statusText: "Chưa đến giờ học - chưa thể tạo phiên",
        statusColor: "#92400E",
        statusBg: "#FEF3C7",
      };
    }

    if (nowMinutes > endMinutes) {
      return {
        canCreate: false,
        statusText: "Đã qua giờ học - không thể tạo phiên",
        statusColor: "#7F1D1D",
        statusBg: "#FEE2E2",
      };
    }

    return {
      canCreate: true,
      statusText: "Đang trong giờ học - có thể tạo phiên",
      statusColor: "#166534",
      statusBg: "#DCFCE7",
    };
  };

  const isSelectedSessionValid = (() => {
    if (!selectedSession) return false;

    return todaySchedules.some((schedule) => {
      const availability = getScheduleAvailability(schedule);
      if (!availability.canCreate) return false;

      const sameClass =
        !!selectedSession.classId &&
        selectedSession.classId === schedule.classId;
      const sameSubject = selectedSession.subjectId === schedule.subjectId;
      return sameClass || sameSubject;
    });
  })();

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
        teacherId: teacherId ?? undefined,
        active: true,
      });
      // Filter sessions by teacher & phương thức QR (nếu cần)
      const mySessions = allSessions.filter((s) => s.status === "ACTIVE");
      setSessions(mySessions);
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

    const seconds = parseInt(expirySeconds);
    if (isNaN(seconds) || seconds < 10 || seconds > 300) {
      showToast("Thời hạn phải từ 10 giây đến 5 phút", "error");
      return;
    }

    try {
      setLoadingQR(true);
      const teacherId = await getTeacherIdFromToken();
      const qr = await qrService.generateQR({
        sessionId: selectedSession.id,
        teacherId: teacherId ?? undefined,
        expirySeconds: seconds,
      });
      setCurrentQR(qr);
      await loadQRHistory();
      showToast("Tạo QR code thành công", "success");
    } catch (error: any) {
      console.error("Error generating QR:", error);
      showToast(
        error.response?.data?.message || "Không thể tạo QR code",
        "error",
      );
    } finally {
      setLoadingQR(false);
    }
  };

  const handleCreateSessionFromSchedule = async (schedule: Schedule) => {
    const availability = getScheduleAvailability(schedule);
    if (!availability.canCreate) {
      showToast(availability.statusText, "warning");
      return;
    }

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
          method: AttendanceMethod.QR,
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
      style={{ flex: 1, backgroundColor: "#F1F5F9" }}
      edges={["top"]}
    >
      <StatusBar style={isMobile ? "light" : "dark"} />

      {isMobile ? (
        <MobileGradientHeader
          title="Tạo mã QR"
          subtitle={`${sessions.length} phiên đang hoạt động`}
          icon="qr-code"
          actions={[
            {
              icon: "arrow-back",
              onPress: () => {
                if ((router as any).canGoBack?.()) {
                  router.back();
                  return;
                }
                router.push("/teacher/dashboard");
              },
              accessibilityLabel: "Quay lại trang trước",
            },
            {
              icon: "notifications",
              onPress: () => router.push("/teacher/notifications"),
              accessibilityLabel: "Mở thông báo",
            },
            {
              icon: "person",
              onPress: () => router.push("/teacher/profile"),
              accessibilityLabel: "Mở hồ sơ",
            },
          ]}
          style={{ marginHorizontal: 0, marginTop: 0, marginBottom: 12 }}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingTop: isMobile ? 0 : 14,
          paddingBottom: isMobile ? 110 : 28,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          isMobile ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadSessions();
                await loadTodaySchedules();
                if (selectedSession) {
                  await loadCurrentQR();
                  await loadQRHistory();
                }
                setRefreshing(false);
              }}
              colors={["#1E3A8A"]}
              tintColor="#1E3A8A"
            />
          ) : undefined
        }
      >
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Lịch dạy hôm nay */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: "#E5ECF6",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: "#0F172A",
                marginBottom: 4,
              }}
            >
              Lịch dạy hôm nay
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>
              Chỉ có thể tạo phiên điểm danh khi đang trong khung giờ của lịch
              học.
            </Text>

            {todaySchedules.length === 0 ? (
              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#DBEAFE",
                  backgroundColor: "#F8FAFF",
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Hôm nay không có lịch dạy để khởi tạo phiên điểm danh.
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {todaySchedules.map((item) => {
                    const availability = getScheduleAvailability(item);
                    const isSelected =
                      selectedSession?.classId === item.classId ||
                      selectedSession?.subjectId === item.subjectId;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        disabled={!availability.canCreate}
                        onPress={() => handleCreateSessionFromSchedule(item)}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? "#1E3A8A"
                            : availability.canCreate
                              ? "#DCE7FB"
                              : "#E5E7EB",
                          backgroundColor: availability.canCreate
                            ? isSelected
                              ? "#DBEAFE"
                              : "#F8FAFF"
                            : "#F8FAFC",
                          minWidth: 240,
                          opacity: availability.canCreate ? 1 : 0.92,
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
                          <CalendarIcon
                            size={14}
                            color={Colors.textSecondary}
                          />
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
                          <LocationIcon
                            size={14}
                            color={Colors.textSecondary}
                          />
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

                        <View
                          style={{
                            marginTop: 10,
                            alignSelf: "flex-start",
                            backgroundColor: availability.statusBg,
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color: availability.statusColor,
                              fontWeight: "700",
                            }}
                          >
                            {availability.statusText}
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontSize: 12,
                            color: availability.canCreate
                              ? Colors.primary
                              : "#94A3B8",
                            fontWeight: "600",
                            marginTop: 8,
                          }}
                        >
                          {availability.canCreate
                            ? isSelected
                              ? "Đã chọn phiên điểm danh"
                              : "Chọn để tạo phiên QR"
                            : "Không thể tạo điểm danh"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>

          {selectedSession && (
            <>
              {!isSelectedSessionValid ? (
                <View
                  style={{
                    backgroundColor: "#FFF7ED",
                    borderColor: "#FDBA74",
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#9A3412",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    Phiên hiện tại chưa hợp lệ để thao tác. Vui lòng chọn lịch
                    dạy đang trong giờ để bật các nút tạo/kết thúc điểm danh.
                  </Text>
                </View>
              ) : null}

              {/* Course Info */}
              <View
                style={{
                  flexDirection: isDesktop ? "row" : "column",
                  gap: isDesktop ? 24 : 0,
                  marginBottom: 14,
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
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "#E5ECF6",
                      padding: 16,
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
                        fontSize: 22,
                        fontWeight: "800",
                        color: "#0F172A",
                        marginBottom: 14,
                      }}
                    >
                      {selectedSession.subjectName}
                    </Text>
                    <View style={{ gap: 8 }}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
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
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
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
                        Thời hạn QR code (giây)
                      </Text>
                      <TextInput
                        value={expirySeconds}
                        onChangeText={setExpirySeconds}
                        keyboardType="numeric"
                        style={{
                          borderWidth: 1,
                          borderColor: "#D7E3F7",
                          borderRadius: 10,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          backgroundColor: "#F8FAFF",
                        }}
                        placeholder="10"
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          marginTop: 4,
                        }}
                      >
                        Từ 10 giây đến 5 phút (mặc định: 10 giây)
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
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: "#E5ECF6",
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
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: "#E5ECF6",
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
                        Sinh viên quét mã này để điểm danh. Mã có hiệu lực theo
                        thời hạn bạn đã cài đặt (10 giây - 5 phút).
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
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: "#E5ECF6",
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
                        <Text style={{ fontSize: 40, color: "#9CA3AF" }}>
                          □
                        </Text>
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
                  marginBottom: 14,
                  flexDirection: isDesktop ? "row" : "column",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    title={currentQR ? "Tạo mã mới" : "Tạo QR Code"}
                    onPress={handleGenerateQR}
                    loading={loadingQR}
                    disabled={!isSelectedSessionValid}
                  />
                </View>

                {selectedSession && (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelectedSessionValid
                        ? Colors.white
                        : "#F8FAFC",
                      opacity: isSelectedSessionValid ? 1 : 0.6,
                    }}
                    disabled={!isSelectedSessionValid}
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
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#E5ECF6",
                    padding: 16,
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

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}
