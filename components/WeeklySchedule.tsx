import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, useWindowDimensions, ActivityIndicator, Animated } from 'react-native';
import { Colors } from '@/constants/colors';
import { scheduleService } from '@/apis';
import { getStudentIdFromToken } from '@/apis/utils/jwt';
import type { Schedule } from '@/apis/services/schedule.service';

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

export default function WeeklySchedule() {
  const [selectedView, setSelectedView] = useState<'all' | 'class' | 'exam'>('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isChangingWeek, setIsChangingWeek] = useState(false);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule>({});
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
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
  
  // Helper function to convert schedules to DaySchedule format
  const convertSchedulesToDaySchedule = (schedules: Schedule[]): DaySchedule => {
    const scheduleMap: DaySchedule = {};
    
    schedules.forEach((s: Schedule) => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = s.dayOfWeek === 7 ? 0 : s.dayOfWeek;
      const dayName = dayNames[dayIndex] || 'monday';
      
      const startHour = parseInt(s.startTime.split(':')[0]);
      let period: 'morning' | 'afternoon' | 'evening';
      if (startHour < 12) {
        period = 'morning';
      } else if (startHour < 18) {
        period = 'afternoon';
      } else {
        period = 'evening';
      }
      
      if (!scheduleMap[dayName]) {
        scheduleMap[dayName] = {};
      }
      if (!scheduleMap[dayName][period]) {
        scheduleMap[dayName][period] = [];
      }
      
      let itemType: 'theory' | 'practice' | 'exam' | 'makeup' = 'theory';
      if (s.scheduleType === 'EXAM') {
        itemType = 'exam';
      } else if (s.scheduleType === 'CLASS') {
        itemType = 'theory';
      }
      
      const scheduleItem: ScheduleItem = {
        id: s.id,
        subject: s.subjectName,
        code: `${s.classCode} - ${s.subjectCode}`,
        sessions: `Tiết: ${s.startTime} - ${s.endTime}`,
        room: `Phòng: ${s.room}`,
        teacher: `GV: ${s.teacherName}`,
        type: itemType,
      };
      
      scheduleMap[dayName][period]!.push(scheduleItem);
    });
    
    return scheduleMap;
  };
  
  // Helper function to apply filter and update schedule
  const applyFilter = (schedules: Schedule[], view: 'all' | 'class' | 'exam') => {
    // Filter schedules
    const filtered = schedules.filter((s: Schedule) => {
      if (view === 'all') return true;
      if (view === 'class') return s.scheduleType !== 'EXAM';
      if (view === 'exam') return s.scheduleType === 'EXAM';
      return true;
    });
    
    // Convert filtered schedules to DaySchedule format
    return convertSchedulesToDaySchedule(filtered);
  };

  // Load schedules từ backend
  useEffect(() => {
    loadSchedules();
  }, [currentWeek]);

  // Filter schedules based on selectedView and allSchedules
  useEffect(() => {
    if (allSchedules.length === 0 && !isChangingWeek) {
      setWeeklySchedule({});
      return;
    }
    
    // Smooth fade transition khi đổi tuần hoặc filter
    Animated.timing(fadeAnim, {
      toValue: 0.4,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      // Apply filter
      const scheduleMap = applyFilter(allSchedules, selectedView);
      console.log(`🔍 Filtered schedules (${selectedView}):`, Object.keys(scheduleMap).length, 'days');
      setWeeklySchedule(scheduleMap);
      
      // Reset changing week flag
      setIsChangingWeek(false);
      
      // Fade in animation - mượt hơn
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedView, allSchedules, isChangingWeek]);

  const loadSchedules = async () => {
    try {
      // Chỉ hiển thị loading indicator lớn khi lần đầu load, không hiển thị khi đổi tuần
      if (!isChangingWeek) {
        setLoading(true);
      }
      console.log("📅 Loading weekly schedules...");
      
      const studentId = await getStudentIdFromToken();
      let classId: string | undefined;

      // Tìm classId của sinh viên từ API /users/me (cho phép tất cả user roles)
      // Nếu không lấy được, sẽ load toàn bộ lịch (không filter theo class)
      if (studentId) {
        try {
          // Gọi API /users/me để lấy thông tin đầy đủ (bao gồm classId)
          const { authService } = await import('@/apis');
          const currentUser = await authService.getCurrentUser();
          if (currentUser?.classId) {
            classId = currentUser.classId;
            console.log('👨‍🎓 Current student classId:', classId);
          } else {
            console.log('⚠️ Không có classId, sẽ load toàn bộ lịch');
          }
        } catch (err) {
          console.warn('⚠️ Không lấy được classId, sẽ load toàn bộ lịch:', err);
        }
      }

      // Tính khoảng ngày của tuần hiện tại (fromDate, toDate - yyyy-MM-dd)
      const startDate = new Date(currentWeek);
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // Sunday

      const toIsoDate = (d: Date) => {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const fromDate = toIsoDate(startDate);
      const toDate = toIsoDate(endDate);

      // Chuẩn bị params cho backend: filter theo lớp + loại lịch (CLASS / EXAM) + khoảng ngày
      const params: {
        classId?: string;
        scheduleType?: 'CLASS' | 'EXAM';
        fromDate?: string;
        toDate?: string;
      } = {
        fromDate,
        toDate,
      };

      if (classId) {
        params.classId = classId;
      }

      if (selectedView === 'class') {
        params.scheduleType = 'CLASS';
      } else if (selectedView === 'exam') {
        params.scheduleType = 'EXAM';
      }

      // Nếu không có scheduleType (Tất cả) thì backend trả full, FE chỉ group theo ngày/ca
      const allSchedules = await scheduleService.getSchedules(params);
      
      console.log("✅ Loaded schedules:", allSchedules.length);
      console.log("📅 Current week:", formatWeekRange());
      
      // Store all schedules for filtering
      // Filter effect will automatically apply selectedView filter
      setAllSchedules(allSchedules);
    } catch (error: any) {
      console.error("❌ Error loading schedules:", error);
      setWeeklySchedule({});
      setIsChangingWeek(false);
    } finally {
      setLoading(false);
    }
  };

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
    // Smooth fade out trước khi đổi tuần
    setIsChangingWeek(true);
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Đổi tuần sau khi fade out
      const newDate = new Date(currentWeek);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentWeek(newDate);
      // loadSchedules sẽ được trigger bởi useEffect, và fade in sẽ được handle bởi filter effect
    });
  };

  const renderScheduleCell = (day: string, period: 'morning' | 'afternoon' | 'evening') => {
    const schedules = weeklySchedule[day]?.[period] || [];
    
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
          backgroundColor: schedules.length > 0 ? '#FFFFFF' : '#FAFAFA',
        }}
      >
        {schedules.length > 0 && schedules.map((item, index) => (
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
      {/* Loading Indicator */}
      {loading && (
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={{ marginTop: 8, color: '#6B7280', fontSize: 13 }}>
            Đang tải lịch học...
          </Text>
        </View>
      )}

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
              onPress={() => {
                if (selectedView !== 'all') {
                  setSelectedView('all');
                }
              }}
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
              onPress={() => {
                if (selectedView !== 'class') {
                  setSelectedView('class');
                }
              }}
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
              onPress={() => {
                if (selectedView !== 'exam') {
                  setSelectedView('exam');
                }
              }}
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
      <Animated.View style={{ opacity: fadeAnim }}>
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
      </Animated.View>

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
