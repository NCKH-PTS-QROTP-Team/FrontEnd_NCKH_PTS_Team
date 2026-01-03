import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import Modal from './Modal';
import { PrimaryButton } from './PrimaryButton';
import { ResponsiveText } from '../utils/responsive';

export type ConfirmationVariant = 'danger' | 'warning' | 'info';

export interface ConfirmationDialogProps {
  /**
   * Whether the dialog is visible
   */
  visible: boolean;
  
  /**
   * Dialog title
   */
  title: string;
  
  /**
   * Dialog message/description
   */
  message: string;
  
  /**
   * Variant determines the color scheme
   * @default 'danger'
   */
  variant?: ConfirmationVariant;
  
  /**
   * Confirm button text
   * @default 'Xác nhận'
   */
  confirmText?: string;
  
  /**
   * Cancel button text
   * @default 'Hủy'
   */
  cancelText?: string;
  
  /**
   * Callback when confirm button is pressed
   */
  onConfirm: () => void;
  
  /**
   * Callback when cancel button is pressed or dialog is closed
   */
  onCancel: () => void;
  
  /**
   * Whether to show loading state on confirm button
   * @default false
   */
  loading?: boolean;
  
  /**
   * Whether confirm button is disabled
   * @default false
   */
  disabled?: boolean;
}

const variantConfig: Record<ConfirmationVariant, { color: string; icon: string }> = {
  danger: {
    color: Colors.error,
    icon: '⚠️',
  },
  warning: {
    color: Colors.warning,
    icon: '⚡',
  },
  info: {
    color: Colors.info,
    icon: 'ℹ️',
  },
};

/**
 * Confirmation dialog for dangerous or important actions
 * 
 * @example
 * // Delete confirmation
 * <ConfirmationDialog
 *   visible={showDelete}
 *   title="Xóa sinh viên"
 *   message="Bạn có chắc chắn muốn xóa sinh viên này? Hành động này không thể hoàn tác."
 *   variant="danger"
 *   confirmText="Xóa"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDelete(false)}
 * />
 * 
 * @example
 * // Logout confirmation
 * <ConfirmationDialog
 *   visible={showLogout}
 *   title="Đăng xuất"
 *   message="Bạn có chắc chắn muốn đăng xuất?"
 *   variant="warning"
 *   confirmText="Đăng xuất"
 *   onConfirm={handleLogout}
 *   onCancel={() => setShowLogout(false)}
 * />
 */
export function ConfirmationDialog({
  visible,
  title,
  message,
  variant = 'danger',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  loading = false,
  disabled = false,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant];

  return (
    <Modal visible={visible} onClose={onCancel} variant="center">
      <View
        style={{
          width: Platform.OS === 'web' ? 400 : '100%',
          maxWidth: 500,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: config.color + '15',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            alignSelf: 'center',
          }}
        >
          <Text style={{ fontSize: 32 }}>{config.icon}</Text>
        </View>

        {/* Title */}
        <Text
          style={{
            ...ResponsiveText.h3,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          {title}
        </Text>

        {/* Message */}
        <Text
          style={{
            ...ResponsiveText.body,
            color: Colors.textSecondary,
            textAlign: 'center',
            marginBottom: 32,
            lineHeight: 24,
          }}
        >
          {message}
        </Text>

        {/* Actions */}
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
          }}
        >
          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 8,
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.5 : 1,
            }}
            accessibilityRole="button"
            accessibilityLabel={cancelText}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: Colors.text,
              }}
            >
              {cancelText}
            </Text>
          </TouchableOpacity>

          {/* Confirm Button */}
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title={confirmText}
              onPress={onConfirm}
              loading={loading}
              disabled={disabled}
              style={{
                backgroundColor: config.color,
                borderColor: config.color,
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Hook for managing confirmation dialog state
 * 
 * @example
 * const deleteConfirm = useConfirmation();
 * 
 * <Button onPress={() => deleteConfirm.show()}>Xóa</Button>
 * 
 * <ConfirmationDialog
 *   visible={deleteConfirm.visible}
 *   title="Xóa mục"
 *   message="Bạn có chắc chắn?"
 *   onConfirm={() => {
 *     handleDelete();
 *     deleteConfirm.hide();
 *   }}
 *   onCancel={deleteConfirm.hide}
 * />
 */
export function useConfirmation() {
  const [visible, setVisible] = React.useState(false);

  return {
    visible,
    show: () => setVisible(true),
    hide: () => setVisible(false),
    toggle: () => setVisible(!visible),
  };
}
