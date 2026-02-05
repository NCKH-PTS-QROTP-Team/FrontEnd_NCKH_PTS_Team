import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, useWindowDimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AttendanceStatusTag } from "@/components/AttendanceStatusTag";
import { attendanceService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import { AttendanceRecordResponse, AttendanceStatus, AttendanceMethod } from "@/apis/types/attendance.types";
import Toast, { useToast } from "@/components/Toast";

export default function HistoryScreen() {
  const [records, setRecords] = useState<AttendanceRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "present" | "late" | "absent">("all");
  const { toast, showToast, hideToast } = useToast();

  const getMethodIcon = (method: AttendanceMethod) => {
    switch (method) {
      case AttendanceMethod.QR:
        return "QR";
      case AttendanceMethod.OTP:
        return "123";
      case AttendanceMethod.FACE:
        return "Face";
      default:
        return "-";
    }
  };

  const getMethodLabel = (method: AttendanceMethod) => {
    switch (method) {
      case AttendanceMethod.QR:
        return "qr";
      case AttendanceMethod.OTP:
        return "otp";
      case AttendanceMethod.FACE:
        return "face";
      default:
        return "none";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date: dateStr, time: timeStr };
  };

  const mapStatusToUI = (status: AttendanceStatus): "present" | "late" | "absent" => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "present";
      case AttendanceStatus.LATE:
        return "late";
      case AttendanceStatus.ABSENT:
      case AttendanceStatus.EXCUSED:
        return "absent";
      default:
        return "absent";
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const studentId = await getStudentIdFromToken();
      if (!studentId) {
        showToast("Không tìm thấy thông tin sinh viên", "error");
        return;
      }

      const recordsData = await attendanceService.getRecords({ studentId });
      // Sắp xếp theo thời gian mới nhất trước
      recordsData.sort((a, b) => {
        const dateA = new Date(a.attendedAt || a.createdAt).getTime();
        const dateB = new Date(b.attendedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      setRecords(recordsData);
    } catch (error: any) {
      console.error("Error loading history:", error);
      showToast(
        error?.response?.data?.message || "Không thể tải lịch sử điểm danh",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Tính stats từ data thật
  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
    late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
    absent: records.filter((r) => r.status === AttendanceStatus.ABSENT || r.status === AttendanceStatus.EXCUSED).length,
  };

  const presentPercent = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
  const latePercent = stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0;
  const absentPercent = stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0;

  // Filter records theo tab
  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true;
    const uiStatus = mapStatusToUI(record.status);
    return uiStatus === filter;
  });

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 800 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      edges={["top"]}
    >
      <StatusBar style="dark" />

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
          {/* Stats Summary */}
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
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Tổng quan
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    lineHeight: 32,
                    fontWeight: "bold",
                    color: "#10B981",
                  }}
                >
                  {presentPercent}%
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    marginTop: 4,
                  }}
                >
                  Có mặt
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: "#E5E7EB" }} />
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    lineHeight: 32,
                    fontWeight: "bold",
                    color: "#F59E0B",
                  }}
                >
                  {latePercent}%
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    marginTop: 4,
                  }}
                >
                  Đi muộn
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: "#E5E7EB" }} />
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    lineHeight: 32,
                    fontWeight: "bold",
                    color: "#EF4444",
                  }}
                >
                  {absentPercent}%
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#6B7280",
                    marginTop: 4,
                  }}
                >
                  Vắng
                </Text>
              </View>
            </View>
          </View>

          {/* History List */}
          <Text
            style={{
              fontSize: 18,
              lineHeight: 28,
              fontWeight: "bold",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Lịch sử chi tiết
          </Text>

          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#3FA9F5" />
              <Text style={{ marginTop: 16, color: "#6B7280" }}>
                Đang tải lịch sử...
              </Text>
            </View>
          ) : filteredRecords.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text style={{ fontSize: 16, color: "#6B7280" }}>
                {filter === "all"
                  ? "Chưa có lịch sử điểm danh"
                  : `Chưa có bản ghi "${filter === "present" ? "Có mặt" : filter === "late" ? "Đi muộn" : "Vắng"}"`}
              </Text>
            </View>
          ) : (
            <View>
              {filteredRecords.map((record) => {
                const { date, time } = formatDateTime(
                  record.attendedAt || record.createdAt
                );
                const uiStatus = mapStatusToUI(record.status);
                return (
                  <View
                    key={record.id}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            lineHeight: 24,
                            fontWeight: "bold",
                            color: "#111827",
                            marginBottom: 4,
                          }}
                        >
                          {record.subjectName}
                        </Text>
                        <Text
                          style={{ fontSize: 14, lineHeight: 20, color: "#6B7280" }}
                        >
                          {record.subjectCode || record.classCode}
                        </Text>
                      </View>
                      <AttendanceStatusTag status={uiStatus} size="sm" />
                    </View>

                    <View
                      style={{
                        height: 1,
                        backgroundColor: "#F3F4F6",
                        marginVertical: 12,
                      }}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <Text
                          style={{ fontSize: 14, lineHeight: 20, color: "#6B7280" }}
                        >
                          {date}
                        </Text>
                        <Text
                          style={{ fontSize: 14, lineHeight: 20, color: "#6B7280" }}
                        >
                          {time}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            lineHeight: 20,
                            fontWeight: "600",
                            color: "#374151",
                          }}
                        >
                          {getMethodIcon(record.method)}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            lineHeight: 20,
                            color: "#6B7280",
                            textTransform: "lowercase",
                          }}
                        >
                          {getMethodLabel(record.method)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
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

// Updated: 2026-01-02 13:16:08
