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
import Input from '@/components/Input';
import Toast, { useToast } from '@/components/Toast';
import { Colors } from '@/constants/colors';
import { mockUsers } from '@/constants/mockData';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { toast, showToast, hideToast } = useToast();

  const handleLogin = async () => {
    setUsernameError('');
    setPasswordError('');

    if (!username.trim()) {
      setUsernameError('Vui lòng nhập tên đăng nhập');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find(
        u => u.username === username && u.password === password && u.isActive
      );

      if (user) {
        showToast('Đăng nhập thành công!', 'success');
        // Navigate based on role after a brief delay
        setTimeout(() => {
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
              showToast('Vai trò không hợp lệ', 'error');
          }
        }, 500);
      } else {
        showToast('Tài khoản hoặc mật khẩu không đúng', 'error');
        setPasswordError('Tài khoản hoặc mật khẩu không đúng');
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
          <View className="items-center" style={{ marginBottom: 48 }}>
            <View
              className="bg-primary rounded-3xl items-center justify-center"
              style={{ width: 80, height: 80, marginBottom: 24 }}
            >
              <Text className="text-white text-4xl">✓</Text>
            </View>
            <Text className="text-4xl font-semibold text-gray-900" style={{ lineHeight: 56, letterSpacing: -0.02, marginBottom: 8 }}>
              Điểm Danh
            </Text>
            <Text className="text-base text-gray-600 text-center" style={{ lineHeight: 24 }}>
              Đăng nhập để tiếp tục
            </Text>
          </View>

          {/* Login Card */}
          <View
            className="bg-white border border-gray-100"
            style={{
              borderRadius: 8,
              padding: 24,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Input
              label="Tên đăng nhập"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError('');
              }}
              placeholder="admin, GV001, SV001"
              error={usernameError}
              success={username.trim().length > 0 && !usernameError}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Input
              label="Mật khẩu"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              placeholder="Nhập mật khẩu"
              error={passwordError}
              success={password.trim().length > 0 && !passwordError}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <PrimaryButton
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              disabled={!username.trim() || !password.trim()}
            />
          </View>

          {/* Demo Accounts */}
          <View className="items-center">
            <View className="flex-row items-center" style={{ marginBottom: 12 }}>
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-sm text-gray-500" style={{ marginHorizontal: 16, lineHeight: 21 }}>Tài khoản demo</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>
            <View className="bg-gray-50 border border-gray-100" style={{ width: '100%', padding: 16, borderRadius: 8 }}>
              <Text className="text-sm text-gray-600" style={{ lineHeight: 21, marginBottom: 8 }}>
                <Text className="font-semibold">Admin:</Text> admin / admin123
              </Text>
              <Text className="text-sm text-gray-600" style={{ lineHeight: 21, marginBottom: 8 }}>
                <Text className="font-semibold">Giảng viên:</Text> GV001 / teacher123
              </Text>
              <Text className="text-sm text-gray-600" style={{ lineHeight: 21 }}>
                <Text className="font-semibold">Sinh viên:</Text> SV001 / student123
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </KeyboardAvoidingView>
  );
}

// Updated: 2026-01-02 13:16:07
