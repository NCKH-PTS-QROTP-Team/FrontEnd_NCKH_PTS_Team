import React from 'react';
import { View, ActivityIndicator, Text, Modal } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <View
          className="bg-white p-6 items-center"
          style={{
            borderRadius: 8,
            minWidth: 120,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
          {message && (
            <Text className="text-gray-700 mt-4 text-center">
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

