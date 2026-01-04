import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import { Colors } from '../constants/colors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

export default function Toast({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onHide,
}: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: Colors.success,
          icon: '✓',
        };
      case 'error':
        return {
          backgroundColor: Colors.error,
          icon: '✕',
        };
      case 'warning':
        return {
          backgroundColor: Colors.warning,
          icon: '⚠',
        };
      case 'info':
        return {
          backgroundColor: Colors.primary,
          icon: 'ℹ',
        };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: Platform.OS === 'web' ? 24 : 60,
          right: Platform.OS === 'web' ? 24 : 16,
          left: Platform.OS === 'web' ? undefined : 16,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          zIndex: 9999,
          maxWidth: 420,
        },
        Platform.OS === 'web' && {
          position: 'fixed' as any,
        },
      ]}
    >
      <View
        className="rounded-lg p-4 flex-row items-center"
        style={{
          backgroundColor: toastStyle.backgroundColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ color: Colors.white, fontSize: 16, fontWeight: 'bold' }}>
            {toastStyle.icon}
          </Text>
        </View>
        <Text
          className="flex-1 text-base font-medium"
          style={{ color: Colors.white, lineHeight: 24 }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

// Toast Manager Hook
export const useToast = () => {
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
};
