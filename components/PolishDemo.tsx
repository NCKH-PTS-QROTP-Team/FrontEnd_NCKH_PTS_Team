import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Divider, DividerWithContent } from './Divider';
import { Badge, DotBadge, NumericBadge } from './Badge';
import { Avatar, AvatarGroup } from './Avatar';
import { Tooltip, TooltipIcon } from './Tooltip';
import { ConfirmationDialog, useConfirmation } from './ConfirmationDialog';
import { ResponsiveContainer, ResponsiveGrid } from './ResponsiveLayout';
import { PageTransition } from './PageTransition';
import Toast, { useToast } from './Toast';
import { ResponsiveText, ResponsiveSpacing } from '../utils/responsive';
import { PrimaryButton } from './PrimaryButton';
import {
  UsersIcon,
  SettingsIcon,
  BellIcon,
  LogoutIcon,
  TrashIcon,
  EyeIcon,
  ChartIcon,
} from './Icons';

/**
 * Demo component showcasing all final polish components:
 * - Dividers (horizontal, vertical, with content)
 * - Badges (all variants, sizes, outlined, dot, numeric)
 * - Avatars (with initials, images, groups)
 * - Tooltips (all placements, for icons and actions)
 * - Confirmation dialogs (danger, warning, info)
 * - Success feedback with toasts
 */
export default function PolishDemo() {
  const { showToast } = useToast();
  const deleteConfirm = useConfirmation();
  const logoutConfirm = useConfirmation();
  const warningConfirm = useConfirmation();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = () => {
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      deleteConfirm.hide();
      showToast('Đã xóa thành công!', 'success');
    }, 1500);
  };

  const handleLogout = () => {
    logoutConfirm.hide();
    showToast('Đã đăng xuất!', 'info');
  };

  const handleWarning = () => {
    warningConfirm.hide();
    showToast('Đã thực hiện hành động!', 'warning');
  };

  return (
    <PageTransition>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <ResponsiveContainer>
          {/* Header */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.display}>
              Final Polish Components
            </Text>
            <Text style={{ ...ResponsiveText.body, color: Colors.textSecondary, marginTop: 8 }}>
              Dividers, Badges, Avatars, Tooltips, Confirmations & Feedback
            </Text>
          </View>

          {/* Dividers Section */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: ResponsiveSpacing.sectionGap,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text style={{ ...ResponsiveText.h3, marginBottom: 16 }}>
              Dividers
            </Text>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Horizontal divider (default):
            </Text>
            <View style={{ backgroundColor: Colors.surface, padding: 16, borderRadius: 8 }}>
              <Text style={ResponsiveText.body}>Section 1</Text>
              <Divider />
              <Text style={ResponsiveText.body}>Section 2</Text>
            </View>

            <Divider spacing={24} />

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Divider with content:
            </Text>
            <View style={{ backgroundColor: Colors.surface, padding: 16, borderRadius: 8 }}>
              <Text style={ResponsiveText.body}>Đăng nhập bằng email</Text>
              <DividerWithContent>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textLight }}>Hoặc</Text>
              </DividerWithContent>
              <Text style={ResponsiveText.body}>Đăng nhập bằng Google</Text>
            </View>

            <Divider spacing={24} />

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Vertical divider:
            </Text>
            <View style={{ backgroundColor: Colors.surface, padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', height: 80 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={ResponsiveText.body}>Left</Text>
              </View>
              <Divider orientation="vertical" spacing={12} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={ResponsiveText.body}>Right</Text>
              </View>
            </View>
          </View>

          {/* Badges Section */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: ResponsiveSpacing.sectionGap,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text style={{ ...ResponsiveText.h3, marginBottom: 16 }}>
              Badges
            </Text>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Variants:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="neutral">Neutral</Badge>
            </View>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Sizes:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              <Badge variant="primary" size="small">Small</Badge>
              <Badge variant="primary" size="medium">Medium</Badge>
              <Badge variant="primary" size="large">Large</Badge>
            </View>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Outlined:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              <Badge variant="success" outlined>Success</Badge>
              <Badge variant="warning" outlined>Warning</Badge>
              <Badge variant="error" outlined>Error</Badge>
            </View>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Dot badges (status):
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              <DotBadge variant="success">Online</DotBadge>
              <DotBadge variant="error">Offline</DotBadge>
              <DotBadge variant="warning">Away</DotBadge>
              <DotBadge variant="neutral">Busy</DotBadge>
            </View>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Numeric badges (notifications):
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <View style={{ position: 'relative' }}>
                <BellIcon size={24} color={Colors.text} />
                <View style={{ position: 'absolute', top: -8, right: -8 }}>
                  <NumericBadge variant="error">5</NumericBadge>
                </View>
              </View>
              <View style={{ position: 'relative' }}>
                <UsersIcon size={24} color={Colors.text} />
                <View style={{ position: 'absolute', top: -8, right: -8 }}>
                  <NumericBadge variant="primary">12</NumericBadge>
                </View>
              </View>
              <NumericBadge variant="success">99+</NumericBadge>
            </View>
          </View>

          {/* Avatars Section */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: ResponsiveSpacing.sectionGap,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text style={{ ...ResponsiveText.h3, marginBottom: 16 }}>
              Avatars
            </Text>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Sizes:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <Avatar name="Nguyễn Văn A" size="small" />
              <Avatar name="Trần Thị B" size="medium" />
              <Avatar name="Lê Văn C" size="large" />
              <Avatar name="Phạm Thị D" size="xlarge" />
              <Avatar name="Hoàng Văn E" size={80} />
            </View>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Different colors (auto-generated from name):
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <Avatar name="Nguyễn Văn A" />
              <Avatar name="Trần Thị B" />
              <Avatar name="Lê Văn C" />
              <Avatar name="Phạm Thị D" />
              <Avatar name="Hoàng Văn E" />
              <Avatar name="Vũ Thị F" />
            </View>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              With border:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <Avatar name="Nguyễn Văn A" bordered />
              <Avatar name="Trần Thị B" bordered />
              <Avatar name="Lê Văn C" bordered />
            </View>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Avatar group:
            </Text>
            <AvatarGroup maxVisible={4}>
              <Avatar name="Nguyễn Văn A" />
              <Avatar name="Trần Thị B" />
              <Avatar name="Lê Văn C" />
              <Avatar name="Phạm Thị D" />
              <Avatar name="Hoàng Văn E" />
              <Avatar name="Vũ Thị F" />
              <Avatar name="Đỗ Văn G" />
            </AvatarGroup>
          </View>

          {/* Tooltips Section */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: ResponsiveSpacing.sectionGap,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text style={{ ...ResponsiveText.h3, marginBottom: 16 }}>
              Tooltips
            </Text>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Hover over icons to see tooltips (on mobile, press and hold):
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <TooltipIcon content="Cài đặt" placement="top">
                <SettingsIcon size={24} color={Colors.text} />
              </TooltipIcon>

              <TooltipIcon content="Thông báo" placement="top">
                <BellIcon size={24} color={Colors.text} />
              </TooltipIcon>

              <TooltipIcon content="Người dùng" placement="top">
                <UsersIcon size={24} color={Colors.text} />
              </TooltipIcon>

              <TooltipIcon content="Xem chi tiết" placement="bottom">
                <EyeIcon size={24} color={Colors.primary} />
              </TooltipIcon>

              <TooltipIcon content="Xóa" placement="bottom">
                <TrashIcon size={24} color={Colors.error} />
              </TooltipIcon>

              <TooltipIcon content="Đăng xuất" placement="right">
                <LogoutIcon size={24} color={Colors.warning} />
              </TooltipIcon>
            </View>

            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginBottom: 12 }}>
              Tooltip on button:
            </Text>
            <Tooltip content="Nhấn để thêm sinh viên mới vào hệ thống" placement="bottom">
              <PrimaryButton
                title="Thêm sinh viên"
                onPress={() => showToast('Button clicked!', 'info')}
                style={{ alignSelf: 'flex-start' }}
              />
            </Tooltip>
          </View>

          {/* Confirmation Dialogs Section */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: ResponsiveSpacing.sectionGap,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text style={{ ...ResponsiveText.h3, marginBottom: 16 }}>
              Confirmation Dialogs
            </Text>

            <Text style={{ ...ResponsiveText.body, color: Colors.textSecondary, marginBottom: 16 }}>
              Dialogs for dangerous or important actions:
            </Text>

            <View style={{ gap: 12 }}>
              <PrimaryButton
                title="🗑️ Delete Action (Danger)"
                onPress={deleteConfirm.show}
                style={{
                  backgroundColor: Colors.error,
                  borderColor: Colors.error,
                }}
              />

              <PrimaryButton
                title="⚠️ Warning Action"
                onPress={warningConfirm.show}
                style={{
                  backgroundColor: Colors.warning,
                  borderColor: Colors.warning,
                }}
              />

              <PrimaryButton
                title="🚪 Logout (Info)"
                onPress={logoutConfirm.show}
                style={{
                  backgroundColor: Colors.info,
                  borderColor: Colors.info,
                }}
              />
            </View>
          </View>

          {/* Success Feedback Section */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: ResponsiveSpacing.sectionGap,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text style={{ ...ResponsiveText.h3, marginBottom: 16 }}>
              Success Feedback
            </Text>

            <Text style={{ ...ResponsiveText.body, color: Colors.textSecondary, marginBottom: 16 }}>
              Toast notifications for action feedback:
            </Text>

            <View style={{ gap: 12 }}>
              <PrimaryButton
                title="✅ Success Message"
                onPress={() => showToast('Thao tác thành công!', 'success')}
                style={{
                  backgroundColor: Colors.success,
                  borderColor: Colors.success,
                }}
              />

              <PrimaryButton
                title="ℹ️ Info Message"
                onPress={() => showToast('Đây là thông tin!', 'info')}
                style={{
                  backgroundColor: Colors.info,
                  borderColor: Colors.info,
                }}
              />

              <PrimaryButton
                title="⚠️ Warning Message"
                onPress={() => showToast('Cảnh báo: Vui lòng kiểm tra lại!', 'warning')}
                style={{
                  backgroundColor: Colors.warning,
                  borderColor: Colors.warning,
                }}
              />

              <PrimaryButton
                title="❌ Error Message"
                onPress={() => showToast('Có lỗi xảy ra!', 'error')}
                style={{
                  backgroundColor: Colors.error,
                  borderColor: Colors.error,
                }}
              />
            </View>
          </View>

          {/* Summary */}
          <View
            style={{
              backgroundColor: Colors.primary + '10',
              borderRadius: 12,
              padding: 20,
              marginBottom: ResponsiveSpacing.sectionGap,
              borderWidth: 1,
              borderColor: Colors.primary + '30',
            }}
          >
            <Text style={{ ...ResponsiveText.h4, color: Colors.textHeading, marginBottom: 12 }}>
              ✨ Prompt 12 Complete - Final Polish
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, marginRight: 8 }}>✓</Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Dividers:</Text> Subtle borders (gray-200) horizontal/vertical/with content
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, marginRight: 8 }}>✓</Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Badges:</Text> 6 variants (success, warning, error, info, primary, neutral), 3 sizes, outlined, dot, numeric
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, marginRight: 8 }}>✓</Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Avatars:</Text> Initials fallback, auto-generated colors, 5 sizes, borders, avatar groups
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, marginRight: 8 }}>✓</Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Tooltips:</Text> Hover info for icons/actions, 4 placements (top, bottom, left, right)
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, marginRight: 8 }}>✓</Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Confirmation Dialogs:</Text> 3 variants (danger, warning, info) with loading states
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ ...ResponsiveText.body, marginRight: 8 }}>✓</Text>
                <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text, flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>Success Feedback:</Text> Toast notifications for all action types
                </Text>
              </View>
            </View>
          </View>
        </ResponsiveContainer>
      </ScrollView>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        visible={deleteConfirm.visible}
        title="Xóa sinh viên"
        message="Bạn có chắc chắn muốn xóa sinh viên này? Hành động này không thể hoàn tác."
        variant="danger"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDelete}
        onCancel={deleteConfirm.hide}
        loading={deleteLoading}
      />

      <ConfirmationDialog
        visible={warningConfirm.visible}
        title="Cảnh báo"
        message="Bạn có chắc chắn muốn thực hiện hành động này? Điều này có thể ảnh hưởng đến dữ liệu hiện tại."
        variant="warning"
        confirmText="Tiếp tục"
        onConfirm={handleWarning}
        onCancel={warningConfirm.hide}
      />

      <ConfirmationDialog
        visible={logoutConfirm.visible}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        variant="info"
        confirmText="Đăng xuất"
        onConfirm={handleLogout}
        onCancel={logoutConfirm.hide}
      />

      {/* Toast */}
    </PageTransition>
  );
}
