import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(120);
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

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/student/home');
    }, 800);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="flex-1 justify-center"
          style={{ maxWidth: 400, width: '100%', alignSelf: 'center' }}
        >
          {/* Header */}
          <View className="items-center mb-12">
            <View
              className="bg-blue-100 rounded-3xl items-center justify-center mb-6"
              style={{ width: 80, height: 80 }}
            >
              <Text className="text-primary text-4xl font-bold">#</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Xác thực OTP
            </Text>
            <Text className="text-base text-gray-500 text-center px-8">
              Mã OTP đã được gửi đến điện thoại của bạn
            </Text>
          </View>

          {/* OTP Card */}
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
            {/* OTP Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-4 text-center">
                Nhập mã OTP
              </Text>
              <View className="flex-row justify-between mb-4">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={1}
                    keyboardType="number-pad"
                    className="border-2 rounded-xl text-center text-2xl font-bold text-gray-900 bg-gray-50"
                    style={{
                      width: 50,
                      height: 56,
                      borderColor: digit ? Colors.primary : Colors.gray200,
                      ...Platform.select({
                        web: { outlineStyle: 'none' },
                      }),
                    }}
                  />
                ))}
              </View>

              {/* Countdown */}
              <View className="items-center mb-4">
                <Text className="text-sm text-gray-500">
                  Mã có hiệu lực trong
                </Text>
                <Text className="text-2xl font-bold text-primary mt-1">
                  {formatTime(countdown)}
                </Text>
              </View>
            </View>

            <PrimaryButton
              title="Xác nhận"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.join('').length !== 6}
            />
          </View>

          {/* Resend */}
          <View className="items-center">
            <Text className="text-sm text-gray-500 mb-2">
              Không nhận được mã?
            </Text>
            <TouchableOpacity
              onPress={() => setCountdown(120)}
              disabled={countdown > 0}
              activeOpacity={0.7}
            >
              <Text
                className={`text-base font-semibold ${
                  countdown > 0 ? 'text-gray-400' : 'text-primary'
                }`}
              >
                Gửi lại mã
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


// Updated: 2026-01-02 13:16:08
