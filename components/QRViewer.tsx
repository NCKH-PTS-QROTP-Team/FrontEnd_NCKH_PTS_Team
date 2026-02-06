import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

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
  return (
    <View className="items-center" style={{ gap: 16 }}>
      <View
        className="bg-white border-2 border-gray-200 items-center justify-center"
        style={{
          borderRadius: 8,
          width: size,
          height: size,
          padding: 12,
        }}
      >
        <QRCode
          value={value || ' '}
          size={size - 32}
        />
      </View>
      {label && (
        <Text className="text-gray-600 text-sm font-medium">
          {label}
        </Text>
      )}
    </View>
  );
};

