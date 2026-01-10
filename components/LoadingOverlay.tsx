import React from 'react';
import { View, Text, Modal, Platform } from 'react-native';
import { Spinner } from './Spinner';
import { Colors } from '@/constants/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
}) => {
  if (!visible) return null;

  const content = (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 32,
          alignItems: 'center',
          minWidth: 120,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Spinner size={48} color={Colors.primary} />
        {message && (
          <Text
            style={{
              marginTop: 20,
              fontSize: 16,
              color: Colors.textSecondary,
              textAlign: 'center',
              maxWidth: 250,
            }}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    // On web, render directly without Modal for better compatibility
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        {content}
      </View>
    );
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      {content}
    </Modal>
  );
};

export default LoadingOverlay;

