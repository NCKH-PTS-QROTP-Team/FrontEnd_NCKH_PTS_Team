import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function GenerateOTPScreen() {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(300);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, countdown]);

  const generateOTP = () => {
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newOTP);
    setCountdown(300);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <AppHeader title="Tạo mã OTP" showBack />
      
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

          {/* OTP Display */}
          {isActive ? (
            <View className="bg-white rounded-2xl p-8 mb-6" style={{
              shadowColor: '#3FA9F5',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 5,
            }}>
              <View className="items-center mb-6">
                <View style={{ width: 64, height: 64, backgroundColor: '#DBEAFE', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#3FA9F5' }}>#</Text>
                </View>
                <Text className="text-sm text-gray-500 mb-4">
                  Mã OTP cho sinh viên
                </Text>
                <View className="bg-primary px-8 py-4 rounded-2xl">
                  <Text className="text-5xl font-bold text-white tracking-widest">
                    {otp}
                  </Text>
                </View>
              </View>

              <View className="items-center pt-6 border-t border-gray-100">
                <Text className="text-sm text-gray-500 mb-2">
                  Thời gian còn lại
                </Text>
                <Text className={`text-4xl font-bold ${
                  countdown < 60 ? 'text-red-500' : 'text-primary'
                }`}>
                  {formatTime(countdown)}
                </Text>
                {countdown < 60 && (
                  <Text className="text-sm text-red-500 mt-2">
                    Sắp hết hạn!
                  </Text>
                )}
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
                <Text style={{ fontSize: 32, color: '#6B7280' }}>○</Text>
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                Chưa có mã OTP
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Nhấn nút bên dưới để tạo mã OTP mới
              </Text>
            </View>
          )}

          <PrimaryButton
            title={isActive ? "Tạo mã mới" : "Tạo mã OTP"}
            onPress={generateOTP}
          />

          {/* Instructions */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <Text className="text-sm text-blue-800">
              <Text className="font-semibold">Hướng dẫn:</Text>
              {'\n'}• Hiển thị mã OTP trên màn hình cho sinh viên
              {'\n'}• Mã có hiệu lực trong 5 phút
              {'\n'}• Sinh viên nhập mã để hoàn tất điểm danh
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
