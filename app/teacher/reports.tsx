import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';

export default function ReportsScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <AppHeader title="Báo cáo & Thống kê" showBack showLogout={true} />
      
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 900, width: '100%', alignSelf: 'center' }}>
          {/* Summary Card */}
          <View className="bg-white rounded-2xl p-6 mb-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Text className="text-xl font-bold text-gray-900 mb-5">
              Tổng quan học kỳ
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-3xl font-bold text-blue-600 mb-1">156</Text>
                <Text className="text-sm text-gray-500">Tổng buổi</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-3xl font-bold text-green-600 mb-1">128</Text>
                <Text className="text-sm text-gray-500">Có mặt</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-3xl font-bold text-amber-600 mb-1">18</Text>
                <Text className="text-sm text-gray-500">Đi muộn</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-3xl font-bold text-red-600 mb-1">10</Text>
                <Text className="text-sm text-gray-500">Vắng</Text>
              </View>
            </View>
          </View>

          {/* Chart Placeholder */}
          <View className="bg-white rounded-2xl p-6 mb-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Biểu đồ chuyên cần
            </Text>
            <View className="bg-gray-50 rounded-xl p-12 items-center justify-center"
              style={{ height: 250 }}>
              <View style={{ width: 64, height: 64, backgroundColor: '#E5E7EB', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 32, color: '#6B7280' }}>☰</Text>
              </View>
              <Text className="text-gray-500 text-center">
                Biểu đồ thống kê sẽ hiển thị ở đây
              </Text>
            </View>
          </View>

          {/* Export Options */}
          <View className="bg-white rounded-2xl p-6 mb-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Xuất báo cáo
            </Text>
            
            <TouchableOpacity
              className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View style={{ width: 40, height: 40, backgroundColor: '#D1FAE5', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981' }}>=</Text>
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-gray-900">
                      Xuất file Excel
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Danh sách điểm danh chi tiết
                    </Text>
                  </View>
                </View>
                <Text className="text-green-600 font-semibold">Tải về</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View style={{ width: 40, height: 40, backgroundColor: '#FEE2E2', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#EF4444' }}>P</Text>
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-gray-900">
                      Xuất file PDF
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Báo cáo tổng hợp
                    </Text>
                  </View>
                </View>
                <Text className="text-red-600 font-semibold">Tải về</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
