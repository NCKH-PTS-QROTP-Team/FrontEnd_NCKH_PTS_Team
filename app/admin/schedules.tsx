import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { mockSchedules } from '../../constants/mockData';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';

export default function ScheduleManagement() {
  const [selectedView, setSelectedView] = useState<'week' | 'month'>('week');

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'upcoming': { label: 'Sắp diễn ra', variant: 'primary' as const },
      'in-progress': { label: 'Đang diễn ra', variant: 'success' as const },
      'completed': { label: 'Đã kết thúc', variant: 'gray' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'gray' as const };
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Quản lý lịch học" />
      
      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          <PrimaryButton
            title="+ Tạo lịch học mới"
            onPress={() => alert('Tạo lịch học')}
            className="mb-4"
          />

          {/* View Toggle */}
          <View className="flex-row mb-4">
            <TouchableOpacity
              className="flex-1 py-3 rounded-l-xl border"
              style={{
                backgroundColor: selectedView === 'week' ? Colors.primary : Colors.white,
                borderColor: Colors.primary,
              }}
              onPress={() => setSelectedView('week')}
            >
              <Text
                className="text-center font-medium"
                style={{ color: selectedView === 'week' ? Colors.white : Colors.primary }}
              >
                Tuần
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-r-xl border-t border-r border-b"
              style={{
                backgroundColor: selectedView === 'month' ? Colors.primary : Colors.white,
                borderColor: Colors.primary,
              }}
              onPress={() => setSelectedView('month')}
            >
              <Text
                className="text-center font-medium"
                style={{ color: selectedView === 'month' ? Colors.white : Colors.primary }}
              >
                Tháng
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Week/Month Header */}
          <Card className="mb-4" style={{ backgroundColor: Colors.gray50 }}>
            <View className="flex-row justify-between items-center">
              <TouchableOpacity className="p-2">
                <Text className="text-2xl" style={{ color: Colors.primary }}>‹</Text>
              </TouchableOpacity>
              <Text className="font-semibold text-base" style={{ color: Colors.text }}>
                {selectedView === 'week' ? 'Tuần 1, Tháng 1 2026' : 'Tháng 1 2026'}
              </Text>
              <TouchableOpacity className="p-2">
                <Text className="text-2xl" style={{ color: Colors.primary }}>›</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Schedule List */}
          <Text className="text-sm mb-3" style={{ color: Colors.textSecondary }}>
            {mockSchedules.length} buổi học
          </Text>

          {mockSchedules.map((schedule) => (
            <Card key={schedule.id} onPress={() => alert(`Chi tiết ${schedule.courseName}`)} className="mb-3">
              <View className="flex-row items-start">
                <View
                  className="w-16 rounded-xl items-center justify-center mr-3 py-3"
                  style={{ backgroundColor: Colors.infoLight }}
                >
                  <Text className="text-xs font-semibold mb-1" style={{ color: Colors.primary }}>
                    {schedule.time.split(' - ')[0]}
                  </Text>
                  <Text className="text-xs" style={{ color: Colors.primary }}>
                    {schedule.time.split(' - ')[1]}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-semibold text-base" style={{ color: Colors.text }}>
                      {schedule.courseCode}
                    </Text>
                    <Badge {...getStatusBadge(schedule.status)} size="sm" />
                  </View>

                  <Text className="text-sm mb-2" style={{ color: Colors.text }}>
                    {schedule.courseName}
                  </Text>

                  <View className="flex-row flex-wrap">
                    <View className="flex-row items-center mr-4 mb-1">
                      <Text className="text-xs mr-1" style={{ color: Colors.textSecondary }}>📍</Text>
                      <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                        {schedule.room}
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Text className="text-xs mr-1" style={{ color: Colors.textSecondary }}>👨‍🏫</Text>
                      <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                        {schedule.teacher}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text className="text-2xl ml-2" style={{ color: Colors.gray300 }}>›</Text>
              </View>
            </Card>
          ))}

          {/* Bulk Actions */}
          <Card className="mt-4">
            <Text className="font-semibold mb-3" style={{ color: Colors.text }}>
              Thao tác hàng loạt
            </Text>
            <PrimaryButton
              title="Import lịch từ Excel"
              variant="outline"
              onPress={() => alert('Import Excel')}
              className="mb-2"
            />
            <PrimaryButton
              title="Export lịch học"
              variant="outline"
              onPress={() => alert('Export')}
            />
          </Card>

        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:06
