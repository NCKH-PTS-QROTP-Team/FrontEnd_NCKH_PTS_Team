import React, { useState, useEffect } from "react";
import {
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

  const [notifications, setNotifications] =
    useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const removeNotif = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View
        style={{
          paddingTop: isMobile ? 48 : 64,
          paddingBottom: 24,
          paddingHorizontal,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          zIndex: 10,
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 6,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={["#1E3A8A", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>
                Thông báo
              </Text>
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                {unreadCount > 0
                  ? `${unreadCount} thông báo chưa đọc`
                  : "Tất cả đã đọc"}
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
                  }}
                >
                  <Text
                    style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}
                  >
                    Đọc tất cả
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 800, width: "100%", alignSelf: "center" }}>
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
                  backgroundColor: filter === f ? "#6366f1" : "#fff",
                  borderWidth: 1.5,
                  borderColor: filter === f ? "#6366f1" : "#e2e8f0",
                  shadowColor: filter === f ? "#6366f1" : "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: filter === f ? 0.2 : 0.04,
                  shadowRadius: 6,
                  elevation: filter === f ? 3 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: filter === f ? "#fff" : "#64748b",
                  }}
                >
                  {f === "all"
                    ? `Tất cả (${notifications.length})`
                    : `Chưa đọc (${unreadCount})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notification list */}
          {displayed.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="notifications-off-outline"
                  size={34}
                  color="#94a3b8"
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#475569",
                  marginBottom: 6,
                }}
              >
                Không có thông báo
              </Text>
              <Text
                style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}
              >
                {filter === "unread"
                  ? "Bạn đã đọc tất cả thông báo rồi!"
                  : "Chưa có thông báo nào."}
              </Text>
            </View>
          ) : (
            displayed.map((notif) => {
              const cfg = NOTIF_CONFIG[notif.type];
              return (
                <TouchableOpacity
                  key={notif.id}
                  onPress={() => markRead(notif.id)}
                  activeOpacity={0.75}
                  style={{
                    backgroundColor: notif.read ? "#fff" : "#faf5ff",
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: notif.read ? "#f1f5f9" : "#ddd6fe",
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    gap: 14,
                    shadowColor: notif.read ? "#000" : "#6366f1",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: notif.read ? 0.04 : 0.08,
                    shadowRadius: 8,
                    elevation: notif.read ? 1 : 3,
                  }}
                >
                  {/* Icon */}
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: cfg.bg,
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Ionicons
                      name={cfg.icon as any}
                      size={24}
                      color={cfg.color}
                    />
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color: "#1e293b",
                          }}
                          numberOfLines={1}
                        >
                          {notif.title}
                        </Text>
                        {!notif.read && (
                          <View
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 4,
                              backgroundColor: "#6366f1",
                            }}
                          />
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => removeNotif(notif.id)}
                        style={{ padding: 4 }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close" size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>

                    <Text
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        lineHeight: 19,
                        marginBottom: 8,
                      }}
                    >
                      {notif.body}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: cfg.bg,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                        {formatRelativeTime(notif.time)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
