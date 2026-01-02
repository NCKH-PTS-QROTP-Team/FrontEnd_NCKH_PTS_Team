import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function QRAttendanceScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    setScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setTimeout(() => {
        alert('Điểm danh thành công!');
        router.back();
      }, 500);
    }, 2000);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <AppHeader title="Điểm danh bằng QR Code" showBack showLogout={true} />
      
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 500, width: '100%', alignSelf: 'center' }}>
          {/* Course Info */}
          <View
            className="bg-white rounded-2xl p-5 mb-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="bg-green-50 rounded-xl p-4">
              <Text className="text-sm text-gray-500 mb-1">Môn học</Text>
              <Text className="text-lg font-bold text-gray-900">
                Lập trình cơ bản
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                CS101 • Phòng A102 • 08:00 - 10:00
              </Text>
            </View>
          </View>

          {/* Scanner Card */}
          <View
            className="bg-white rounded-2xl p-6 mb-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Scanner Area */}
            <View
              className="bg-gray-50 rounded-2xl items-center justify-center mb-6"
              style={{
                aspectRatio: 1,
                borderWidth: 3,
                borderColor: scanning ? '#3FA9F5' : '#E5E7EB',
                borderStyle: 'dashed',
              }}
            >
              {!scanning && !scanned && (
                <View className="items-center p-6">
                  <View style={{ width: 80, height: 80, backgroundColor: '#F3F4F6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#6B7280' }}>QR</Text>
                  </View>
                  <Text className="text-base font-semibold text-gray-900 mb-2 text-center">
                    Sẵn sàng quét
                  </Text>
                  <Text className="text-sm text-gray-500 text-center">
                    Nhấn nút bên dưới để bắt đầu quét QR code
                  </Text>
                </View>
              )}
              
              {scanning && (
                <View className="items-center p-6">
                  <View style={{ width: 80, height: 80, backgroundColor: '#DBEAFE', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#3FA9F5' }}>...</Text>
                  </View>
                  <Text className="text-base font-semibold text-primary mb-2">
                    Đang quét...
                  </Text>
                  <Text className="text-sm text-gray-500 text-center">
                    Hướng camera vào QR code
                  </Text>
                </View>
              )}

              {scanned && (
                <View className="items-center p-6">
                  <Text className="text-7xl mb-4">✅</Text>
                  <Text className="text-base font-semibold text-green-600 mb-2">
                    Quét thành công!
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Đang xử lý...
                  </Text>
                </View>
              )}
            </View>

            <PrimaryButton
              title={scanning ? "Đang quét..." : scanned ? "Hoàn tất" : "Bắt đầu quét"}
              onPress={handleScan}
              disabled={scanning || scanned}
              loading={scanning}
            />
          </View>

          {/* Help Text */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Text className="text-sm text-blue-800">
              <Text className="font-semibold">Hướng dẫn:</Text>
              {'\n'}Nhấn "Bắt đầu quét" và hướng camera vào QR code mà giảng viên hiển thị để hoàn tất điểm danh.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:08
