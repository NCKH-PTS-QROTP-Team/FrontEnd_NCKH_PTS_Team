import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { ChartIcon } from "@/components/Icons";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Toast, { useToast } from "@/components/Toast";
import { reportService, AttendanceSummary, ClassAttendanceReport } from "@/apis";
import { getAuthToken } from "@/apis/config/apiClient";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function ReportsScreen() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [classReports, setClassReports] = useState<ClassAttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [summaryData, classReportsData] = await Promise.all([
        reportService.getAttendanceSummary(),
        reportService.getClassReports(),
      ]);
      setSummary(summaryData);
      setClassReports(classReportsData);
    } catch (error: any) {
      console.error("Error loading reports:", error);
      showToast(
        error.message || "Không thể tải báo cáo",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const blob = await reportService.exportExcel();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Bao_cao_diem_danh_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Đã tải file Excel thành công", "success");
      } else {
        const token = await getAuthToken();
        if (!token) {
          showToast("Vui lòng đăng nhập để tải file", "error");
          return;
        }
        const url = reportService.getExportExcelUrl();
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        const filename = `Bao_cao_diem_danh_${new Date().toISOString().slice(0, 10)}.xlsx`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, btoa(binary), {
          encoding: FileSystem.EncodingType.Base64,
        });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: "Lưu file Excel",
          });
          showToast("Đã mở hộp thoại lưu/chia sẻ file", "success");
        } else {
          showToast("Thiết bị không hỗ trợ chia sẻ file", "error");
        }
      }
    } catch (error: any) {
      console.error("Export Excel error:", error);
      showToast(error?.message || "Không thể xuất file Excel", "error");
    } finally {
      setExportingExcel(false);
    }
  };

  const reportStats = summary
    ? [
        {
          label: "Tỷ lệ điểm danh trung bình",
          value: `${summary.averageAttendanceRate.toFixed(1)}%`,
          color: Colors.success,
          trend: "",
        },
        {
          label: "Tổng số buổi học",
          value: summary.totalSessions.toString(),
          color: Colors.primary,
          trend: "",
        },
        {
          label: "Tổng sinh viên",
          value: summary.totalStudents.toString(),
          color: Colors.warning,
          trend: "",
        },
        {
          label: "Có mặt",
          value: summary.totalPresent.toString(),
          color: Colors.success,
          trend: "",
        },
      ]
    : [];

  const recentReports = [
    {
      id: 1,
      title: "Báo cáo điểm danh tháng 1/2026",
      date: "2026-01-15",
      type: "monthly",
      status: "completed",
    },
    {
      id: 2,
      title: "Báo cáo điểm danh tuần 2",
      date: "2026-01-08",
      type: "weekly",
      status: "completed",
    },
    {
      id: 3,
      title: "Báo cáo điểm danh lớp CS101",
      date: "2026-01-10",
      type: "class",
      status: "completed",
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
            maxWidth: isDesktop ? 1200 : "100%",
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
              Báo cáo điểm danh
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
              }}
            >
              Xem thống kê và báo cáo điểm danh chi tiết
            </Text>
          </View>

          {/* Loading State */}
          {loading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 48,
              }}
            >
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Đang tải báo cáo...
              </Text>
            </View>
          ) : (
            <>
              {/* Stats Grid */}
              <View
                style={{
                  flexDirection: isDesktop ? "row" : "column",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {reportStats.map((stat, index) => (
              <View
                key={index}
                style={{
                  flex: isDesktop ? 1 : undefined,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    marginBottom: 8,
                  }}
                >
                  {stat.label}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "700",
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </Text>
                  {stat.trend && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.textSecondary,
                      }}
                    >
                      {stat.trend}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Class Reports */}
          {classReports.length > 0 && (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 16,
                }}
              >
                Báo cáo theo lớp
              </Text>
              <ScrollView
                horizontal={isMobile}
                showsHorizontalScrollIndicator={false}
              >
                <View style={{ minWidth: isMobile ? undefined : "100%" }}>
                  {classReports.slice(0, 5).map((report, index) => (
                    <View
                      key={index}
                      style={{
                        padding: 16,
                        backgroundColor: "#F9FAFB",
                        borderRadius: 8,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: 8,
                        }}
                      >
                        {report.classCode} - {report.className}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: Colors.textSecondary,
                          }}
                        >
                          Tỷ lệ: {report.attendanceRate.toFixed(1)}%
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: Colors.textSecondary,
                          }}
                        >
                          Có mặt: {report.totalPresent}/{report.totalSessions * report.totalStudents}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Recent Reports */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 24,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Báo cáo gần đây
            </Text>

            {recentReports.map((report) => (
              <Card
                key={report.id}
                style={{ marginBottom: 12 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {report.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.textSecondary,
                      }}
                    >
                      {new Date(report.date).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    <Badge
                      variant={
                        report.type === "monthly"
                          ? "primary"
                          : report.type === "weekly"
                          ? "success"
                          : "warning"
                      }
                      size="small"
                    >
                      {report.type === "monthly"
                        ? "Tháng"
                        : report.type === "weekly"
                        ? "Tuần"
                        : "Lớp"}
                    </Badge>
                    <TouchableOpacity
                      style={{
                        padding: 8,
                        backgroundColor: Colors.primary + "15",
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors.primary,
                          fontWeight: "600",
                        }}
                      >
                        Xem
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}

            <TouchableOpacity
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: Colors.primary + "15",
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: Colors.primary,
                }}
              >
                Xem tất cả báo cáo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 24,
              marginTop: 24,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Tạo báo cáo mới
            </Text>
            <TouchableOpacity
              style={{
                padding: 16,
                backgroundColor: "#D1FAE5",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#A7F3D0",
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
              onPress={handleExportExcel}
              disabled={exportingExcel}
            >
              {exportingExcel ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <ChartIcon size={24} color="#10B981" />
              )}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {exportingExcel ? "Đang tải..." : "Xuất file Excel (theo lớp + theo sinh viên)"}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                gap: 12,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: isDesktop ? 1 : undefined,
                  padding: 16,
                  backgroundColor: "#F0F9FF",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#BAE6FD",
                }}
              >
                <ChartIcon size={24} color={Colors.primary} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginTop: 8,
                  }}
                >
                  Báo cáo theo lớp
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: isDesktop ? 1 : undefined,
                  padding: 16,
                  backgroundColor: "#F0FDF4",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#86EFAC",
                }}
              >
                <ChartIcon size={24} color="#10B981" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginTop: 8,
                  }}
                >
                  Báo cáo theo tháng
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: isDesktop ? 1 : undefined,
                  padding: 16,
                  backgroundColor: "#FEF3C7",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#FDE68A",
                }}
              >
                <ChartIcon size={24} color="#F59E0B" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginTop: 8,
                  }}
                >
                  Báo cáo theo tuần
                </Text>
              </TouchableOpacity>
            </View>
          </View>
            </>
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
