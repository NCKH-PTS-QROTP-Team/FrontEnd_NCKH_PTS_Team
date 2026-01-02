import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

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

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Thông báo" />
      
      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 800, width: '100%', alignSelf: 'center' }}>
          
          {/* Header Actions */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row">
              {[
                { key: 'all', label: `Tất cả (${notifications.length})` },
                { key: 'unread', label: `Chưa đọc (${unreadCount})` },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  className="px-4 py-2 rounded-full mr-2"
                  style={{
                    backgroundColor: filter === item.key ? Colors.primary : Colors.gray100,
                  }}
                  onPress={() => setFilter(item.key as any)}
                >
                  <Text
                    className="font-medium text-sm"
                    style={{
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
                <Text className="text-sm font-medium" style={{ color: Colors.primary }}>
                  Đánh dấu đã đọc
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card className="items-center py-8">
              <Text className="text-4xl mb-3">📭</Text>
              <Text className="text-base font-medium mb-1" style={{ color: Colors.text }}>
                Không có thông báo
              </Text>
              <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                {filter === 'unread' ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo nào'}
              </Text>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                onPress={() => markAsRead(notification.id)}
                className="mb-3"
                style={{
                  backgroundColor: notification.isRead ? Colors.white : Colors.infoLight,
                  opacity: notification.isRead ? 1 : 1,
                }}
              >
                <View className="flex-row">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: getNotificationColor(notification.type) + '20' }}
                  >
                    <Text style={{ fontSize: 20, color: getNotificationColor(notification.type) }}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="font-semibold" style={{ color: Colors.text }}>
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: Colors.primary }}
                        />
                      )}
                    </View>

                    <Text className="text-sm mb-2" style={{ color: Colors.text }}>
                      {notification.message}
                    </Text>

                    <Text className="text-xs" style={{ color: Colors.textSecondary }}>
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
