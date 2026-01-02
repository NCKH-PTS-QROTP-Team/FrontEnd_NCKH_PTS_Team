import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { mockAttendanceSessions } from '../../constants/mockData';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

export default function AttendanceSessions() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredSessions = mockAttendanceSessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Giám sát điểm danh" showLogout={true} />
      
      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          {/* Summary Cards */}
          <View className="flex-row mb-4 -mx-2">
            <View className="flex-1 px-2">
              <Card>
                <Text className="text-3xl font-bold mb-1" style={{ color: Colors.primary }}>
                  {mockAttendanceSessions.filter(s => s.status === 'active').length}
                </Text>
                <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                  Đang diễn ra
                </Text>
              </Card>
            </View>
            <View className="flex-1 px-2">
              <Card>
                <Text className="text-3xl font-bold mb-1" style={{ color: Colors.success }}>
                  {mockAttendanceSessions.reduce((sum, s) => sum + s.present, 0)}
                </Text>
                <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                  Có mặt
                </Text>
              </Card>
            </View>
            <View className="flex-1 px-2">
              <Card>
                <Text className="text-3xl font-bold mb-1" style={{ color: Colors.error }}>
                  {mockAttendanceSessions.reduce((sum, s) => sum + s.absent, 0)}
                </Text>
                <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                  Vắng mặt
                </Text>
              </Card>
            </View>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'active', label: 'Đang diễn ra' },
                { key: 'completed', label: 'Đã kết thúc' },
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
          </ScrollView>

          {/* Sessions List */}
          <Text className="text-sm mb-3" style={{ color: Colors.textSecondary }}>
            {filteredSessions.length} buổi học
          </Text>

          {filteredSessions.map((session) => (
            <Card key={session.id} onPress={() => alert(`Chi tiết ${session.className}`)} className="mb-3">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="font-semibold text-base mr-2" style={{ color: Colors.text }}>
                      {session.classCode}
                    </Text>
                    <Badge
                      label={session.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                      variant={session.status === 'active' ? 'success' : 'gray'}
                      size="sm"
                    />
                    <Badge
                      label={session.method.toUpperCase()}
                      variant="primary"
                      size="sm"
                    />
                  </View>

                  <Text className="text-sm mb-1" style={{ color: Colors.text }}>
                    {session.subject}
                  </Text>

                  <View className="flex-row items-center mb-2">
                    <Text className="text-xs mr-1" style={{ color: Colors.textSecondary }}>👨‍🏫</Text>
                    <Text className="text-xs mr-3" style={{ color: Colors.textSecondary }}>
                      {session.teacher}
                    </Text>
                    <Text className="text-xs mr-1" style={{ color: Colors.textSecondary }}>⏰</Text>
                    <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                      {session.startTime}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Attendance Stats */}
              <View className="flex-row border-t pt-3" style={{ borderTopColor: Colors.border }}>
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold mb-1" style={{ color: Colors.success }}>
                    {session.present}
                  </Text>
                  <Text className="text-xs" style={{ color: Colors.textSecondary }}>Có mặt</Text>
                </View>
                <View className="flex-1 items-center border-l border-r" style={{ borderColor: Colors.border }}>
                  <Text className="text-2xl font-bold mb-1" style={{ color: Colors.warning }}>
                    {session.late}
                  </Text>
                  <Text className="text-xs" style={{ color: Colors.textSecondary }}>Muộn</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold mb-1" style={{ color: Colors.error }}>
                    {session.absent}
                  </Text>
                  <Text className="text-xs" style={{ color: Colors.textSecondary }}>Vắng</Text>
                </View>
                <View className="flex-1 items-center border-l" style={{ borderColor: Colors.border }}>
                  <Text className="text-2xl font-bold mb-1" style={{ color: Colors.text }}>
                    {session.total}
                  </Text>
                  <Text className="text-xs" style={{ color: Colors.textSecondary }}>Tổng</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mt-3">
                <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: Colors.gray200 }}>
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${(session.present / session.total) * 100}%`,
                      backgroundColor: Colors.success,
                    }}
                  />
                </View>
                <Text className="text-xs text-right mt-1" style={{ color: Colors.textSecondary }}>
                  {Math.round((session.present / session.total) * 100)}% điểm danh
                </Text>
              </View>
            </Card>
          ))}

        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:06
