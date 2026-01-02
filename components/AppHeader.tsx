import React from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  showLogout?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  showBack = false,
  rightAction,
  showLogout = false
}) => {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: () => router.replace('/auth/login')
        }
      ]
    );
  };

  return (
    <View 
      className="bg-white border-b border-gray-200"
      style={{
        paddingTop: Platform.OS === 'web' ? 0 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
      }}
    >
      <View 
        className="flex-row items-center justify-between"
        style={{ maxWidth: 900, width: '100%', alignSelf: 'center' }}
      >
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-xl text-primary">←</Text>
            </TouchableOpacity>
          )}
          <Text 
            className="text-xl font-semibold text-gray-900"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        {showLogout && (
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 rounded-lg px-4 py-2"
            activeOpacity={0.7}
          >
            <Text className="font-semibold" style={{ color: Colors.error }}>
              Đăng xuất
            </Text>
          </TouchableOpacity>
        )}
        {rightAction && (
          <View>
            {rightAction}
          </View>
        )}
      </View>
    </View>
  );
};

export default AppHeader;