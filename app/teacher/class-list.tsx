import React from 'react';
import { View, Text, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { StudentCard } from '@/components/StudentCard';
import { AttendanceStatusTag } from '@/components/AttendanceStatusTag';
import { mockStudents } from '@/constants/mockData';

export default function ClassListScreen() {
  const isWeb = Platform.OS === 'web';
  const presentCount = mockStudents.filter(s => s.status === 'present').length;
  const lateCount = mockStudents.filter(s => s.status === 'late').length;
  const absentCount = mockStudents.filter(s => s.status === 'absent').length;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const contentMaxWidth = isDesktop ? 800 : '100%';
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar style="dark" />
      <AppHeader title="Danh sách lớp" showBack showLogout={!isWeb} />
      
      <ScrollView
        contentContainerStyle={{ paddingHorizontal, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
          {/* Class Info */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
              Lập trình cơ bản - CS101
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#D1FAE5', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <Text style={{ color: '#10B981', fontSize: 14, lineHeight: 20, fontWeight: 'bold' }}>{presentCount}</Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#4B5563' }}>Có mặt</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <Text style={{ color: '#F59E0B', fontSize: 14, lineHeight: 20, fontWeight: 'bold' }}>{lateCount}</Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#4B5563' }}>Muộn</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#FEE2E2', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <Text style={{ color: '#EF4444', fontSize: 14, lineHeight: 20, fontWeight: 'bold' }}>{absentCount}</Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#4B5563' }}>Vắng</Text>
              </View>
            </View>
          </View>

          {/* Student List */}
          <Text style={{ fontSize: 18, lineHeight: 28, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
            Danh sách sinh viên ({mockStudents.length})
          </Text>
          
          <View>
            {mockStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
