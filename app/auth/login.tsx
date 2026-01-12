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
import { Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PrimaryButton } from '@/components/PrimaryButton';
import Input from '@/components/Input';
import Toast, { useToast } from '@/components/Toast';
import { Colors } from '@/constants/colors';
import { mockUsers } from '@/constants/mockData';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { toast, showToast, hideToast } = useToast();

  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const containerPadding = isDesktop ? 48 : isTablet ? 32 : 20;

  const logoNameImage = require('../../assets/logoname.png');

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
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      
      const user = mockUsers.find(
        u => u.username.toLowerCase() === trimmedUsername.toLowerCase() && 
             u.password === trimmedPassword && 
             u.isActive
      );

      if (user) {
        console.log('Login successful, user:', user);
        showToast('Đăng nhập thành công!', 'success');
        // Navigate based on role after a brief delay
        setTimeout(() => {
          console.log('Navigating to:', user.role);
          try {
            switch (user.role) {
              case 'admin':
                router.replace('/admin/dashboard' as any);
                break;
              case 'teacher':
                router.replace('/teacher/dashboard' as any);
                break;
              case 'student':
                console.log('Navigating to student home');
                // Try navigation with multiple methods
                try {
                  // Method 1: router.push
                  router.push('/student/home' as any);
                  console.log('router.push called');
                  
                  // Method 2: Fallback after delay
                  setTimeout(() => {
                    if (Platform.OS === 'web' && typeof window !== 'undefined') {
                      const currentPath = window.location.pathname;
                      console.log('Current path:', currentPath);
                      if (currentPath.includes('/auth/login')) {
                        console.log('Still on login page, trying window.location');
                        window.location.href = '/student/home';
                      }
                    }
                  }, 300);
                } catch (error) {
                  console.error('Navigation error:', error);
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.location.href = '/student/home';
                  }
                }
                break;
              default:
                showToast('Vai trò không hợp lệ', 'error');
            }
          } catch (error) {
            console.error('Navigation error:', error);
            // Fallback navigation
            if (user.role === 'student') {
              window.location.href = '/student/home';
            }
          }
        }, 500);
      } else {
        console.log('Login failed - user not found or inactive');
        console.log('Username:', trimmedUsername, 'Password:', trimmedPassword);
        showToast('Tài khoản hoặc mật khẩu không đúng', 'error');
        setPasswordError('Tài khoản hoặc mật khẩu không đúng');
      }
      
      setLoading(false);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f5f7fb' }}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: containerPadding,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: Colors.white,
              borderRadius: 12,
              paddingHorizontal: isDesktop ? 28 : 24,
              paddingVertical: isDesktop ? 30 : 26,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 4,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            {/* Logo & title */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image
                source={logoNameImage}
                style={{ height: 42, resizeMode: 'contain', marginBottom: 10 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: Colors.textHeading,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                Đăng nhập hệ thống
              </Text>
            </View>

            <Input
              label="Tên đăng nhập"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError('');
              }}
              placeholder="admin, GV001, SV001"
              error={usernameError || undefined}
              success={username.trim().length > 0 && !usernameError ? true : undefined}
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
              error={passwordError || undefined}
              success={password.trim().length > 0 && !passwordError ? true : undefined}
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
            {/* Demo Accounts */}
            <View style={{ marginTop: 18 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                Tài khoản demo
              </Text>
              <View
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 }}>
                  <Text style={{ fontWeight: '600' }}>Admin:</Text> admin / admin123
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 }}>
                  <Text style={{ fontWeight: '600' }}>Giảng viên:</Text> GV001 / teacher123
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>
                  <Text style={{ fontWeight: '600' }}>Sinh viên:</Text> SV001 / student123
                </Text>
              </View>
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
