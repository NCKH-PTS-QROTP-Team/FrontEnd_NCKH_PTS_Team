import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AttendanceStatusTag } from "@/components/AttendanceStatusTag";
import { attendanceService } from "@/apis";
import { getStudentIdFromToken } from "@/apis/utils/jwt";
import {
  AttendanceRecordResponse,
  AttendanceStatus,
  AttendanceMethod,
} from "@/apis/types/attendance.types";
import { useToast } from "@/components/ToastProvider";
import { LinearGradient } from "expo-linear-gradient";
import { DropdownPicker } from "@/components/DropdownPicker";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";

const BLUE = "#3b82f6";

export default function HistoryScreen() {
  const [records, setRecords] = useState<AttendanceRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "present" | "late" | "absent">(
    "all",
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>("all");
  const [selectedYear, setSelectedYear] = useState<string | null>("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const { showToast } = useToast();

  const scrollY = React.useRef(new Animated.Value(0)).current;

  // Extract unique subjects and years for filters
  const subjectOptions = useMemo(() => {
    const subjects = new Set<string>();
    records.forEach((r) => {
      if (r.subjectName) subjects.add(r.subjectName);
    });
    const opts = Array.from(subjects).map((subj) => ({
      label: subj,
      value: subj,
    }));
    opts.unshift({ label: "Tất cả", value: "all" });
    return opts;
  }, [records]);

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    records.forEach((r) => {
      const date = new Date(r.attendedAt || r.createdAt);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear().toString());
      }
    });
    const opts = Array.from(years)
      .sort((a, b) => b.localeCompare(a)) // sort descending
      .map((year) => ({ label: `Năm ${year}`, value: year }));
    opts.unshift({ label: "Tất cả", value: "all" });
    return opts;
  }, [records]);

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

  const mapStatusToUI = (
    status: AttendanceStatus,
  ): "present" | "late" | "absent" => {
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

  useEffect(() => {
    setPage(1);
  }, [filter, selectedSubject, selectedYear]);

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
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter by subject and year first to compute dynamic stats
  const contextRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSubject =
        selectedSubject === "all" || r.subjectName === selectedSubject;
      const date = new Date(r.attendedAt || r.createdAt);
      const matchYear =
        selectedYear === "all" ||
        (!isNaN(date.getTime()) &&
          date.getFullYear().toString() === selectedYear);
      return matchSubject && matchYear;
    });
  }, [records, selectedSubject, selectedYear]);

  // Tính stats từ data thật
  const stats = {
    total: contextRecords.length,
    present: contextRecords.filter((r) => r.status === AttendanceStatus.PRESENT)
      .length,
    late: contextRecords.filter((r) => r.status === AttendanceStatus.LATE)
      .length,
    absent: contextRecords.filter(
      (r) =>
        r.status === AttendanceStatus.ABSENT ||
        r.status === AttendanceStatus.EXCUSED,
    ).length,
  };

  const presentPercent =
    stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
  const latePercent =
    stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0;
  const absentPercent =
    stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0;

  // Filter records theo tab
  const filteredRecords = contextRecords.filter((record) => {
    if (filter === "all") return true;
    const uiStatus = mapStatusToUI(record.status);
    return uiStatus === filter;
  });

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 1024 : isTablet ? 800 : "100%";
  const paddingHorizontal = isDesktop ? 32 : isTablet ? 24 : 16;

  const HEADER_MAX_HEIGHT = isDesktop ? 300 : isTablet ? 260 : 240;
  const HEADER_MIN_HEIGHT = isDesktop ? 200 : isTablet ? 160 : 120;
  const HEADER_SCROLL_DISTANCE = Math.max(
    1,
    HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
  );

  const headerHeight =
    isDesktop || isTablet
      ? HEADER_MAX_HEIGHT
      : scrollY.interpolate({
          inputRange: [0, HEADER_SCROLL_DISTANCE],
          outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
          extrapolate: "clamp",
        });

  const contentOpacity =
    isDesktop || isTablet
      ? 1
      : scrollY.interpolate({
          inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
          outputRange: [1, 0.2, 0],
          extrapolate: "clamp",
        });

  const contentTranslateY =
    isDesktop || isTablet
      ? 0
      : scrollY.interpolate({
          inputRange: [0, HEADER_SCROLL_DISTANCE],
          outputRange: [0, -10],
          extrapolate: "clamp",
        });

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="light" />

      {/* ── Parallax Animated Hero Header ── */}
      <Animated.View
        style={{
          paddingTop: isMobile ? 48 : 64,
          paddingHorizontal: paddingHorizontal,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          zIndex: 10,
          overflow: "hidden",
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.32,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={["#1E3A8A", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
            flex: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginBottom: 12,
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
              <Ionicons name="time-outline" size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: 2,
                }}
              >
                Lịch sử điểm danh
              </Text>
              <Animated.Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  opacity: contentOpacity,
                }}
              >
                {stats.total} buổi đã học
              </Animated.Text>
            </View>
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
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff" }}>
                {presentPercent}%
              </Text>
            </View>
          </View>

          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            }}
          >
            <View style={{ marginBottom: 16, marginTop: 4 }}>
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
                    width: `${Math.min(presentPercent, 100)}%`,
                    backgroundColor:
                      presentPercent >= 90
                        ? "#34d399"
                        : presentPercent >= 75
                          ? "#fbbf24"
                          : "#f87171",
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

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
                  label: "Có mặt",
                  value: String(stats.present),
                  icon: "checkmark-circle" as const,
                },
                {
                  label: "Muộn",
                  value: String(stats.late),
                  icon: "time" as const,
                },
                {
                  label: "Vắng",
                  value: String(stats.absent),
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
                    style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingTop: HEADER_MAX_HEIGHT + 24,
          paddingBottom: isMobile ? 120 : 40,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Advanced Filters */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 16,
              zIndex: 10,
            }}
          >
            <DropdownPicker
              label="Năm học"
              placeholder="Chọn năm"
              options={yearOptions}
              selectedValue={selectedYear}
              onValueChange={setSelectedYear}
              themeColor={BLUE}
            />
            <DropdownPicker
              label="Môn học"
              placeholder="Chọn môn"
              options={subjectOptions}
              selectedValue={selectedSubject}
              onValueChange={setSelectedSubject}
              themeColor={BLUE}
            />
          </View>

          {/* Filter Tabs */}
          <View style={{ marginBottom: 20, zIndex: 1 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {[
                { id: "all", label: "Tất cả" },
                { id: "present", label: "Có mặt" },
                { id: "late", label: "Đi muộn" },
                { id: "absent", label: "Vắng" },
              ].map((tab) => {
                const isActive = filter === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setFilter(tab.id as any)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: isActive ? BLUE : "#fff",
                      borderWidth: 1,
                      borderColor: isActive ? BLUE : "#e2e8f0",
                      ...getWebShadow("sm"),
                      ...getWebCursor(),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isActive ? "700" : "600",
                        color: isActive ? "#fff" : "#64748b",
                      }}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

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
              {paginatedRecords.map((record) => {
                const { date, time } = formatDateTime(
                  record.attendedAt || record.createdAt,
                );
                const uiStatus = mapStatusToUI(record.status);
                return (
                  <View
                    key={record.id}
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 14,
                      borderWidth: 1,
                      borderColor: "#f1f5f9",
                      ...getWebShadow("md"),
                    }}
                  >
                    {/* Time indicator line */}
                    <View
                      style={{
                        width: 4,
                        height: "100%",
                        backgroundColor:
                          uiStatus === "present"
                            ? "#10b981"
                            : uiStatus === "late"
                              ? "#f59e0b"
                              : "#ef4444",
                        borderRadius: 4,
                        marginRight: 12,
                      }}
                    />

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: "#1e293b",
                              marginBottom: 2,
                            }}
                            numberOfLines={1}
                          >
                            {record.subjectName}
                          </Text>
                          <Text
                            style={{ fontSize: 13, color: "#64748b" }}
                            numberOfLines={1}
                          >
                            {record.subjectCode || record.classCode}
                          </Text>
                        </View>
                        <AttendanceStatusTag status={uiStatus} size="sm" />
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: 8,
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: "#f1f5f9",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#94a3b8"
                          />
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#64748b",
                              fontWeight: "500",
                            }}
                          >
                            {date} • {time}
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
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#64748b",
                            }}
                          >
                            {getMethodIcon(record.method)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 20,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: page === 1 ? "#f1f5f9" : BLUE + "15",
                      ...getWebCursor(),
                    }}
                  >
                    <Text
                      style={{
                        color: page === 1 ? "#94a3b8" : BLUE,
                        fontWeight: "600",
                      }}
                    >
                      Trang trước
                    </Text>
                  </TouchableOpacity>

                  <Text style={{ color: "#64748b", fontWeight: "600" }}>
                    {page} / {totalPages}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor:
                        page === totalPages ? "#f1f5f9" : BLUE + "15",
                      ...getWebCursor(),
                    }}
                  >
                    <Text
                      style={{
                        color: page === totalPages ? "#94a3b8" : BLUE,
                        fontWeight: "600",
                      }}
                    >
                      Trang sau
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:08
