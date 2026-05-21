import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';

export interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** 'danger' = nút xác nhận đỏ, 'default' = nút xác nhận xanh */
  variant?: 'danger' | 'default';
  /** Show loading spinner on confirm button */
  loading?: boolean;
  /** Disable confirm button */
  disabled?: boolean;
}

export default function ConfirmDialog({
  visible,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
  disabled = false,
}: ConfirmDialogProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const isDanger = variant === 'danger';
  const confirmBg = isDanger ? '#dc2626' : '#2563eb';
  const confirmHoverBg = isDanger ? '#b91c1c' : '#1d4ed8';
  const iconBg = isDanger ? '#fee2e2' : '#dbeafe';
  const iconColor = isDanger ? '#dc2626' : '#2563eb';
  const iconText = isDanger ? '!' : '?';

  const dialogWidth = isMobile ? width - 48 : 400;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeAnim,
          padding: 24,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onCancel}
        />

        <Animated.View
          style={{
            width: dialogWidth,
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
            transform: [{ scale: scaleAnim }],
            ...(Platform.OS === 'web'
              ? { boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }
              : {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.15,
                  shadowRadius: 30,
                  elevation: 10,
                }),
          }}
        >
          {/* Icon */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: iconBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: iconColor, fontSize: 22, fontWeight: '800' }}>
                {iconText}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 17,
              fontWeight: '700',
              color: '#111827',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 24,
            }}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                backgroundColor: '#f9fafb',
                alignItems: 'center',
                opacity: loading ? 0.5 : 1,
                ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
              }}
            >
              <Text style={{ color: '#374151', fontSize: 14, fontWeight: '600' }}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading || disabled}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: confirmBg,
                alignItems: 'center',
                opacity: (loading || disabled) ? 0.6 : 1,
                ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                {loading ? 'Đang xử lý...' : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ===================== Hook for easy usage =====================
export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: 'danger' | 'default';
    onConfirm: () => void;
  }>({
    visible: false,
    title: 'Xác nhận',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    variant: 'default',
    onConfirm: () => {},
  });

  const confirm = (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
    onConfirm: () => void;
  }) => {
    setState({
      visible: true,
      title: options.title || 'Xác nhận',
      message: options.message,
      confirmText: options.confirmText || 'Xác nhận',
      cancelText: options.cancelText || 'Hủy',
      variant: options.variant || 'default',
      onConfirm: options.onConfirm,
    });
  };

  const close = () => {
    setState((prev) => ({ ...prev, visible: false }));
  };

  const dialogProps: ConfirmDialogProps = {
    visible: state.visible,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    variant: state.variant,
    onConfirm: () => {
      state.onConfirm();
      close();
    },
    onCancel: close,
  };

  return { confirm, dialogProps };
}
