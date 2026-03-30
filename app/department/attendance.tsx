import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { attendanceService } from "@/apis/services/attendance.service";
import { AttendanceSessionResponse } from "@/apis/types/attendance.types";

// Utils
const TEAL = "#0ea5e9";

function dateToISO(d: Date) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function formatTime(isoString: string) {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function AttendanceMonitoringScreen() {
  const [sessions, setSessions] = useState<AttendanceSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const todayISO = dateToISO(new Date());
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal
  const [selectedSession, setSelectedSession] =
    useState<AttendanceSessionResponse | null>(null);

  const fetchSessions = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await attendanceService.getSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách phiên điểm danh");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Derived states
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        // Filter by date
        const sessionDate = session.startTime
          ? session.startTime.substring(0, 10)
          : "";
        if (sessionDate !== selectedDate) return false;

        // Filter by search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchClass =
            session.className?.toLowerCase().includes(q) || false;
          const matchSubject =
            session.subjectName?.toLowerCase().includes(q) || false;
          return matchClass || matchSubject;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );
  }, [sessions, selectedDate, searchQuery]);

  const changeDate = (daysCount: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + daysCount);
    setSelectedDate(dateToISO(d));
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let color = "#64748b";
    let bg = "#f1f5f9";
    let text = "Khác";

    if (status === "ACTIVE") {
      color = "#10b981";
      bg = "#ecfdf5";
      text = "Đang diễn ra";
    } else if (status === "COMPLETED") {
      color = "#3b82f6";
      bg = "#eff6ff";
      text = "Đã kết thúc";
    } else if (status === "CANCELLED") {
      color = "#ef4444";
      bg = "#fef2f2";
      text = "Đã hủy";
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{text}</Text>
      </View>
    );
  };

  const renderSessionCard = ({ item }: { item: AttendanceSessionResponse }) => {
    const present = item.present ?? 0;
    const total = item.total ?? 0;
    const isCompleted = item.status === "COMPLETED";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => setSelectedSession(item)}
      >
        <View style={styles.cardHeader}>
          <StatusBadge status={item.status} />
          <Text style={styles.timeText}>
            <Ionicons name="time-outline" size={14} color="#64748b" />{" "}
            {formatTime(item.startTime)}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.subjectName}>
            {item.subjectName || "Không có tên môn học"}
          </Text>
          <Text style={styles.className}>
            {item.className || "Không có tên lớp"}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color="#94a3b8" />
            <Text style={styles.metaText}>
              {item.description || "Chưa xếp phòng"}
            </Text>
          </View>
        </View>

        {isCompleted && total > 0 && (
          <View style={styles.cardFooter}>
            <View style={styles.progressWrap}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Tỷ lệ tham gia</Text>
                <Text style={styles.progressValue}>
                  {present}/{total} ({Math.round((present / total) * 100)}%)
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(present / total) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { padding: 0 }]}>
      <LinearGradient
        colors={["#1E3A8A", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 64,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          zIndex: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff" }}>
              Điểm danh
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                marginTop: 4,
              }}
            >
              Theo dõi điểm danh
            </Text>
          </View>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {/* Header / Top controls */}
      <View
        style={[styles.headerBar, { marginTop: 10, paddingHorizontal: 16 }]}
      >
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => changeDate(-1)}
          >
            <Ionicons name="chevron-back" size={20} color={TEAL} />
          </TouchableOpacity>

          <View style={styles.dateDisplay}>
            <Ionicons name="calendar" size={18} color={TEAL} />
            <Text style={styles.dateText}>
              {selectedDate === todayISO
                ? "Hôm nay"
                : new Date(selectedDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
            </Text>
          </View>

          <TouchableOpacity style={styles.navBtn} onPress={() => changeDate(1)}>
            <Ionicons name="chevron-forward" size={20} color={TEAL} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo Lớp hoặc Môn học..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={TEAL} />
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchSessions()}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : filteredSessions.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>
            Không có phiên điểm danh nào trong ngày này
          </Text>
          {selectedDate !== todayISO && (
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={() => setSelectedDate(todayISO)}
            >
              <Text style={styles.todayBtnText}>Trở về Hôm nay</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionCard}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => fetchSessions(true)}
          numColumns={Platform.OS === "web" && window.innerWidth >= 768 ? 2 : 1}
          key={Platform.OS === "web" && window.innerWidth >= 768 ? "2" : "1"}
        />
      )}

      {/* Details Modal */}
      <Modal
        visible={!!selectedSession}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedSession(null)}
      >
        {selectedSession && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi tiết phiên điểm danh</Text>
                <TouchableOpacity onPress={() => setSelectedSession(null)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Môn học:</Text>
                  <Text style={styles.detailValue}>
                    {selectedSession.subjectName || "N/A"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Lớp học:</Text>
                  <Text style={styles.detailValue}>
                    {selectedSession.className || "N/A"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phương thức:</Text>
                  <Text style={styles.detailValue}>
                    {selectedSession.method || "Mặc định"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bắt đầu:</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(selectedSession.startTime)}
                  </Text>
                </View>
                {selectedSession.endTime && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kết thúc:</Text>
                    <Text style={styles.detailValue}>
                      {formatTime(selectedSession.endTime)}
                    </Text>
                  </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.summaryTitle}>Tổng quan tham gia</Text>
                <View style={styles.statsGrid}>
                  <View
                    style={[
                      styles.statBox,
                      { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" },
                    ]}
                  >
                    <Text style={[styles.statBoxTitle, { color: "#059669" }]}>
                      Có mặt
                    </Text>
                    <Text style={[styles.statBoxValue, { color: "#059669" }]}>
                      {selectedSession.present ?? 0}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statBox,
                      { backgroundColor: "#fff7ed", borderColor: "#ffedd5" },
                    ]}
                  >
                    <Text style={[styles.statBoxTitle, { color: "#ea580c" }]}>
                      Đi trễ
                    </Text>
                    <Text style={[styles.statBoxValue, { color: "#ea580c" }]}>
                      {selectedSession.late ?? 0}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statBox,
                      { backgroundColor: "#fef2f2", borderColor: "#fee2e2" },
                    ]}
                  >
                    <Text style={[styles.statBoxTitle, { color: "#dc2626" }]}>
                      Vắng mặt
                    </Text>
                    <Text style={[styles.statBoxValue, { color: "#dc2626" }]}>
                      {selectedSession.absent ?? 0}
                    </Text>
                  </View>
                </View>

                {/* Future update: Detailed list of students */}
                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#3b82f6"
                  />
                  <Text style={styles.infoText}>
                    Tính năng xem chi tiết điểm danh của từng sinh viên sẽ được
                    cập nhật trong phiên bản tiếp theo.
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedSession(null)}
                >
                  <Text style={styles.closeBtnText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  headerBar: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 12,
    ...(Platform.OS === "web"
      ? {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }
      : {}),
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f9ff",
    alignItems: "center",
    justifyContent: "center",
  },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 180,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
    maxWidth: Platform.OS === "web" ? 400 : "100%",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: "#94a3b8",
    marginTop: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  todayBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  todayBtnText: {
    color: "#475569",
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flex: 1,
    margin: Platform.OS === "web" ? 8 : 0,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  cardBody: {
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  className: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#64748b",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  progressWrap: {
    width: "100%",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "bold",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  statBoxTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    gap: 10,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1d4ed8",
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "flex-end",
  },
  closeBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeBtnText: {
    color: "#475569",
    fontWeight: "bold",
  },
});
