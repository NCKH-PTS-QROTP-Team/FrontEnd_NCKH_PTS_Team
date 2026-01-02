import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import Tabs from '../../components/Tabs';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Báo cáo & Thống kê" showLogout={true} />
      
      <Tabs
        tabs={[
          { key: 'overview', label: 'Tổng quan' },
          { key: 'class', label: 'Theo lớp' },
          { key: 'teacher', label: 'Theo GV' },
          { key: 'student', label: 'Theo SV' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView className="flex-1">
        <View className="p-4" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          {activeTab === 'overview' && (
            <>
              {/* Summary Stats */}
              <View className="flex-row flex-wrap mb-4 -mx-2">
                {[
                  { label: 'Tổng buổi học', value: '1,234', color: Colors.primary },
                  { label: 'Tổng sinh viên', value: '5,678', color: Colors.success },
                  { label: 'Tỷ lệ điểm danh TB', value: '87%', color: Colors.warning },
                  { label: 'Số lớp hoạt động', value: '45', color: Colors.info },
                ].map((stat, index) => (
                  <View key={index} className="w-1/2 px-2 mb-3">
                    <Card>
                      <Text className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                        {stat.value}
                      </Text>
                      <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                        {stat.label}
                      </Text>
                    </Card>
                  </View>
                ))}
              </View>

              {/* Chart Placeholder */}
              <Card className="mb-4">
                <Text className="font-semibold text-base mb-3" style={{ color: Colors.text }}>
                  Biểu đồ điểm danh theo thời gian
                </Text>
                <View
                  className="rounded-xl items-center justify-center"
                  style={{ height: 200, backgroundColor: Colors.gray100 }}
                >
                  <Text style={{ color: Colors.textSecondary }}>📊 Chart Placeholder</Text>
                </View>
              </Card>

              {/* Faculty-wide Stats */}
              <Card className="mb-4">
                <Text className="font-semibold text-base mb-3" style={{ color: Colors.text }}>
                  Thống kê toàn trường
                </Text>
                {[
                  { label: 'Khoa CNTT', present: 456, late: 34, absent: 23, total: 513 },
                  { label: 'Khoa Kinh tế', present: 389, late: 28, absent: 31, total: 448 },
                  { label: 'Khoa Ngoại ngữ', present: 234, late: 19, absent: 12, total: 265 },
                ].map((faculty, index) => (
                  <View
                    key={index}
                    className="py-3 border-b"
                    style={{ borderBottomColor: index === 2 ? 'transparent' : Colors.border }}
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="font-medium" style={{ color: Colors.text }}>
                        {faculty.label}
                      </Text>
                      <Text className="text-sm" style={{ color: Colors.primary }}>
                        {Math.round((faculty.present / faculty.total) * 100)}%
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs" style={{ color: Colors.success }}>
                        ✓ {faculty.present}
                      </Text>
                      <Text className="text-xs" style={{ color: Colors.warning }}>
                        ⏱ {faculty.late}
                      </Text>
                      <Text className="text-xs" style={{ color: Colors.error }}>
                        ✕ {faculty.absent}
                      </Text>
                      <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                        Σ {faculty.total}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </>
          )}

          {activeTab === 'class' && (
            <Card>
              <Text className="font-semibold mb-3" style={{ color: Colors.text }}>
                Báo cáo theo lớp học
              </Text>
              <Text className="text-sm mb-4" style={{ color: Colors.textSecondary }}>
                Chọn lớp và khoảng thời gian để xem báo cáo chi tiết
              </Text>
              <PrimaryButton
                title="Chọn lớp học"
                variant="outline"
                onPress={() => alert('Chọn lớp')}
              />
            </Card>
          )}

          {activeTab === 'teacher' && (
            <Card>
              <Text className="font-semibold mb-3" style={{ color: Colors.text }}>
                Báo cáo theo giảng viên
              </Text>
              <Text className="text-sm mb-4" style={{ color: Colors.textSecondary }}>
                Xem thống kê điểm danh của từng giảng viên
              </Text>
              <PrimaryButton
                title="Chọn giảng viên"
                variant="outline"
                onPress={() => alert('Chọn GV')}
              />
            </Card>
          )}

          {activeTab === 'student' && (
            <Card>
              <Text className="font-semibold mb-3" style={{ color: Colors.text }}>
                Báo cáo theo sinh viên
              </Text>
              <Text className="text-sm mb-4" style={{ color: Colors.textSecondary }}>
                Xem lịch sử điểm danh chi tiết của sinh viên
              </Text>
              <PrimaryButton
                title="Chọn sinh viên"
                variant="outline"
                onPress={() => alert('Chọn SV')}
              />
            </Card>
          )}

          {/* Export Section */}
          <Card className="mt-4">
            <Text className="font-semibold mb-3" style={{ color: Colors.text }}>
              Xuất báo cáo
            </Text>
            <View className="flex-row -mx-2">
              <View className="flex-1 px-2">
                <PrimaryButton
                  title="Excel"
                  variant="outline"
                  onPress={() => alert('Export Excel')}
                />
              </View>
              <View className="flex-1 px-2">
                <PrimaryButton
                  title="PDF"
                  variant="outline"
                  onPress={() => alert('Export PDF')}
                />
              </View>
              <View className="flex-1 px-2">
                <PrimaryButton
                  title="CSV"
                  variant="outline"
                  onPress={() => alert('Export CSV')}
                />
              </View>
            </View>
          </Card>

        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:05
