import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function GenerateQRScreen() {
  const [isActive, setIsActive] = useState(false);
  const qrData = 'CS101_A102_20260102_0800';

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <AppHeader title="Tạo QR Code" showBack />
      
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 600, width: '100%', alignSelf: 'center' }}>
          {/* Course Info */}
          <View className="bg-white rounded-2xl p-5 mb-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <Text className="text-sm text-gray-500 mb-1">Môn học</Text>
            <Text className="text-xl font-bold text-gray-900">
              Lập trình cơ bản
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              CS101 • Phòng A102 • 08:00 - 10:00
            </Text>
          </View>

          {/* QR Code Display */}
          {isActive ? (
            <View className="bg-white rounded-2xl p-8 mb-6" style={{
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 5,
            }}>
              <View className="items-center">
                <View style={{ width: 48, height: 48, backgroundColor: '#D1FAE5', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#10B981' }}>QR</Text>
                </View>
                <Text className="text-base text-gray-500 mb-6">
                  QR Code điểm danh
                </Text>
                
                {/* QR Code Placeholder */}
                <View className="bg-white border-4 border-gray-900 rounded-2xl p-6 mb-6"
                  style={{ width: 280, height: 280 }}>
                  <View className="flex-1 bg-gray-900 rounded-xl items-center justify-center">
                    <Text className="text-white text-lg font-bold text-center px-4">
                      QR CODE{'\n'}PLACEHOLDER
                    </Text>
                  </View>
                </View>

                <Text className="text-sm text-gray-500 text-center">
                  Sinh viên quét mã này để điểm danh
                </Text>
                
                <View className="bg-green-50 rounded-xl px-4 py-2 mt-4">
                  <Text className="text-green-700 text-sm font-semibold">
                    ✓ QR Code đang hoạt động
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-8 mb-6 items-center" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <View style={{ width: 64, height: 64, backgroundColor: '#F3F4F6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 32, color: '#6B7280' }}>□</Text>
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                Chưa có QR Code
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Nhấn nút bên dưới để tạo QR code mới
              </Text>
            </View>
          )}

          <PrimaryButton
            title={isActive ? "Tạo mã mới" : "Tạo QR Code"}
            onPress={() => setIsActive(!isActive)}
          />

          {/* Instructions */}
          <View className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
            <Text className="text-sm text-green-800">
              <Text className="font-semibold">Hướng dẫn:</Text>
              {'\n'}• Hiển thị QR code trên màn hình/máy chiếu
              {'\n'}• Sinh viên quét mã bằng camera
              {'\n'}• QR code cập nhật mỗi phiên học
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
