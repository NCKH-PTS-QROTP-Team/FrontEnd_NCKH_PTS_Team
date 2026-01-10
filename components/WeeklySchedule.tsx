import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';

interface ScheduleItem {
  id: string;
  subject: string;
  code: string;
  sessions: string;
  room: string;
  teacher: string;
  type: 'theory' | 'practice' | 'exam' | 'makeup';
}

interface DaySchedule {
  [key: string]: {
    morning?: ScheduleItem[];
    afternoon?: ScheduleItem[];
    evening?: ScheduleItem[];
  };
}

const mockWeeklySchedule: DaySchedule = {
  'monday': {
    afternoon: [
      {
        id: '1',
        subject: 'Công nghệ mới trong phát triển ứng dụng CNTT',
        code: 'DHKTPM18A - 420300314705',
        sessions: 'Tiết: 7 - 9',
        room: 'Phòng: A4.02 (A (CS1))',
        teacher: 'GV: Tôn Long Phước',
        type: 'theory'
      },
      {
        id: '2',
        subject: 'Kiến trúc và Thiết kế Phần mềm',
        code: 'DHKTPM18B - 420300154902',
        sessions: 'Tiết: 10 - 12',
        room: 'Phòng: V4.01 (V (CS1))',
        teacher: 'GV: Nguyễn Trọng Tiến',
        type: 'theory'
      }
    ]
  },
  'thursday': {
    morning: [
      {
        id: '3',
        subject: 'Quản lý dự án CNTT',
        code: 'DHKTPM18B - 420300405603',
        sessions: 'Tiết: 4 - 6',
        room: 'Phòng: V4.01 (V (CS1))',
        teacher: 'GV: Đặng Thị Thu Hà',
        type: 'theory'
      }
    ]
  },
  'friday': {
    afternoon: [
      {
        id: '4',
        subject: 'Khai thác dữ liệu và ứng dụng',
        code: 'DHKHMT19A - 420300344303',
        sessions: 'Tiết: 7 - 9',
        room: 'Phòng: A4.02 (A (CS1))',
        teacher: 'GV: Phạm Thị Thiết',
        type: 'practice'
      }
    ]
  },
  'saturday': {
    morning: [
      {
        id: '5',
        subject: 'Quản lý dự án CNTT',
        code: 'DHKTPM18B - 420300405603',
        sessions: 'Tiết: 4 - 6',
        room: 'Phòng: V7.04 (V (CS1))',
        teacher: 'GV: Đặng Thị Thu Hà',
        type: 'theory'
      }
    ],
    afternoon: [
      {
        id: '6',
        subject: 'Khai thác dữ liệu và ứng dụng',
        code: 'DHKHMT19A - 420300344303',
        sessions: 'Tiết: 7 - 9',
        room: 'Phòng: A4.02 (A (CS1))',
        teacher: 'GV: Phạm Thị Thiết',
        type: 'practice'
      }
    ]
  }
};

export default function WeeklySchedule() {
  const [selectedView, setSelectedView] = useState<'all' | 'class' | 'exam'>('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { width: windowWidth } = useWindowDimensions();
  
  // Responsive breakpoints
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  // Responsive values
  const columnMinWidth = isMobile ? 180 : 240;
  const headerPadding = isMobile ? 10 : 14;
  const headerFontSize = isMobile ? 13 : 15;
  const dayFontSize = isMobile ? 12 : 14;
  const periodFontSize = isMobile ? 12 : 14;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'theory': return '#10B981'; // Green - Lịch học lý thuyết
      case 'practice': return '#3B82F6'; // Blue - Lịch học thực hành
      case 'exam': return '#EF4444'; // Red - Lịch thi
      case 'makeup': return '#F59E0B'; // Orange - Lịch tạm ngưng
      default: return '#6B7280';
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'theory': return '#D1FAE5';
      case 'practice': return '#DBEAFE';
      case 'exam': return '#FEE2E2';
      case 'makeup': return '#FEF3C7';
      default: return '#F3F4F6';
    }
  };

  const formatWeekRange = () => {
    const startDate = new Date(currentWeek);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Sunday
    
    return `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')} - ${endDate.getDate().toString().padStart(2, '0')}/${(endDate.getMonth() + 1).toString().padStart(2, '0')}/${endDate.getFullYear()}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const renderScheduleCell = (day: string, period: 'morning' | 'afternoon' | 'evening') => {
    const schedules = mockWeeklySchedule[day]?.[period];
    
    return (
      <View 
        key={`${day}-${period}`}
        style={{ 
          flex: 1,
          minWidth: columnMinWidth,
          minHeight: 120,
          padding: 10,
          borderRightWidth: 1,
          borderRightColor: '#D1D5DB',
          borderBottomWidth: 1,
          borderBottomColor: '#D1D5DB',
          backgroundColor: schedules && schedules.length > 0 ? '#FFFFFF' : '#FAFAFA',
        }}
      >
        {schedules && schedules.length > 0 && schedules.map((item, index) => (
          <View
            key={item.id}
            style={{
              backgroundColor: getTypeBgColor(item.type),
              borderLeftWidth: 4,
              borderLeftColor: getTypeColor(item.type),
              padding: 8,
              borderRadius: 4,
              marginBottom: index < schedules.length - 1 ? 8 : 0,
            }}
          >
            <Text style={{ 
              fontSize: 13, 
              fontWeight: '700', 
              color: '#111827',
              lineHeight: 18,
              marginBottom: 4,
            }}>
              {item.subject}
            </Text>
            <Text style={{ 
              fontSize: 11, 
              color: '#3FA9F5',
              lineHeight: 16,
              marginBottom: 3,
            }}>
              {item.code}
            </Text>
            <Text style={{ 
              fontSize: 11, 
              color: '#6B7280',
              lineHeight: 15,
              marginBottom: 2,
            }}>
              {item.sessions}
            </Text>
            <Text style={{ 
              fontSize: 11, 
              color: '#6B7280',
              lineHeight: 15,
              marginBottom: 2,
            }}>
              {item.room}
            </Text>
            <Text style={{ 
              fontSize: 11, 
              color: '#374151',
              lineHeight: 15,
              fontWeight: '500',
            }}>
              {item.teacher}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={{ marginBottom: 24, width: '100%' }}>
      {/* Header Controls */}
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: isMobile ? 12 : 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}>
        <Text style={{ 
          fontSize: isMobile ? 16 : 18, 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: 12,
        }}>
          Lịch học, lịch thi theo tuần
        </Text>

        <View style={{ 
          flexDirection: isMobile ? 'column' : 'row', 
          alignItems: isMobile ? 'stretch' : 'center', 
          justifyContent: 'space-between',
          gap: 12,
        }}>
          {/* View Filter Buttons */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <TouchableOpacity
              onPress={() => setSelectedView('all')}
              style={{
                paddingHorizontal: isMobile ? 12 : 16,
                paddingVertical: isMobile ? 6 : 8,
                borderRadius: 8,
                backgroundColor: selectedView === 'all' ? Colors.primary : '#F3F4F6',
              }}
            >
              <Text style={{ 
                fontSize: isMobile ? 12 : 13, 
                fontWeight: '600',
                color: selectedView === 'all' ? '#FFFFFF' : '#6B7280',
              }}>
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedView('class')}
              style={{
                paddingHorizontal: isMobile ? 12 : 16,
                paddingVertical: isMobile ? 6 : 8,
                borderRadius: 8,
                backgroundColor: selectedView === 'class' ? Colors.primary : '#F3F4F6',
              }}
            >
              <Text style={{ 
                fontSize: isMobile ? 12 : 13, 
                fontWeight: '600',
                color: selectedView === 'class' ? '#FFFFFF' : '#6B7280',
              }}>
                Lịch học
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedView('exam')}
              style={{
                paddingHorizontal: isMobile ? 12 : 16,
                paddingVertical: isMobile ? 6 : 8,
                borderRadius: 8,
                backgroundColor: selectedView === 'exam' ? Colors.primary : '#F3F4F6',
              }}
            >
              <Text style={{ 
                fontSize: isMobile ? 12 : 13, 
                fontWeight: '600',
                color: selectedView === 'exam' ? '#FFFFFF' : '#6B7280',
              }}>
                Lịch thi
              </Text>
            </TouchableOpacity>
          </View>

          {/* Week Navigation */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: isMobile ? 'center' : 'flex-end' }}>
            <TouchableOpacity
              onPress={() => navigateWeek('prev')}
              style={{
                width: isMobile ? 36 : 32,
                height: isMobile ? 36 : 32,
                borderRadius: 8,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: isMobile ? 18 : 16, color: '#374151' }}>←</Text>
            </TouchableOpacity>
            
            <Text style={{ fontSize: isMobile ? 12 : 13, fontWeight: '600', color: '#374151', minWidth: isMobile ? 130 : 150, textAlign: 'center' }}>
              {formatWeekRange()}
            </Text>
            
            <TouchableOpacity
              onPress={() => navigateWeek('next')}
              style={{
                width: isMobile ? 36 : 32,
                height: isMobile ? 36 : 32,
                borderRadius: 8,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: isMobile ? 18 : 16, color: '#374151' }}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mobile Hint */}
      {isMobile && (
        <View style={{
          backgroundColor: '#EFF6FF',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
          <Text style={{ fontSize: 20 }}>👉</Text>
          <Text style={{ fontSize: 12, color: '#1E40AF', flex: 1 }}>
            Vuốt sang ngang để xem lịch các ngày khác
          </Text>
        </View>
      )}

      {/* Schedule Table */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#D1D5DB',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <View style={{ minWidth: '100%' }}>
          {/* Table Header */}
          <View style={{ flexDirection: 'row', backgroundColor: '#F9FAFB' }}>
            <View style={{ 
              width: isMobile ? 80 : 120, 
              padding: headerPadding,
              borderRightWidth: 1,
              borderRightColor: '#D1D5DB',
              borderBottomWidth: 2,
              borderBottomColor: '#D1D5DB',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: headerFontSize, fontWeight: '700', color: '#111827' }}>
                {isMobile ? 'Ca' : 'Ca học'}
              </Text>
            </View>
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, index) => (
              <View 
                key={day}
                style={{ 
                  flex: 1,
                  minWidth: columnMinWidth,
                  padding: headerPadding,
                  borderRightWidth: index < 6 ? 1 : 0,
                  borderRightColor: '#D1D5DB',
                  borderBottomWidth: 2,
                  borderBottomColor: '#D1D5DB',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: dayFontSize, fontWeight: '600', color: '#374151' }}>
                  {isMobile ? day.replace('Thứ ', 'T') : day}
                </Text>
              </View>
            ))}
          </View>

          {/* Morning Row */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ 
              width: isMobile ? 80 : 120,
              padding: headerPadding,
              borderRightWidth: 1,
              borderRightColor: '#D1D5DB',
              borderBottomWidth: 1,
              borderBottomColor: '#D1D5DB',
              backgroundColor: '#FFFBEB',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: periodFontSize, fontWeight: '600', color: '#92400E' }}>Sáng</Text>
            </View>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              renderScheduleCell(day, 'morning')
            ))}
          </View>

          {/* Afternoon Row */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ 
              width: isMobile ? 80 : 120,
              padding: headerPadding,
              borderRightWidth: 1,
              borderRightColor: '#D1D5DB',
              borderBottomWidth: 1,
              borderBottomColor: '#D1D5DB',
              backgroundColor: '#FEF3C7',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: periodFontSize, fontWeight: '600', color: '#92400E' }}>Chiều</Text>
            </View>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              renderScheduleCell(day, 'afternoon')
            ))}
          </View>

          {/* Evening Row */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ 
              width: isMobile ? 80 : 120,
              padding: headerPadding,
              borderRightWidth: 1,
              borderRightColor: '#D1D5DB',
              borderBottomWidth: 1,
              borderBottomColor: '#D1D5DB',
              backgroundColor: '#DBEAFE',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: periodFontSize, fontWeight: '600', color: '#1E3A8A' }}>Tối</Text>
            </View>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              renderScheduleCell(day, 'evening')
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 12,
        paddingHorizontal: 8,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 16, height: 16, backgroundColor: '#D1FAE5', borderRadius: 3 }} />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Lịch học lý thuyết</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 16, height: 16, backgroundColor: '#DBEAFE', borderRadius: 3 }} />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Lịch học thực hành</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 16, height: 16, backgroundColor: '#FEE2E2', borderRadius: 3 }} />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Lịch thi</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 16, height: 16, backgroundColor: '#FEF3C7', borderRadius: 3 }} />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Lịch tạm ngưng</Text>
        </View>
      </View>
    </View>
  );
}
