import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { mockSchedules } from '@/constants/mockData';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import PrimaryButton from '@/components/PrimaryButton';
import DataTable from '@/components/DataTable';

export default function ScheduleManagement() {
  const [selectedView, setSelectedView] = useState<'week' | 'month'>('week');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const showTable = isDesktop; // Chỉ desktop mới hiển thị table

  const contentMaxWidth = isDesktop ? 1200 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'upcoming': { label: 'Sắp diễn ra', variant: 'primary' as const },
      'in-progress': { label: 'Đang diễn ra', variant: 'success' as const },
      'completed': { label: 'Đã kết thúc', variant: 'neutral' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'neutral' as const };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal, paddingVertical, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          
          {/* Page Title */}
          <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: '600', marginBottom: isMobile ? 16 : 24, color: Colors.text }}>
            Quản lý lịch học
          </Text>
          
          <View style={{ marginBottom: isMobile ? 12 : 16 }}>
            <PrimaryButton
              title="+ Tạo lịch học mới"
              onPress={() => alert('Tạo lịch học')}
            />
          </View>

          {/* View Toggle */}
          <View style={{ flexDirection: 'row', marginBottom: isMobile ? 12 : 16 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: isMobile ? 10 : 12,
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                borderWidth: 1,
                borderRightWidth: 0,
                backgroundColor: selectedView === 'week' ? Colors.primary : Colors.white,
                borderColor: Colors.primary,
              }}
              onPress={() => setSelectedView('week')}
            >
              <Text
                style={{ textAlign: 'center', fontWeight: '500', fontSize: isMobile ? 14 : 16, color: selectedView === 'week' ? Colors.white : Colors.primary }}
              >
                Tuần
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: isMobile ? 10 : 12,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                borderWidth: 1,
                backgroundColor: selectedView === 'month' ? Colors.primary : Colors.white,
                borderColor: Colors.primary,
              }}
              onPress={() => setSelectedView('month')}
            >
              <Text
                style={{ textAlign: 'center', fontWeight: '500', fontSize: isMobile ? 14 : 16, color: selectedView === 'month' ? Colors.white : Colors.primary }}
              >
                Tháng
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Week/Month Header */}
          <Card style={{ marginBottom: 16, backgroundColor: Colors.gray50 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity style={{ padding: 8 }}>
                <Text style={{ fontSize: 24, color: Colors.primary }}>‹</Text>
              </TouchableOpacity>
              <Text style={{ fontWeight: '600', fontSize: 16, color: Colors.text }}>
                {selectedView === 'week' ? 'Tuần 1, Tháng 1 2026' : 'Tháng 1 2026'}
              </Text>
              <TouchableOpacity style={{ padding: 8 }}>
                <Text style={{ fontSize: 24, color: Colors.primary }}>›</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Schedule List */}
          <Text style={{ fontSize: 14, marginBottom: 12, color: Colors.textSecondary }}>
            {mockSchedules.length} buổi học
          </Text>

          {/* Desktop: Table View */}
          {showTable ? (
            <DataTable
              columns={[
                {
                  key: 'time',
                  label: 'Thời gian',
                  width: 140,
                  render: (schedule) => (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.primary }}>
                        {schedule.time.split(' - ')[0]}
                      </Text>
                      <Text style={{ fontSize: 12, color: Colors.primary }}>
                        {schedule.time.split(' - ')[1]}
                      </Text>
                    </View>
                  ),
                },
                {
                  key: 'courseCode',
                  label: 'Mã môn',
                  width: 120,
                  render: (schedule) => (
                    <Text style={{ fontWeight: '600', fontSize: 14, color: Colors.text }}>
                      {schedule.courseCode}
                    </Text>
                  ),
                },
                {
                  key: 'courseName',
                  label: 'Tên môn học',
                  width: 300,
                  render: (schedule) => (
                    <Text style={{ fontSize: 14, color: Colors.text }}>
                      {schedule.courseName}
                    </Text>
                  ),
                },
                {
                  key: 'room',
                  label: 'Phòng học',
                  width: 150,
                  render: (schedule) => (
                    <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                      {schedule.room}
                    </Text>
                  ),
                },
                {
                  key: 'teacher',
                  label: 'Giảng viên',
                  width: 200,
                  render: (schedule) => (
                    <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                      {schedule.teacher}
                    </Text>
                  ),
                },
                {
                  key: 'status',
                  label: 'Trạng thái',
                  width: 140,
                  align: 'center',
                  render: (schedule) => {
                    const badgeData = getStatusBadge(schedule.status);
                    return (
                      <Badge variant={badgeData.variant} size="small">
                        {badgeData.label}
                      </Badge>
                    );
                  },
                },
              ]}
              data={mockSchedules}
              onRowPress={(schedule) => alert(`Chi tiết ${schedule.courseName}`)}
              zebraStriping={true}
              stickyHeader={true}
            />
          ) : (
            /* Mobile: Card View */
            <>
              {mockSchedules.map((schedule) => (
                <Card key={schedule.id} onPress={() => alert(`Chi tiết ${schedule.courseName}`)} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View
                      style={{
                        width: 56,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        paddingVertical: 10,
                        backgroundColor: Colors.infoLight,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '600', marginBottom: 4, color: Colors.primary }}>
                        {schedule.time.split(' - ')[0]}
                      </Text>
                      <Text style={{ fontSize: 11, color: Colors.primary }}>
                        {schedule.time.split(' - ')[1]}
                      </Text>
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: 4, gap: 4 }}>
                        <Text style={{ fontWeight: '600', fontSize: 15, color: Colors.text }}>
                          {schedule.courseCode}
                        </Text>
                        {(() => {
                          const badgeData = getStatusBadge(schedule.status);
                          return (
                            <Badge variant={badgeData.variant} size="small">
                              {badgeData.label}
                            </Badge>
                          );
                        })()}
                      </View>

                      <Text style={{ fontSize: 13, marginBottom: 8, color: Colors.text }}>
                        {schedule.courseName}
                      </Text>

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ fontSize: 12, marginRight: 4, color: Colors.textSecondary }}>📍</Text>
                          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                            {schedule.room}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ fontSize: 12, marginRight: 4, color: Colors.textSecondary }}>👨‍🏫</Text>
                          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                            {schedule.teacher}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* Bulk Actions */}
          <Card style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: '600', marginBottom: 12, color: Colors.text }}>
              Thao tác hàng loạt
            </Text>
            <View style={{ marginBottom: 8 }}>
              <PrimaryButton
                title="Import lịch từ Excel"
                variant="outline"
                onPress={() => alert('Import Excel')}
              />
            </View>
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
