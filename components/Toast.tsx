import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Platform, useWindowDimensions } from 'react-native';
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
  const { width, height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current; // Bắt đầu từ dưới (50px)
  
  // Responsive: Desktop/Tablet/Mobile
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      Animated.spring(slideAnim, {
        toValue: 0, // Slide từ dưới lên (50 -> 0)
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }),
      ]).start();

      const timer = setTimeout(() => {
        onHide?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50, // Slide xuống dưới khi hide (0 -> 50)
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const hideToast = handleHide;

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

  // Tính toán vị trí responsive
  const getToastPosition = () => {
    if (Platform.OS === 'web') {
      // Web: Hiển thị ở góc trên bên phải, xuống dưới một chút
      return {
        top: isDesktop ? 80 : isTablet ? 70 : 60,
        right: isDesktop ? 32 : isTablet ? 24 : 16,
        left: undefined,
        maxWidth: isDesktop ? 480 : isTablet ? 420 : width - 32,
      };
    } else {
      // Mobile: Hiển thị ở trên cùng, xuống dưới một chút
      return {
        top: 80, // Xuống dưới một chút so với trước (từ 60 -> 80)
        right: 16,
        left: 16,
        maxWidth: width - 32,
      };
    }
  };

  const position = getToastPosition();

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          ...position,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          zIndex: 9999,
        },
        Platform.OS === 'web' && {
          position: 'fixed' as any,
        },
      ]}
    >
      <View
        className="rounded-lg flex-row items-start"
        style={{
          backgroundColor: toastStyle.backgroundColor,
          padding: isDesktop ? 16 : 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          minWidth: isDesktop ? 320 : 280,
        }}
      >
        <View
          style={{
            width: isDesktop ? 32 : 28,
            height: isDesktop ? 32 : 28,
            borderRadius: isDesktop ? 16 : 14,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            marginTop: 2, // Align với text đầu tiên
          }}
        >
          <Text style={{ 
            color: Colors.white, 
            fontSize: isDesktop ? 18 : 16, 
            fontWeight: 'bold' 
          }}>
            {toastStyle.icon}
          </Text>
        </View>
        <Text
          className="flex-1"
          style={{ 
            color: Colors.white, 
            fontSize: isDesktop ? 15 : 14,
            lineHeight: isDesktop ? 22 : 20,
            fontWeight: '500',
            // Hỗ trợ multi-line
            flexShrink: 1,
          }}
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
