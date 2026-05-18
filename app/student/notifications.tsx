import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { notificationService, NotificationResponse, NotificationType } from '@/apis';
import { useToast } from '@/components/ToastProvider';
import { getWebShadow, getWebCursor } from '@/constants/webStyles';

export default function Notifications() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  // Reload notifications khi màn hình được focus lại
  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [filter])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);

      let data: NotificationResponse[];
      if (filter === 'unread') {
        data = await notificationService.getUnreadNotifications();
      } else {
        data = await notificationService.getNotifications();
      }

      setNotifications(data);

      // Load unread count
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error: any) {
      console.error("Error loading notifications:", error);
      showToast(
        error?.response?.data?.detail || error?.response?.data?.message || "Không thể tải thông báo",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const mapNotificationType = (type: NotificationType): 'success' | 'warning' | 'error' | 'info' => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'success';
      case NotificationType.WARNING:
        return 'warning';
      case NotificationType.ERROR:
        return 'error';
      case NotificationType.INFO:
      default:
        return 'info';
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      // Reload notifications
      await loadNotifications();
    } catch (error: any) {
      console.error("Error marking as read:", error);
      showToast(
        error?.response?.data?.detail || error?.response?.data?.message || "Không thể đánh dấu đã đọc",
        "error"
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Reload notifications
      await loadNotifications();
    } catch (error: any) {
      console.error("Error marking all as read:", error);
      showToast(
        error?.response?.data?.detail || error?.response?.data?.message || "Không thể đánh dấu tất cả đã đọc",
        "error"
      );
    }
  };

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const contentMaxWidth = isDesktop ? 800 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: "#3b82f6",
          paddingTop: isMobile ? 48 : 64,
          paddingBottom: 24,
          paddingHorizontal: paddingHorizontal,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
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
                  onPress={markAllAsRead}
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

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingHorizontal,
          paddingTop: 24,
          paddingBottom: isMobile ? 120 : 40,
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

          {/* Notification list */}
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ marginTop: 16, color: "#64748b", fontWeight: "600" }}>
                Đang tải thông báo...
              </Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <View
                style={{
                  width: 72, height: 72, borderRadius: 36,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="notifications-off-outline" size={34} color="#94a3b8" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#475569", marginBottom: 6 }}>
                Không có thông báo
              </Text>
              <Text style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
                {filter === "unread" ? "Bạn đã đọc tất cả thông báo rồi!" : "Chưa có thông báo nào."}
              </Text>
            </View>
          ) : (
            notifications.map((notification) => {
              const getNotifConfig = (type: NotificationType) => {
                const conf = {
                  [NotificationType.SUCCESS]: { icon: "checkmark-circle", color: "#10b981", bg: "#ecfdf5", label: "Thành công" },
                  [NotificationType.WARNING]: { icon: "warning", color: "#f59e0b", bg: "#fffbeb", label: "Cảnh báo" },
                  [NotificationType.ERROR]: { icon: "close-circle", color: "#ef4444", bg: "#fef2f2", label: "Lỗii" },
                  [NotificationType.INFO]: { icon: "information-circle", color: "#3b82f6", bg: "#eff6ff", label: "Thông tin" },
                };
                return conf[type] || conf[NotificationType.INFO];
              };
              const cfg = getNotifConfig(notification.type);
              return (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => !notification.isRead && markAsRead(notification.id)}
                  activeOpacity={0.75}
                  style={{
                    backgroundColor: notification.isRead ? "#fff" : "#eff6ff",
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: notification.isRead ? "#f1f5f9" : "#bfdbfe",
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    gap: 14,
                    ...getWebShadow(notification.isRead ? "sm" : "md"),
                    ...getWebCursor(),
                  }}
                >
                  {/* Icon */}
                  <View
                    style={{
                      width: 46, height: 46, borderRadius: 14,
                      backgroundColor: cfg.bg,
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Ionicons name={cfg.icon as any} size={24} color={cfg.color} />
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "800", color: "#1e293b", flex: 1 }} numberOfLines={1}>
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#3b82f6", marginRight: 8 }} />
                        )}
                      </View>
                    </View>

                    <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 19, marginBottom: 8 }}>
                      {notification.message}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View
                        style={{
                          backgroundColor: cfg.bg,
                          paddingHorizontal: 8, paddingVertical: 3,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.color }}>
                          {cfg.label}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                        {formatTime(notification.createdAt)}
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

// Updated: 2026-02-05
