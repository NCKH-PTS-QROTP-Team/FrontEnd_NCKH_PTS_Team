import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Spinner } from './Spinner';
import { Colors } from '@/constants/colors';

interface InlineLoaderProps {
  message?: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({ 
  message, 
  size = 24,
  color = Colors.primary,
  style 
}) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
        },
        style,
      ]}
    >
      <Spinner size={size} color={color} />
      {message && (
        <Text
          style={{
            marginLeft: 12,
            fontSize: 14,
            color: Colors.textSecondary,
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

export default InlineLoader;
