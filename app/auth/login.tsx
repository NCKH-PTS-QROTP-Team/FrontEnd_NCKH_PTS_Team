import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { mockUsers } from '@/constants/mockData';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find(
        u => u.username === username && u.password === password && u.isActive
      );

      if (user) {
        // Navigate based on role
        switch (user.role) {
          case 'admin':
            router.replace('/admin/dashboard');
            break;
          case 'teacher':
            router.replace('/teacher/dashboard');
            break;
          case 'student':
            router.replace('/student/home');
            break;
          default:
            Alert.alert('Lỗi', 'Vai trò không hợp lệ');
        }
      } else {
        Alert.alert('Đăng nhập thất bại', 'Tài khoản hoặc mật khẩu không đúng');
      }
      
      setLoading(false);
    }, 800);
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
          {/* Logo Section */}
          <View className="items-center mb-12">
            <View
              className="bg-primary rounded-3xl items-center justify-center mb-6"
              style={{ width: 80, height: 80 }}
            >
              <Text className="text-white text-4xl font-bold">✓</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Điểm Danh
            </Text>
            <Text className="text-base text-gray-500 text-center">
              Đăng nhập để tiếp tục
            </Text>
          </View>

          {/* Login Card */}
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
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="admin, GV001, SV001"
                className="border-2 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
                style={{
                  borderColor: username ? Colors.primary : Colors.gray200,
                  ...Platform.select({
                    web: { outlineStyle: 'none' },
                  }),
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                secureTextEntry
                className="border-2 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
                style={{
                  borderColor: password ? Colors.primary : Colors.gray200,
                  ...Platform.select({
                    web: { outlineStyle: 'none' },
                  }),
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <PrimaryButton
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              disabled={!username.trim() || !password.trim()}
            />
          </View>

          {/* Demo Accounts */}
          <View className="items-center">
            <View className="flex-row items-center mb-3">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-sm text-gray-400">Tài khoản demo</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>
            <View className="bg-gray-50 rounded-xl p-4" style={{ width: '100%' }}>
              <Text className="text-xs text-gray-600 mb-2">
                <Text className="font-bold">Admin:</Text> admin / admin123
              </Text>
              <Text className="text-xs text-gray-600 mb-2">
                <Text className="font-bold">Giảng viên:</Text> GV001 / teacher123
              </Text>
              <Text className="text-xs text-gray-600">
                <Text className="font-bold">Sinh viên:</Text> SV001 / student123
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Updated: 2026-01-02 13:16:07
