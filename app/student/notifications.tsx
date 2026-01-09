import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import Card from '@/components/Card';
import { Colors } from '@/constants/colors';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  time: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'OTP sắp hết hạn',
    message: 'OTP cho buổi học Lập trình cơ bản sẽ hết hạn trong 30 giây',
    type: 'warning',
    time: '2 phút trước',
    isRead: false,
  },
  {
    id: '2',
    title: 'Điểm danh thành công',
    message: 'Bạn đã điểm danh thành công cho môn Cơ sở dữ liệu',
    type: 'success',
    time: '1 giờ trước',
    isRead: false,
  },
  {
    id: '3',
    title: 'Điểm danh thất bại',
    message: 'OTP không hợp lệ. Vui lòng thử lại',
    type: 'error',
    time: '2 giờ trước',
    isRead: true,
  },
  {
    id: '4',
    title: 'Buổi học sắp bắt đầu',
    message: 'Lập trình cơ bản sẽ bắt đầu trong 15 phút tại phòng A102',
    type: 'info',
    time: '3 giờ trước',
    isRead: true,
  },
  {
    id: '5',
    title: 'Cảnh báo vắng học',
    message: 'Bạn đã vắng 3/15 buổi học môn Hệ điều hành',
    type: 'warning',
    time: '1 ngày trước',
    isRead: true,
  },
];

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ',
    };
    return icons[type as keyof typeof icons] || 'ℹ';
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      success: Colors.success,
      warning: Colors.warning,
      error: Colors.error,
      info: Colors.primary,
    };
    return colors[type as keyof typeof colors] || Colors.primary;
  };

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 800 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />
      <AppHeader title="Thông báo" showLogout={true} />
      
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
          {filteredNotifications.length === 0 ? (
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
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                onPress={() => markAsRead(notification.id)}
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
                      {notification.time}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}

        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:08
