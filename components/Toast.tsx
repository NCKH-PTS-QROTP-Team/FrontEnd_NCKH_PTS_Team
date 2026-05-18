import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItemProps {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration: number;
  onHide: (id: string) => void;
  index: number;
}

const TOAST_CONFIG = {
  success: {
    accent: '#059669',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: '✓',
    iconBg: '#dcfce7',
    iconColor: '#059669',
    textColor: '#166534',
    titleColor: '#14532d',
  },
  error: {
    accent: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: '✕',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    textColor: '#991b1b',
    titleColor: '#7f1d1d',
  },
  warning: {
    accent: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: '!',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    textColor: '#92400e',
    titleColor: '#78350f',
  },
  info: {
    accent: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: 'i',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    textColor: '#1e40af',
    titleColor: '#1e3a8a',
  },
};

function ToastItem({ id, message, title, type, duration, onHide, index }: ToastItemProps) {
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  const config = TOAST_CONFIG[type];

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();

    // Progress bar countdown
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: duration,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 200, useNativeDriver: true }),
    ]).start(() => onHide(id));
  };

  const toastWidth = isMobile ? width - 32 : isDesktop ? 380 : 340;

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: 8,
          width: toastWidth,
          zIndex: 10000 - index,
        },
        Platform.OS === 'web' && {
          // @ts-ignore
          pointerEvents: 'auto',
        },
      ]}
    >
      <View
        style={{
          backgroundColor: config.bg,
          borderWidth: 1,
          borderColor: config.border,
          borderLeftWidth: 4,
          borderLeftColor: config.accent,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'flex-start',
          ...(Platform.OS === 'web'
            ? { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }),
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: config.iconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
            marginTop: 1,
          }}
        >
          <Text style={{ color: config.iconColor, fontSize: 14, fontWeight: '800' }}>
            {config.icon}
          </Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1, marginRight: 8 }}>
          {title && (
            <Text
              style={{
                color: config.titleColor,
                fontSize: 14,
                fontWeight: '700',
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          <Text
            style={{
              color: config.textColor,
              fontSize: 13,
              lineHeight: 18,
              fontWeight: '500',
            }}
            numberOfLines={3}
          >
            {message}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          onPress={dismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 1,
            ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
          }}
        >
          <Text style={{ color: config.textColor, fontSize: 15, fontWeight: '600', opacity: 0.5 }}>
            ×
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: 2.5,
          backgroundColor: config.border,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          marginTop: -1,
          marginHorizontal: 1,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: config.accent,
            borderRadius: 2,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </Animated.View>
  );
}

// ===================== Toast Container (rendered by ToastProvider) =====================
export interface ToastData {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration: number;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (toasts.length === 0) return null;

  return (
    <View
      style={[
        {
          position: 'absolute',
          zIndex: 99999,
        },
        Platform.OS === 'web' && {
          position: 'fixed' as any,
        },
        isMobile
          ? { top: 54, left: 16, right: 16, alignItems: 'center' }
          : { top: 76, right: 24 },
      ]}
      // @ts-ignore
      pointerEvents="box-none"
    >
      {toasts.map((t, index) => (
        <ToastItem
          key={t.id}
          id={t.id}
          message={t.message}
          title={t.title}
          type={t.type}
          duration={t.duration}
          onHide={onDismiss}
          index={index}
        />
      ))}
    </View>
  );
}

// ===================== Legacy exports (backward compat during migration) =====================
export type { ToastItemProps };
export default ToastItem;

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

  return { toast, showToast, hideToast };
};
