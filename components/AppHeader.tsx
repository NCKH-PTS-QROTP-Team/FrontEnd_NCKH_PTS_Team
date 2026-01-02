import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  showBack = false,
  rightAction 
}) => {
  const router = useRouter();

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