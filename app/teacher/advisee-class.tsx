import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/colors';
import { AppHeader } from '@/components/AppHeader';
import Card from '@/components/Card';
import { StatsCard } from '@/components/StatsCard';
import Tabs from '@/components/Tabs';
import { StudentCard } from '@/components/StudentCard';
import { mockStudents } from '@/constants/mockData';

export default function AdviseeClass() {
  const [activeTab, setActiveTab] = useState('overview');
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const statsWidth = isDesktop ? '48%' : '100%';

  const classStats = {
    totalStudents: 45,
    presentToday: 38,
    absentToday: 7,
    attendanceRate: 84.4,
    atRisk: 5,
  };

  const atRiskStudents = mockStudents.slice(0, 3);

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Lớp chủ nhiệm" showLogout={!isWeb} />
      
      <Tabs
        tabs={[
          { key: 'overview', label: 'Tổng quan' },
          { key: 'students', label: 'Danh sách SV' },
          { key: 'at-risk', label: 'Cảnh báo' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          {activeTab === 'overview' && (
            <>
              {/* Class Info */}
              <Card className="mb-4" style={{ backgroundColor: Colors.primary }}>
                <Text className="text-2xl font-bold mb-2" style={{ color: Colors.white }}>
                  Lớp CNTT01
                </Text>
                <Text className="text-base" style={{ color: Colors.white, opacity: 0.9 }}>
                  Công nghệ thông tin K15
                </Text>
              </Card>

              {/* Stats Grid */}
              <View className="mb-4">
                <Text className="text-base font-semibold mb-3" style={{ color: Colors.text }}>
                  Thống kê lớp học
                </Text>
                <View className="flex-row flex-wrap -mx-2">
                  <View className="w-1/2 px-2 mb-3">
                    <StatsCard
                      label="Tổng sinh viên"
                      value={classStats.totalStudents.toString()}
                      color={Colors.primary}
                      icon="👥"
                    />
                  </View>
                  <View className="w-1/2 px-2 mb-3">
                    <StatsCard
                      label="Tỷ lệ điểm danh"
                      value={`${classStats.attendanceRate}%`}
                      color={Colors.success}
                      icon="%"
                    />
                  </View>
                  <View className="w-1/2 px-2 mb-3">
                    <StatsCard
                      label="Có mặt hôm nay"
                      value={classStats.presentToday.toString()}
                      color={Colors.success}
                      icon="✓"
                    />
                  </View>
                  <View className="w-1/2 px-2 mb-3">
                    <StatsCard
                      label="Sinh viên cần quan tâm"
                      value={classStats.atRisk.toString()}
                      color={Colors.error}
                      icon="⚠"
                    />
                  </View>
                </View>
              </View>

              {/* At-Risk Students Preview */}
              <Card className="mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-semibold" style={{ color: Colors.text }}>
                    Sinh viên cần quan tâm
                  </Text>
                  <TouchableOpacity onPress={() => setActiveTab('at-risk')}>
                    <Text className="text-sm font-medium" style={{ color: Colors.primary }}>
                      Xem tất cả
                    </Text>
                  </TouchableOpacity>
                </View>

                {atRiskStudents.map((student) => (
                  <View key={student.id} className="mb-3">
                    <View className="flex-row items-center">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: Colors.errorLight }}
                      >
                        <Text style={{ color: Colors.error }}>⚠</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium mb-1" style={{ color: Colors.text }}>
                          {student.name}
                        </Text>
                        <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                          Vắng 5/15 buổi (33%)
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Card>

              {/* Multi-class Summary */}
              <Card>
                <Text className="font-semibold mb-3" style={{ color: Colors.text }}>
                  Thống kê các môn học
                </Text>
                {[
                  { subject: 'Lập trình cơ bản', rate: 92, present: 41, total: 45 },
                  { subject: 'Cơ sở dữ liệu', rate: 87, present: 39, total: 45 },
                  { subject: 'Mạng máy tính', rate: 78, present: 35, total: 45 },
                ].map((item, index) => (
                  <View
                    key={index}
                    className="py-3 border-b"
                    style={{ borderBottomColor: index === 2 ? 'transparent' : Colors.border }}
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="font-medium" style={{ color: Colors.text }}>
                        {item.subject}
                      </Text>
                      <Text className="text-sm font-semibold" style={{ color: Colors.primary }}>
                        {item.rate}%
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                        {item.present}/{item.total} sinh viên
                      </Text>
                      <View className="flex-1 mx-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: Colors.gray200 }}>
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${item.rate}%`,
                            backgroundColor: item.rate >= 80 ? Colors.success : Colors.warning,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </Card>
            </>
          )}

          {activeTab === 'students' && (
            <>
              <Text className="text-sm mb-3" style={{ color: Colors.textSecondary }}>
                {mockStudents.length} sinh viên
              </Text>

              {mockStudents.map((student) => (
                <View key={student.id} className="mb-3">
                  <StudentCard
                    student={student}
                    onPress={() => alert(`Chi tiết ${student.name}`)}
                  />
                </View>
              ))}
            </>
          )}

          {activeTab === 'at-risk' && (
            <>
              <Card className="mb-4" style={{ backgroundColor: Colors.errorLight }}>
                <Text className="font-semibold mb-2" style={{ color: Colors.error }}>
                  ⚠ Tiêu chí cảnh báo
                </Text>
                <Text className="text-sm" style={{ color: Colors.error }}>
                  Sinh viên vắng ≥20% tổng số buổi học
                </Text>
              </Card>

              <Text className="text-sm mb-3" style={{ color: Colors.textSecondary }}>
                {classStats.atRisk} sinh viên cần quan tâm
              </Text>

              {atRiskStudents.map((student) => (
                <Card key={student.id} className="mb-3">
                  <View className="flex-row items-start">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: Colors.errorLight }}
                    >
                      <Text className="text-xl" style={{ color: Colors.error }}>⚠</Text>
                    </View>

                    <View className="flex-1">
                      <Text className="font-semibold mb-1" style={{ color: Colors.text }}>
                        {student.name}
                      </Text>
                      <Text className="text-sm mb-2" style={{ color: Colors.textSecondary }}>
                        {student.studentId}
                      </Text>

                      <View className="flex-row items-center mb-2">
                        <Text className="text-xs mr-2" style={{ color: Colors.error }}>
                          Vắng: 5/15 buổi
                        </Text>
                        <Text className="text-xs font-semibold" style={{ color: Colors.error }}>
                          (33%)
                        </Text>
                      </View>

                      <TouchableOpacity
                        className="py-2 px-3 rounded-lg"
                        style={{ backgroundColor: Colors.primary, alignSelf: 'flex-start' }}
                        onPress={() => alert(`Gửi thông báo cho ${student.name}`)}
                      >
                        <Text className="text-xs font-medium" style={{ color: Colors.white }}>
                          Gửi thông báo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
