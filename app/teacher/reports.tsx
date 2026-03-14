import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { reportService, type TeacherSummary, type ClassAttendanceReport } from "@/apis/services/report.service";
import { getAuthToken } from "@/apis/config/apiClient";
import Toast, { useToast } from "@/components/Toast";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

// ─── Constants ────────────────────────────────────────────────────────────────
const VIOLET = "#8b5cf6";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRateColor(rate: number) {
  if (rate >= 90) return "#10b981";
  if (rate >= 75) return "#f59e0b";
  return "#ef4444";
}
function getRateBg(rate: number) {
  if (rate >= 90) return "#ecfdf5";
  if (rate >= 75) return "#fffbeb";
  return "#fef2f2";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Visual bar chart row cho từng lớp học */
function ClassBarRow({
  cls,
  maxRate,
}: {
  cls: ClassAttendanceReport;
  maxRate: number;
}) {
  const rate = Math.round(cls.attendanceRate);
  const rateColor = getRateColor(rate);
  const barWidth = maxRate > 0 ? (rate / 100) * 100 : 0;

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            style={{ fontSize: 14, fontWeight: "700", color: "#1e293b" }}
            numberOfLines={1}
          >
            {cls.className}
          </Text>
          <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {cls.classCode} • {cls.totalStudents} SV • {cls.totalSessions} buổi
          </Text>
        </View>
        {/* Rate badge */}
        <View
          style={{
            backgroundColor: getRateBg(rate),
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderWidth: 1.5,
            borderColor: rateColor + "35",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "800", color: rateColor }}>
            {rate}%
          </Text>
        </View>
      </View>

      {/* Bar */}
      <View
        style={{
          height: 7,
          backgroundColor: "#e2e8f0",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${Math.min(barWidth, 100)}%`,
            backgroundColor: rateColor,
            borderRadius: 4,
          }}
        />
      </View>

      {/* Mini stats */}
      <View
        style={{ flexDirection: "row", gap: 12, marginTop: 10 }}
      >
        {[
          {
            label: "Có mặt",
            value: cls.totalPresent,
            color: "#10b981",
            icon: "checkmark-circle" as const,
          },
          {
            label: "Muộn",
            value: cls.totalLate,
            color: "#f59e0b",
            icon: "time" as const,
          },
          {
            label: "Vắng",
            value: cls.totalAbsent,
            color: "#ef4444",
            icon: "close-circle" as const,
          },
        ].map((s) => (
          <View
            key={s.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Ionicons name={s.icon} size={13} color={s.color} />
            <Text style={{ fontSize: 12, color: s.color, fontWeight: "600" }}>
              {s.value}
            </Text>
            <Text style={{ fontSize: 11, color: "#94a3b8" }}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportsScreen() {
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const { toast, showToast, hideToast } = useToast();

  const contentMaxWidth = isDesktop ? 960 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [summary, setSummary] = useState<TeacherSummary | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await reportService.getTeacherSummary();
      setSummary(data);
    } catch (error: any) {
      console.error("Error loading report:", error);
      showToast(
        error?.response?.data?.message || "Không thể tải dữ liệu báo cáo",
        "error"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
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
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

  // Derived
  const rate = Math.round(summary?.averageAttendanceRate ?? 0);
  const rateColor = getRateColor(rate);
  const classReports = summary?.classReports ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["top"]}>
      <StatusBar style="dark" />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={VIOLET} />
          <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 12 }}>
            Đang tải báo cáo...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal,
            paddingTop: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor={VIOLET}
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
            {/* ── Hero Bar ──────────────────────────────────────────────── */}
            <View
              style={{
                backgroundColor: VIOLET,
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                shadowColor: VIOLET,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="bar-chart" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: "#fff",
                      marginBottom: 2,
                    }}
                  >
                    Báo cáo điểm danh
                  </Text>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                    {summary?.totalClasses ?? 0} lớp •{" "}
                    {summary?.totalStudents ?? 0} sinh viên
                  </Text>
                </View>
                {/* Rate badge */}
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    alignItems: "center",
                    borderWidth: 1.5,
                    borderColor: "rgba(255,255,255,0.35)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: "#fff",
                    }}
                  >
                    {rate}%
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.8)",
                      marginTop: 1,
                    }}
                  >
                    Điểm danh TB
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    Tỷ lệ điểm danh trung bình
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    {rate}%
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.min(rate, 100)}%`,
                      backgroundColor:
                        rate >= 90
                          ? "#34d399"
                          : rate >= 75
                            ? "#fbbf24"
                            : "#f87171",
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>

              {/* Quick stats 4 cols */}
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 14,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                {[
                  {
                    label: "Buổi học",
                    value: String(summary?.totalSessions ?? 0),
                    icon: "calendar" as const,
                  },
                  {
                    label: "Có mặt",
                    value: String(summary?.totalPresent ?? 0),
                    icon: "checkmark-circle" as const,
                  },
                  {
                    label: "Muộn",
                    value: String(summary?.totalLate ?? 0),
                    icon: "time" as const,
                  },
                  {
                    label: "Vắng",
                    value: String(summary?.totalAbsent ?? 0),
                    icon: "close-circle" as const,
                  },
                ].map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      borderLeftWidth: idx > 0 ? 1 : 0,
                      borderLeftColor: "rgba(255,255,255,0.25)",
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={15}
                      color="rgba(255,255,255,0.7)"
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#fff",
                      }}
                    >
                      {item.value}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Charts Section (Row on Desktop) ── */}
            <View style={{
              flexDirection: isDesktop ? "row" : "column",
              gap: 20,
              marginBottom: 20,
            }}>
              {/* ── Pie Chart: Tỷ lệ chuyên cần (Tổng quan) ── */}
              <View
                style={{
                  flex: isDesktop ? 1 : undefined,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 18,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "#f59e0b18",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="pie-chart" size={18} color="#f59e0b" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      Tổng quan
                    </Text>
                  </View>
                </View>

                {summary && summary.totalSessions > 0 ? (
                  <View style={{ alignItems: "center" }}>
                    <PieChart
                      data={[
                        {
                          name: "Có mặt",
                          population: summary.totalPresent,
                          color: "#10b981",
                          legendFontColor: "#475569",
                          legendFontSize: 12,
                        },
                        {
                          name: "Đi muộn",
                          population: summary.totalLate,
                          color: "#f59e0b",
                          legendFontColor: "#475569",
                          legendFontSize: 12,
                        },
                        {
                          name: "Vắng",
                          population: summary.totalAbsent,
                          color: "#ef4444",
                          legendFontColor: "#475569",
                          legendFontSize: 12,
                        },
                      ]}
                      width={isDesktop ? (960 - 20) / 3 - 36 + 10 : width - 68}
                      height={180}
                      chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      }}
                      accessor={"population"}
                      backgroundColor={"transparent"}
                      paddingLeft={isMobile ? "0" : "10"}
                      center={[0, 0]}
                      absolute
                    />
                  </View>
                ) : (
                  <Text style={{ textAlign: "center", color: "#94a3b8", marginVertical: 20 }}>
                    Chưa có dữ liệu
                  </Text>
                )}
              </View>

              {/* ── Bar Chart: Điểm danh theo lớp ── */}
              <View
                style={{
                  flex: isDesktop ? 2 : undefined,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 18,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: VIOLET + "18",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="bar-chart-outline" size={18} color={VIOLET} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      Tỷ lệ chuyên cần các lớp
                    </Text>
                    <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                      Tỷ lệ % điểm danh trung bình của từng lớp
                    </Text>
                  </View>
                </View>

                {classReports.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                      data={{
                        labels: classReports.map((c) => c.classCode.substring(0, 8)),
                        datasets: [{ data: classReports.map((c) => Math.round(c.attendanceRate)) }],
                      }}
                      width={Math.max(isDesktop ? ((960 - 20) / 3) * 2 - 36 : width - 68, classReports.length * 60)}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix="%"
                      fromZero={true}
                      chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientFromOpacity: 0,
                        backgroundGradientTo: "#ffffff",
                        backgroundGradientToOpacity: 0,
                        fillShadowGradient: VIOLET,
                        fillShadowGradientOpacity: 1,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        style: { borderRadius: 16 },
                        barPercentage: 0.6,
                      }}
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                      }}
                      showValuesOnTopOfBars={true}
                    />
                  </ScrollView>
                ) : (
                  <Text style={{ textAlign: "center", color: "#94a3b8", marginVertical: 20 }}>
                    Chưa có dữ liệu
                  </Text>
                )}
              </View>
            </View>

            {/* ── Danh sách chi tiết từng lớp ───────────────────────────────── */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 18,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              {/* Section header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: VIOLET + "18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="list" size={18} color={VIOLET} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    Chi tiết điểm danh từng lớp
                  </Text>
                  <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                    Tỷ lệ chuyên cần từng lớp học
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: VIOLET + "18",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: VIOLET,
                    }}
                  >
                    {classReports.length} lớp
                  </Text>
                </View>
              </View>

              {classReports.length === 0 ? (
                <View
                  style={{ alignItems: "center", paddingVertical: 40 }}
                >
                  <Ionicons
                    name="school-outline"
                    size={48}
                    color="#cbd5e1"
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#94a3b8",
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    Chưa có dữ liệu lớp học
                  </Text>
                </View>
              ) : (
                classReports.map((cls) => (
                  <ClassBarRow
                    key={cls.classId}
                    cls={cls}
                    maxRate={100}
                  />
                ))
              )}
            </View>

            {/* ── At-risk legend ────────────────────────────────────────── */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "≥ 90%: Tốt", color: "#10b981", bg: "#ecfdf5" },
                { label: "75–89%: Khá", color: "#f59e0b", bg: "#fffbeb" },
                { label: "< 75%: Cần cải thiện", color: "#ef4444", bg: "#fef2f2" },
              ].map((l) => (
                <View
                  key={l.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: l.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: l.color + "30",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: l.color,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: l.color,
                    }}
                  >
                    {l.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* ── Export Card ───────────────────────────────────────────── */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 18,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              {/* Section header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#10b98118",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="download" size={18} color="#10b981" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    Xuất báo cáo
                  </Text>
                  <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                    Tải về file báo cáo điểm danh
                  </Text>
                </View>
              </View>

              {/* Excel export button */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleExportExcel}
                disabled={exportingExcel}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f0fdf4",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1.5,
                  borderColor: "#bbf7d0",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: "#dcfce7",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  {exportingExcel ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <Ionicons
                      name="document-text"
                      size={22}
                      color="#10b981"
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#15803d",
                      marginBottom: 2,
                    }}
                  >
                    Xuất file Excel
                  </Text>
                  <Text style={{ fontSize: 12, color: "#4ade80" }}>
                    Danh sách điểm danh chi tiết theo lớp & sinh viên
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#10b981",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    {exportingExcel ? "Đang tải..." : "Tải về"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* PDF button (placeholder, disabled) */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff5f5",
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1.5,
                  borderColor: "#fecdd3",
                  opacity: 0.6,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: "#ffe4e6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Ionicons name="document" size={22} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#991b1b",
                      marginBottom: 2,
                    }}
                  >
                    Xuất file PDF
                  </Text>
                  <Text style={{ fontSize: 12, color: "#fca5a5" }}>
                    Báo cáo tổng hợp (sắp ra mắt)
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#f1f5f9",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#94a3b8",
                    }}
                  >
                    Sắp ra mắt
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {toast && (
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </SafeAreaView>
  );
}
