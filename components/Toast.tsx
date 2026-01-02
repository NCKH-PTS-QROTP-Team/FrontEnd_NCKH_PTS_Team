import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { Colors } from '../constants/colors';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onHide: () => void;
  duration?: number;
}

export default function Toast({ visible, message, type = 'info', onHide, duration = 3000 }: ToastProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  const typeColors = {
    success: { bg: Colors.success, text: Colors.white },
    error: { bg: Colors.error, text: Colors.white },
    warning: { bg: Colors.warning, text: Colors.white },
    info: { bg: Colors.primary, text: Colors.white },
  };

  const colors = typeColors[type];

  return (
    <Animated.View
      className="absolute top-12 left-0 right-0 mx-4 p-4 shadow-lg z-50"
      style={{
        borderRadius: 8,
        opacity,
        backgroundColor: colors.bg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <Text className="text-center font-medium" style={{ color: colors.text }}>
        {message}
      </Text>
    </Animated.View>
  );
}
