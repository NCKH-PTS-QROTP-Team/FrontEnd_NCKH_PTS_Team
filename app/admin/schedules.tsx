import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { mockSchedules } from '@/constants/mockData';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import PrimaryButton from '@/components/PrimaryButton';
import DataTable from '@/components/DataTable';

type SortDirection = 'asc' | 'desc' | null;

export default function ScheduleManagement() {
  const [selectedView, setSelectedView] = useState<'week' | 'month'>('week');
  const [sortColumn, setSortColumn] = useState<string | null>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const showTable = isDesktop; // Chỉ desktop mới hiển thị table

  const contentMaxWidth = isDesktop ? 1200 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  const addDays = (date: Date, days: number) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  };

  const formatDisplayDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const weekLabel = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const dayOfWeek = firstDay.getDay() || 7; // Monday-first idea: treat Sunday as 7
    const weekNumber = Math.ceil((currentDate.getDate() + dayOfWeek - 1) / 7);
    const monthYear = currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    return `Tuần ${weekNumber}, ${monthYear}`;
  }, [currentDate]);

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Gắn ngày thật cho mockSchedules (nếu chưa có)
  const schedulesWithDate = useMemo(() => {
    const baseDate = currentDate;
    const withDate = mockSchedules.map((s, idx) => {
      if ((s as any).date) return s as any;
      const date = addDays(baseDate, idx);
      const iso = date.toISOString().split('T')[0];
      return { ...s, date: iso };
    });

    // Sort theo ngày + giờ bắt đầu (nếu có)
    return withDate.slice().sort((a: any, b: any) => {
      const [aStart] = String(a.time || '').split(' - ');
      const [bStart] = String(b.time || '').split(' - ');
      const aDateTime = new Date(`${a.date}T${aStart || '00:00'}`);
      const bDateTime = new Date(`${b.date}T${bStart || '00:00'}`);
      return aDateTime.getTime() - bDateTime.getTime();
    });
  }, [currentDate]);

  // Sort function
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Toggle direction: asc -> desc -> null (no sort)
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Sorted data
  const sortedSchedules = useMemo(() => {
    if (!sortColumn || !sortDirection) return schedulesWithDate;

    return [...schedulesWithDate].sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      if (sortColumn === 'date') {
        const [aStart] = String(a.time || '').split(' - ');
        const [bStart] = String(b.time || '').split(' - ');
        aValue = new Date(`${a.date}T${aStart || '00:00'}`).getTime();
        bValue = new Date(`${b.date}T${bStart || '00:00'}`).getTime();
      } else if (sortColumn === 'time') {
        const [aStart] = String(a.time || '').split(' - ');
        const [bStart] = String(b.time || '').split(' - ');
        aValue = aStart || '';
        bValue = bStart || '';
      } else {
        aValue = a[sortColumn] || '';
        bValue = b[sortColumn] || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [schedulesWithDate, sortColumn, sortDirection]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'upcoming': { label: 'Sắp diễn ra', variant: 'primary' as const },
      'in-progress': { label: 'Đang diễn ra', variant: 'success' as const },
      'completed': { label: 'Đã kết thúc', variant: 'neutral' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'neutral' as const };
  };

  const handlePrev = () => {
    setCurrentDate((prev) => {
      const delta = selectedView === 'week' ? -7 : -30;
      return addDays(prev, delta);
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const delta = selectedView === 'week' ? 7 : 30;
      return addDays(prev, delta);
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateInputChange = (value: string) => {
    if (!value) return;
    const newDate = new Date(value);
    if (!isNaN(newDate.getTime())) {
      setCurrentDate(newDate);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 32 }}
      >
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity style={{ padding: 8 }} onPress={handlePrev}>
                <Text style={{ fontSize: 24, color: Colors.primary }}>‹</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontWeight: '600', fontSize: 16, color: Colors.text, marginBottom: 4 }}>
                  {selectedView === 'week' ? weekLabel : monthLabel}
                </Text>
                <TouchableOpacity onPress={handleToday}>
                  <Text style={{ fontSize: 13, color: Colors.primary }}>Hôm nay</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {Platform.OS === 'web' ? (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.gray300,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {/* Native HTML date input for web */}
                    <input
                      type="date"
                      value={currentDate.toISOString().split('T')[0]}
                      onChange={(e) => handleDateInputChange(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: 13,
                        color: '#111827',
                      }}
                    />
                  </View>
                ) : (
                  <TouchableOpacity onPress={handleToday} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 13, color: Colors.primary }}>Chọn ngày</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={{ padding: 8 }} onPress={handleNext}>
                  <Text style={{ fontSize: 24, color: Colors.primary }}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Schedule List */}
          <Text style={{ fontSize: 14, marginBottom: 12, color: Colors.textSecondary }}>
            {sortedSchedules.length} buổi học
          </Text>

          {/* Desktop: Table View */}
          {showTable ? (
            <View style={{ marginBottom: 24 }}>
              <DataTable
                columns={[
                  {
                    key: 'date',
                    label: 'Ngày',
                    width: 150,
                    sortable: true,
                    sortDirection: sortColumn === 'date' ? sortDirection : null,
                    onSort: () => handleSort('date'),
                    render: (schedule: any) => (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text }}>
                          {formatDisplayDate(schedule.date)}
                        </Text>
                      </View>
                    ),
                  },
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
              data={sortedSchedules as any}
              onRowPress={(schedule) => alert(`Chi tiết ${schedule.courseName}`)}
              zebraStriping={true}
              stickyHeader={false}
            />
            </View>
          ) : (
            /* Mobile: Card View */
            <>
              {sortedSchedules.map((schedule: any) => (
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
                      <Text style={{ fontSize: 11, fontWeight: '600', marginBottom: 4, color: Colors.text }}>
                        {formatDisplayDate(schedule.date)}
                      </Text>
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
