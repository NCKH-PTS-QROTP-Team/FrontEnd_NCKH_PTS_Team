import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Spinner } from './Spinner';
import { Colors } from '@/constants/colors';

interface FullPageLoaderProps {
  message?: string;
  size?: number;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({ 
  message = 'Đang tải...', 
  size = 48 
}) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        padding: 24,
      }}
    >
      <Spinner size={size} color={Colors.primary} />
      {message && (
        <Text
          style={{
            marginTop: 20,
            fontSize: 16,
            color: Colors.textSecondary,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

export default FullPageLoader;
