import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import Card from '@/components/Card';
import { Colors } from '@/constants/colors';
import { notificationService, NotificationResponse, NotificationType } from '@/apis';
import Toast, { useToast } from '@/components/Toast';

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast, showToast, hideToast } = useToast();

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

  const getNotificationIcon = (type: NotificationType) => {
    const icons = {
      [NotificationType.SUCCESS]: '✓',
      [NotificationType.WARNING]: '⚠',
      [NotificationType.ERROR]: '✕',
      [NotificationType.INFO]: 'ℹ',
    };
    return icons[type] || 'ℹ';
  };

  const getNotificationColor = (type: NotificationType) => {
    const colors = {
      [NotificationType.SUCCESS]: Colors.success,
      [NotificationType.WARNING]: Colors.warning,
      [NotificationType.ERROR]: Colors.error,
      [NotificationType.INFO]: Colors.primary,
    };
    return colors[type] || Colors.primary;
  };

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 800 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />
      
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal, paddingVertical: 24, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          
          {/* Header Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row' }}>
              {[
                { key: 'all', label: `Tất cả (${notifications.length})` },
                { key: 'unread', label: `Chưa đọc (${unreadCount})` },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 18,
                    marginRight: 8,
                    backgroundColor: filter === item.key ? Colors.primary : Colors.gray100,
                  }}
                  onPress={() => setFilter(item.key as any)}
                >
                  <Text
                    style={{
                      fontWeight: '500',
                      fontSize: 14,
                      lineHeight: 20,
                      color: filter === item.key ? Colors.white : Colors.gray700,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: '500', color: Colors.primary }}>
                  Đánh dấu đã đọc
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notifications List */}
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ marginTop: 16, color: Colors.textSecondary }}>
                Đang tải thông báo...
              </Text>
            </View>
          ) : notifications.length === 0 ? (
            <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 36, lineHeight: 44, marginBottom: 12 }}>📭</Text>
              <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '500', marginBottom: 4, color: Colors.text }}>
                Không có thông báo
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: Colors.textSecondary }}>
                {filter === 'unread' ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo nào'}
              </Text>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                onPress={() => !notification.isRead && markAsRead(notification.id)}
                style={{
                  marginBottom: 12,
                  backgroundColor: notification.isRead ? Colors.white : '#E0F2FE',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      backgroundColor: getNotificationColor(notification.type) === Colors.success ? '#D1FAE5' :
                                     getNotificationColor(notification.type) === Colors.warning ? '#FEF3C7' :
                                     getNotificationColor(notification.type) === Colors.error ? '#FEE2E2' : '#DBEAFE'
                    }}
                  >
                    <Text style={{ fontSize: 20, lineHeight: 24, color: getNotificationColor(notification.type) }}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontWeight: '600', fontSize: 16, lineHeight: 24, color: Colors.text }}>
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: Colors.primary
                          }}
                        />
                      )}
                    </View>

                    <Text style={{ fontSize: 14, lineHeight: 20, marginBottom: 8, color: Colors.text }}>
                      {notification.message}
                    </Text>

                    <Text style={{ fontSize: 12, lineHeight: 16, color: Colors.textSecondary }}>
                      {formatTime(notification.createdAt)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}

        </View>
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}

// Updated: 2026-02-05
