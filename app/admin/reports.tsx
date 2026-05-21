import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import Card from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import Tabs from "@/components/Tabs";
import Badge from "@/components/Badge";
import { SkeletonCard } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/components/ToastProvider";
import {
  reportService,
  AttendanceSummary,
  ClassAttendanceReport,
  StudentAttendanceReport,
} from "@/apis/services/report.service";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [classReports, setClassReports] = useState<ClassAttendanceReport[]>([]);
  const [studentReports, setStudentReports] = useState<StudentAttendanceReport[]>([]);
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportService.getAttendanceSummary();
      setSummary(data);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Lỗi tải báo cáo";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClassReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportService.getClassReports();
      setClassReports(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || "Lỗi tải báo cáo lớp", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudentReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportService.getStudentReports();
      setStudentReports(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || "Lỗi tải báo cáo SV", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "class" && classReports.length === 0) loadClassReports();
    if (tab === "student" && studentReports.length === 0) loadStudentReports();
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      if (Platform.OS === "web") {
        const blob = await reportService.exportExcel();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bao-cao-diem-danh-${new Date().toISOString().split("T")[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Đã tải file Excel", "success");
      } else {
        showToast("Chức năng export chỉ hỗ trợ trên web", "info");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || "Lỗi xuất báo cáo", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <Tabs
        tabs={[
          { key: "overview", label: "Tổng quan" },
          { key: "class", label: "Theo lớp" },
          { key: "student", label: "Theo SV" },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            padding: 16,
            maxWidth: 1200,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {activeTab === "overview" && (
            <>
              {/* Summary Stats */}
              {loading ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8, marginBottom: 16 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={{ width: "50%", paddingHorizontal: 8, marginBottom: 12 }}>
                      <SkeletonCard lines={2} />
                    </View>
                  ))}
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginBottom: isMobile ? 16 : 24,
                    marginHorizontal: -8,
                  }}
                >
                  {[
                    {
                      label: "Tổng buổi học",
                      value: summary?.totalSessions?.toLocaleString() || "0",
                      color: Colors.primary,
                    },
                    {
                      label: "Tổng sinh viên",
                      value: summary?.totalStudents?.toLocaleString() || "0",
                      color: Colors.success,
                    },
                    {
                      label: "Tỷ lệ điểm danh TB",
                      value: `${summary?.averageAttendanceRate || 0}%`,
                      color: Colors.warning,
                    },
                    {
                      label: "Tổng có mặt",
                      value: summary?.totalPresent?.toLocaleString() || "0",
                      color: Colors.info,
                    },
                  ].map((stat, index) => (
                    <View key={index} style={{ width: "50%", paddingHorizontal: 8, marginBottom: 12 }}>
                      <Card>
                        <Text
                          style={{
                            fontSize: 28,
                            fontWeight: "700",
                            marginBottom: 4,
                            color: stat.color,
                          }}
                        >
                          {stat.value}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: Colors.textSecondary,
                          }}
                        >
                          {stat.label}
                        </Text>
                      </Card>
                    </View>
                  ))}
                </View>
              )}

              {/* Attendance Breakdown */}
              {summary && (
                <Card style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 16,
                      marginBottom: 12,
                      color: Colors.text,
                    }}
                  >
                    Chi tiết điểm danh
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text style={{ fontSize: 24, fontWeight: "700", color: Colors.success }}>
                        {summary.totalPresent}
                      </Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Có mặt</Text>
                    </View>
                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text style={{ fontSize: 24, fontWeight: "700", color: Colors.warning }}>
                        {summary.totalLate}
                      </Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Muộn</Text>
                    </View>
                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text style={{ fontSize: 24, fontWeight: "700", color: Colors.error }}>
                        {summary.totalAbsent}
                      </Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Vắng</Text>
                    </View>
                  </View>
                </Card>
              )}
            </>
          )}

          {activeTab === "class" && (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 12,
                  color: Colors.textSecondary,
                }}
              >
                {classReports.length} lớp học
              </Text>
              {loading ? (
                [1, 2, 3].map((i) => <SkeletonCard key={i} lines={3} />)
              ) : classReports.length === 0 ? (
                <Card style={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ color: Colors.textSecondary }}>
                    Chưa có dữ liệu báo cáo lớp học
                  </Text>
                </Card>
              ) : (
                classReports.map((cr) => (
                  <Card key={cr.classId} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <View>
                        <Text style={{ fontWeight: "600", fontSize: 15, color: Colors.text }}>
                          {cr.classCode}
                        </Text>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                          {cr.className}
                        </Text>
                      </View>
                      <Badge variant="primary" size="small">
                        {cr.attendanceRate}%
                      </Badge>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 12, color: Colors.success }}>✓ {cr.totalPresent}</Text>
                      <Text style={{ fontSize: 12, color: Colors.warning }}>⏱ {cr.totalLate}</Text>
                      <Text style={{ fontSize: 12, color: Colors.error }}>✕ {cr.totalAbsent}</Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                        SV: {cr.totalStudents} | Buổi: {cr.totalSessions}
                      </Text>
                    </View>
                  </Card>
                ))
              )}
            </>
          )}

          {activeTab === "student" && (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 12,
                  color: Colors.textSecondary,
                }}
              >
                {studentReports.length} sinh viên
              </Text>
              {loading ? (
                [1, 2, 3].map((i) => <SkeletonCard key={i} lines={3} />)
              ) : studentReports.length === 0 ? (
                <Card style={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ color: Colors.textSecondary }}>
                    Chưa có dữ liệu báo cáo sinh viên
                  </Text>
                </Card>
              ) : (
                studentReports.map((sr) => (
                  <Card key={`${sr.studentId}-${sr.classId}`} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <View>
                        <Text style={{ fontWeight: "600", fontSize: 15, color: Colors.text }}>
                          {sr.studentName}
                        </Text>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                          {sr.className}
                        </Text>
                      </View>
                      <Badge
                        variant={sr.attendanceRate >= 80 ? "success" : sr.attendanceRate >= 50 ? "warning" : "error"}
                        size="small"
                      >
                        {sr.attendanceRate}%
                      </Badge>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 12, color: Colors.success }}>✓ {sr.presentCount}</Text>
                      <Text style={{ fontSize: 12, color: Colors.warning }}>⏱ {sr.lateCount}</Text>
                      <Text style={{ fontSize: 12, color: Colors.error }}>✕ {sr.absentCount}</Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                        Tổng: {sr.totalSessions}
                      </Text>
                    </View>
                  </Card>
                ))
              )}
            </>
          )}

          {/* Export Section */}
          <Card
            style={{
              marginTop: isMobile ? 16 : 24,
              padding: isMobile ? 16 : 24,
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                marginBottom: isMobile ? 16 : 20,
                fontSize: isMobile ? 16 : 18,
                color: Colors.text,
              }}
            >
              Xuất báo cáo
            </Text>
            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                marginHorizontal: -8,
                gap: isMobile ? 12 : 0,
              }}
            >
              <View
                style={{
                  flex: isMobile ? undefined : 1,
                  paddingHorizontal: 8,
                }}
              >
                <PrimaryButton
                  title={exporting ? "Đang xuất..." : "Excel"}
                  variant="outline"
                  onPress={handleExportExcel}
                  disabled={exporting}
                />
              </View>
              <View
                style={{
                  flex: isMobile ? undefined : 1,
                  paddingHorizontal: 8,
                }}
              >
                <PrimaryButton
                  title="PDF"
                  variant="outline"
                  onPress={() => showToast("Chức năng PDF sẽ sớm được hỗ trợ", "info")}
                />
              </View>
              <View
                style={{
                  flex: isMobile ? undefined : 1,
                  paddingHorizontal: 8,
                }}
              >
                <PrimaryButton
                  title="CSV"
                  variant="outline"
                  onPress={() => showToast("Chức năng CSV sẽ sớm được hỗ trợ", "info")}
                />
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
