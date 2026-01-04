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
      style={{ flex: 1, backgroundColor: Colors.white }}
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
          style={{ flex: 1, justifyContent: 'center', maxWidth: 400, width: '100%', alignSelf: 'center' }}
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: '#DBEAFE',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24
              }}
            >
              <Text style={{ color: Colors.primary, fontSize: 36, fontWeight: 'bold' }}>#</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.textHeading, marginBottom: 8 }}>
              Xác thực OTP
            </Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 }}>
              Mã OTP đã được gửi đến điện thoại của bạn
            </Text>
          </View>

          {/* OTP Card */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* OTP Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 16, textAlign: 'center' }}>
                Nhập mã OTP
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 25 }}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={1}
                    keyboardType="number-pad"
                    style={{
                      width: 50,
                      height: 56,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: digit ? Colors.primary : Colors.border,
                      backgroundColor: Colors.surface,
                      textAlign: 'center',
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: Colors.textHeading,
                      ...Platform.select({
                        web: { outlineStyle: 'none' },
                      }),
                    }}
                  />
                ))}
              </View>

              {/* Countdown */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 8 }}>
                  Mã có hiệu lực trong
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.primary }}>
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
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 8 }}>
              Không nhận được mã?
            </Text>
            <TouchableOpacity
              onPress={() => setCountdown(120)}
              disabled={countdown > 0}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: countdown > 0 ? Colors.textSecondary : Colors.primary
                }}
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
