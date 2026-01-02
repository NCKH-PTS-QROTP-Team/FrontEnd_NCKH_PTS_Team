import React, { useState } from 'react';
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

export default function LoginScreen() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!studentId.trim()) {
      return;
    }

    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      router.push('/auth/verify-otp');
    }, 1000);
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
          padding: 20,
          maxWidth: 600,
          width: '100%',
          alignSelf: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center" style={{ gap: 32 }}>
          {/* Logo/Header */}
          <View className="items-center" style={{ gap: 16 }}>
            <View
              className="bg-primary rounded-full items-center justify-center"
              style={{ width: 80, height: 80 }}
            >
              <Text className="text-white text-3xl font-bold">✓</Text>
            </View>
            <View className="items-center" style={{ gap: 8 }}>
              <Text className="text-3xl font-bold text-gray-900">
                Điểm Danh
              </Text>
              <Text className="text-base text-gray-500 text-center">
                Đăng nhập để tiếp tục
              </Text>
            </View>
          </View>

          {/* Login Form */}
          <View style={{ gap: 20 }}>
            <View style={{ gap: 8 }}>
              <Text className="text-sm font-medium text-gray-700">
                Mã số sinh viên
              </Text>
              <TextInput
                value={studentId}
                onChangeText={setStudentId}
                placeholder="Nhập mã số sinh viên"
                className="
                  border-2
                  border-gray-300
                  rounded-xl
                  px-4
                  py-4
                  text-base
                  text-gray-900
                  bg-white
                "
                style={{
                  borderColor: studentId ? Colors.primary : Colors.gray300,
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                placeholderTextColor={Colors.gray400}
                {...Platform.select({
                  web: {
                    outlineStyle: 'none',
                  },
                })}
              />
            </View>

            <PrimaryButton
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              disabled={!studentId.trim()}
            />
          </View>

          {/* Role Selection */}
          <View className="items-center" style={{ gap: 12 }}>
            <Text className="text-sm text-gray-500">Hoặc</Text>
            <TouchableOpacity
              onPress={() => router.push('/teacher/dashboard')}
              className="py-3"
            >
              <Text className="text-primary font-semibold">
                Đăng nhập với vai trò Giảng viên
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

