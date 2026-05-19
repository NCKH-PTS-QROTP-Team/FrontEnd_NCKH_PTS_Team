import React, { useState, useEffect } from "react";
import {
  RefreshControl,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getWebShadow, getWebCursor } from "@/constants/webStyles";

// ─── Notification Types & Demo Data ──────────────────────────────────────────
export type NotifType = "attendance" | "warning" | "system" | "info";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string; // ISO string or relative
  read: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "attendance",
    title: "Điểm danh buổi học hoàn tất",
    body: "Lớp CS01 - Lập trình cơ bản đã điểm danh xong. 38/40 sinh viên có mặt.",
    time: "2026-03-15T01:10:00",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Sinh viên cần quan tâm",
    body: "Nguyễn Văn An (SV2021001) có tỷ lệ điểm danh dưới 70%. Cần liên hệ ngay.",
    time: "2026-03-15T00:30:00",
    read: false,
  },
  {
    id: "3",
    type: "system",
    title: "Cập nhật hệ thống",
    body: "Hệ thống PTS đã được nâng cấp lên phiên bản mới. Một số tính năng mới đã được bổ sung.",
    time: "2026-03-14T18:00:00",
    read: true,
  },
  {
    id: "4",
    type: "attendance",
    title: "Nhắc nhở: Lịch điểm danh",
    body: "Bạn có buổi học CS02 - Cơ sở dữ liệu vào lúc 13:00 hôm nay. Đừng quên mở điểm danh.",
    time: "2026-03-14T12:00:00",
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "Báo cáo tháng 3",
    body: "Báo cáo điểm danh tháng 3 đã sẵn sàng. Tỷ lệ điểm danh trung bình toàn khoa: 85%.",
    time: "2026-03-14T08:00:00",
    read: true,
  },
  {
    id: "6",
    type: "warning",
    title: "3 sinh viên vắng liên tiếp",
    body: "Lớp CS03 - Mạng máy tính có 3 sinh viên vắng mặt 3 buổi liên tiếp. Cần xử lý.",
    time: "2026-03-13T15:00:00",
    read: true,
  },
];

// ─── Notification config ──────────────────────────────────────────────────────
const NOTIF_CONFIG: Record<
  NotifType,
  { icon: string; color: string; bg: string; label: string }
> = {
  attendance: {
    icon: "checkmark-circle",
    color: "#10b981",
    bg: "#ecfdf5",
    label: "Điểm danh",
  },
  warning: {
    icon: "warning",
    color: "#ef4444",
    bg: "#fef2f2",
    label: "Cảnh báo",
  },
  system: {
    icon: "settings",
    color: "#6366f1",
    bg: "#eef2ff",
    label: "Hệ thống",
  },
  info: {
    icon: "information-circle",
    color: "#3b82f6",
    bg: "#eff6ff",
    label: "Thông tin",
  },
};

// ─── Relative time formatter ──────────────────────────────────────────────────
function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} ngày trước`;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const paddingHorizontal = isDesktop ? 24 : isMobile ? 16 : 20;

  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(displayed.length / PAGE_SIZE);
  const paginatedNotifications = displayed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const removeNotif = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setNotifications(DEMO_NOTIFICATIONS);
    } finally {
      setRefreshing(false);
    }
  };

  const renderListContent = () => {
    if (displayed.length === 0) {
      return (
        <View style={{ alignItems: "center", paddingVertical: 60 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Ionicons name="notifications-off-outline" size={34} color="#94a3b8" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#475569", marginBottom: 6 }}>
            Không có thông báo
          </Text>
          <Text style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
            {filter === "unread" ? "Bạn đã đọc tất cả thông báo rồi!" : "Chưa có thông báo nào."}
          </Text>
        </View>
      );
    }
    return paginatedNotifications.map((notif) => {
      const cfg = NOTIF_CONFIG[notif.type];
      return (
        <TouchableOpacity
          key={notif.id}
          onPress={() => markRead(notif.id)}
          activeOpacity={0.75}
          style={{
            backgroundColor: notif.read ? "#fff" : "#eff6ff",
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: notif.read ? "#f1f5f9" : "#bfdbfe",
            padding: 16,
            marginBottom: 12,
            flexDirection: "row",
            gap: 14,
            ...getWebShadow(notif.read ? "sm" : "md"),
            ...getWebCursor(),
          }}
        >
          {/* Icon */}
          <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: cfg.bg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Ionicons name={cfg.icon as any} size={24} color={cfg.color} />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1e293b", flex: 1 }} numberOfLines={1}>{notif.title}</Text>
                {!notif.read && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#3b82f6", marginRight: 8 }} />}
              </View>
              <TouchableOpacity onPress={() => removeNotif(notif.id)} style={{ padding: 4 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 19, marginBottom: 8 }}>{notif.body}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.color }}>{cfg.label}</Text>
              </View>
              <Text style={{ fontSize: 11, color: "#94a3b8" }}>{formatRelativeTime(notif.time)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="light" />

      {/* ── Mobile/Tablet Header ── */}
      {!isDesktop && (
        <View
          style={{
            backgroundColor: "#3b82f6",
            paddingTop: isMobile ? 48 : 64,
            paddingBottom: 24,
            paddingHorizontal,
            zIndex: 10,
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignItems: "center", justifyContent: "center",
                  ...getWebCursor(),
                }}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>
                  Thông báo
                </Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Tất cả đã đọc"}
                </Text>
              </View>

              {unreadCount > 0 && (
                <View>
                  <TouchableOpacity
                    onPress={markAllRead}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderWidth: 1.5,
                      borderColor: "rgba(255,255,255,0.35)",
                      ...getWebCursor(),
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>
                      Đọc tất cả
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* ── Content ── */}
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
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 800, width: "100%", alignSelf: "center" }}>
          {/* ── Desktop Header ── */}
          {isDesktop && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <View>
                <Text style={{ fontSize: 28, fontWeight: "800", color: "#1e293b" }}>
                  Thông báo
                </Text>
                <Text style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                  {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : "Bạn đã đọc tất cả thông báo"}
                </Text>
              </View>

              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={markAllRead}
                  style={{
                    backgroundColor: "#eff6ff",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: "#bfdbfe",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    ...getWebCursor(),
                  }}
                >
                  <Ionicons name="checkmark-done" size={18} color="#3b82f6" />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#3b82f6" }}>
                    Đánh dấu đã đọc
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Container ── */}
          {isDesktop ? (
            <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("md") }}>
              {/* Header inside container with tabs */}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 24, paddingTop: 16 }}>
                {(["unread", "all"] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 3,
                      borderBottomColor: filter === f ? "#004080" : "transparent",
                      ...getWebCursor(),
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "700", color: filter === f ? "#004080" : "#64748b" }}>
                      {f === "unread" ? "Chưa xem" : "Tất cả"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 1, backgroundColor: "#f1f5f9" }} />

              {/* List */}
              <View style={{ minHeight: 400, padding: 24 }}>
                {renderListContent()}
              </View>

              {/* Pagination */}
              <View>
                <View style={{ height: 1, backgroundColor: "#f1f5f9" }} />
                <View style={{ padding: 16, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                  <Text style={{ fontSize: 13, color: "#64748b", marginRight: 16 }}>
                    Từ {displayed.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} - {Math.min(page * PAGE_SIZE, displayed.length)} trên {displayed.length} dòng
                  </Text>
                  {totalPages > 1 && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <TouchableOpacity onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: 6, opacity: page === 1 ? 0.3 : 1, ...getWebCursor() }}>
                        <Ionicons name="chevron-back" size={18} color="#475569" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: 6, opacity: page === totalPages ? 0.3 : 1, ...getWebCursor() }}>
                        <Ionicons name="chevron-forward" size={18} color="#475569" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View>
              {/* Filter chips */}
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                {(["all", "unread"] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: filter === f ? "#3b82f6" : "#fff",
                      borderWidth: 1.5,
                      borderColor: filter === f ? "#3b82f6" : "#e2e8f0",
                      ...getWebShadow(filter === f ? "md" : "sm"),
                      ...getWebCursor(),
                    }}
                  >
                    <Text style={{
                      fontSize: 13, fontWeight: "700",
                      color: filter === f ? "#fff" : "#64748b",
                    }}>
                      {f === "all" ? `Tất cả (${notifications.length})` : `Chưa đọc (${unreadCount})`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* List */}
              {renderListContent()}

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, backgroundColor: "#fff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb", ...getWebShadow("sm") }}>
                  <TouchableOpacity onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: page === 1 ? "#f8fafc" : "#eff6ff", ...getWebCursor() }}>
                    <Text style={{ color: page === 1 ? "#94a3b8" : "#3b82f6", fontWeight: "700", fontSize: 13 }}>Trang trước</Text>
                  </TouchableOpacity>
                  <Text style={{ color: "#475569", fontWeight: "700", fontSize: 14 }}>
                    {page} / {totalPages}
                  </Text>
                  <TouchableOpacity onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: page === totalPages ? "#f8fafc" : "#eff6ff", ...getWebCursor() }}>
                    <Text style={{ color: page === totalPages ? "#94a3b8" : "#3b82f6", fontWeight: "700", fontSize: 13 }}>Trang sau</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
