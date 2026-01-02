import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface QRViewerProps {
  value: string;
  size?: number;
  label?: string;
}

export const QRViewer: React.FC<QRViewerProps> = ({
  value,
  size = 250,
  label,
}) => {
  // Mock QR Code display - In production, you'd use a library like react-native-qrcode-svg
  return (
    <View className="items-center" style={{ gap: 16 }}>
      <View
        className="bg-white border-2 border-gray-200 items-center justify-center"
        style={{
          borderRadius: 8,
          width: size,
          height: size,
          padding: 20,
        }}
      >
        {/* Mock QR Code - In production, replace with actual QR code library */}
        <View 
          className="bg-gray-900"
          style={{
            width: size - 40,
            height: size - 40,
          }}
        >
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-xs font-mono" numberOfLines={1}>
              QR Code
            </Text>
            <Text 
              className="text-gray-400 text-xs font-mono mt-2" 
              numberOfLines={2}
              style={{ textAlign: 'center', paddingHorizontal: 8 }}
            >
              {value.substring(0, 30)}...
            </Text>
          </View>
        </View>
      </View>
      {label && (
        <Text className="text-gray-600 text-sm font-medium">
          {label}
        </Text>
      )}
    </View>
  );
};

