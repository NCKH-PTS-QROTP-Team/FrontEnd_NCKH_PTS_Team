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
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { reportService } from "@/apis";
import type { AttendanceSummary, ClassAttendanceReport } from "@/apis/services/report.service";
import { getAuthToken } from "@/apis/config/apiClient";
import { useToast } from "@/components/ToastProvider";

export default function ReportsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const paddingH = isDesktop ? 32 : isTablet ? 24 : 16;

  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [classReports, setClassReports] = useState<ClassAttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [summaryData, classData] = await Promise.all([
        reportService.getAttendanceSummary().catch(() => null),
        reportService.getClassReports().catch(() => []),
      ]);
      setSummary(summaryData);
      setClassReports(classData || []);
    } catch (error: any) {
      console.error("Error loading reports:", error);
      showToast("Không thể tải báo cáo", "error");
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
        showToast("Vui lòng sử dụng web để tải file Excel", "error");
      }
    } catch (error: any) {
      console.error("Export error:", error);
      showToast(error?.message || "Không thể xuất file Excel", "error");
    } finally {
      setExportingExcel(false);
    }
  };

  const statCards = summary
    ? [
        { label: "Tỷ lệ điểm danh TB", value: `${summary.averageAttendanceRate.toFixed(1)}%`, color: "#10B981", icon: "checkmark-circle" as const },
        { label: "Tổng buổi học", value: summary.totalSessions.toString(), color: "#2563EB", icon: "calendar" as const },
        { label: "Tổng sinh viên", value: summary.totalStudents.toString(), color: "#7C3AED", icon: "people" as const },
        { label: "Có mặt", value: summary.totalPresent.toString(), color: "#059669", icon: "person-add" as const },
      ]
    : [];

  const statColumns = isDesktop ? 4 : isTablet ? 2 : 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: paddingH, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center" }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <View>
              <Text style={{ fontSize: 26, fontWeight: "700", color: "#111827", marginBottom: 4 }}>
                Báo cáo & Thống kê
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                Tổng hợp điểm danh toàn khoa
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleExportExcel}
              disabled={exportingExcel || loading}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: exportingExcel ? "#D1FAE5" : "#10B981",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 10,
                ...(Platform.OS === "web" ? { cursor: exportingExcel ? "not-allowed" : "pointer" } as any : {}),
              }}
            >
              {exportingExcel ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              )}
              <Text style={{ fontSize: 14, fontWeight: "600", color: exportingExcel ? "#059669" : "#FFFFFF" }}>
                {exportingExcel ? "Đang tải..." : "Xuất Excel"}
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 64 }}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 16 }}>Đang tải báo cáo...</Text>
            </View>
          ) : (
            <>
              {/* Stats Grid */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                {statCards.map((stat, i) => (
                  <View
                    key={i}
                    style={{
                      flex: statColumns === 1 ? 1 : 0,
                      flexBasis: `${100 / statColumns - 2}%`,
                      minWidth: 140,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: 18,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: stat.color + "12", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <Ionicons name={stat.icon} size={20} color={stat.color} />
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 2 }}>{stat.value}</Text>
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {/* Class Reports Table */}
              {classReports.length > 0 && (
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 24 }}>
                  <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 16 }}>
                    Báo cáo theo lớp ({classReports.length})
                  </Text>

                  {classReports.map((report, i) => {
                    const rate = report.attendanceRate ?? 0;
                    const rateColor = rate >= 80 ? "#10B981" : rate >= 60 ? "#F59E0B" : "#EF4444";
                    return (
                      <View
                        key={i}
                        style={{
                          padding: 14,
                          backgroundColor: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                          borderRadius: 10,
                          marginBottom: 6,
                          flexDirection: isDesktop ? "row" : "column",
                          alignItems: isDesktop ? "center" : "flex-start",
                          gap: isDesktop ? 16 : 8,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }} numberOfLines={1}>
                            {report.className || report.classCode}
                          </Text>
                          {report.classCode && report.className && (
                            <Text style={{ fontSize: 12, color: "#9CA3AF" }}>{report.classCode}</Text>
                          )}
                        </View>

                        <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
                          <View style={{ alignItems: "center", minWidth: 50 }}>
                            <Text style={{ fontSize: 13, color: "#6B7280" }}>SV</Text>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{report.totalStudents}</Text>
                          </View>
                          <View style={{ alignItems: "center", minWidth: 50 }}>
                            <Text style={{ fontSize: 13, color: "#6B7280" }}>Buổi</Text>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{report.totalSessions}</Text>
                          </View>
                          <View style={{ alignItems: "center", minWidth: 50 }}>
                            <Text style={{ fontSize: 13, color: "#6B7280" }}>Có mặt</Text>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: "#10B981" }}>{report.totalPresent}</Text>
                          </View>
                          <View style={{ alignItems: "center", minWidth: 50 }}>
                            <Text style={{ fontSize: 13, color: "#6B7280" }}>Vắng</Text>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: "#EF4444" }}>{report.totalAbsent}</Text>
                          </View>
                          <View style={{ alignItems: "center", minWidth: 60 }}>
                            <Text style={{ fontSize: 13, color: "#6B7280" }}>Tỷ lệ</Text>
                            <Text style={{ fontSize: 14, fontWeight: "700", color: rateColor }}>{rate.toFixed(1)}%</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Empty state */}
              {classReports.length === 0 && (
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 48, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" }}>
                  <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#6B7280", marginTop: 16 }}>
                    Chưa có dữ liệu báo cáo
                  </Text>
                  <Text style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4, textAlign: "center" }}>
                    Dữ liệu sẽ xuất hiện sau khi có phiên điểm danh
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
