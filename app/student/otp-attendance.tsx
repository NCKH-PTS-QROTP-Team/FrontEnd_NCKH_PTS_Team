import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';

export default function OTPAttendanceScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Điểm danh thành công!');
      router.back();
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = countdown === 0;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <AppHeader title="Điểm danh bằng OTP" showBack showLogout={true} />
      
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 500, width: '100%', alignSelf: 'center' }}>
          {/* Countdown Card */}
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
            <View className="items-center mb-6">
              <Text className="text-6xl mb-3">⏱️</Text>
              <Text className="text-sm text-gray-500 mb-2">
                Thời gian còn lại
              </Text>
              <Text className={`text-4xl font-bold ${isExpired ? 'text-red-500' : 'text-primary'}`}>
                {formatTime(countdown)}
              </Text>
              {isExpired && (
                <Text className="text-sm text-red-500 mt-2">
                  Hết thời gian điểm danh
                </Text>
              )}
            </View>

            {/* Course Info */}
            <View className="bg-blue-50 rounded-xl p-4 mb-6">
              <Text className="text-sm text-gray-500 mb-1">Môn học</Text>
              <Text className="text-lg font-bold text-gray-900">
                Lập trình cơ bản
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                CS101 • Phòng A102
              </Text>
            </View>

            {/* OTP Input */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-4 text-center">
                Nhập mã OTP từ giảng viên
              </Text>
              <View className="flex-row justify-between">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={1}
                    keyboardType="number-pad"
                    editable={!isExpired}
                    className="border-2 rounded-xl text-center text-2xl font-bold bg-gray-50"
                    style={{
                      width: 50,
                      height: 56,
                      borderColor: digit ? Colors.primary : Colors.gray200,
                      color: Colors.gray900,
                      ...Platform.select({
                        web: { outlineStyle: 'none' },
                      }),
                    }}
                  />
                ))}
              </View>
            </View>

            <PrimaryButton
              title={isExpired ? "Hết thời gian" : "Xác nhận"}
              onPress={handleSubmit}
              loading={loading}
              disabled={otp.join('').length !== 6 || isExpired}
            />
          </View>

          {/* Help Text */}
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <Text className="text-sm text-amber-800">
              <Text className="font-semibold">Hướng dẫn:</Text>
              {'\n'}Nhập mã OTP 6 số mà giảng viên hiển thị trên lớp để hoàn tất điểm danh.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Updated: 2026-01-02 13:16:08
