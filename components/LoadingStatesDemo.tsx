import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonText } from './Skeleton';
import { Spinner, LoadingOverlay } from './Spinner';
import { ErrorState, ErrorBanner } from './ErrorState';
import Toast, { useToast } from './Toast';
import PrimaryButton from './PrimaryButton';
import { Colors } from '@/constants/colors';

export default function LoadingStatesDemo() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const { showToast } = useToast();

  const handleShowOverlay = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6" style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
        <Text className="text-3xl font-bold mb-2" style={{ color: Colors.text, lineHeight: 48 }}>
          Loading & Empty States
        </Text>
        <Text className="text-base mb-8" style={{ color: Colors.textSecondary, lineHeight: 24 }}>
          Professional loading states, error handling, and toast notifications
        </Text>

        {/* Toast Notifications */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Toast Notifications
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 12, marginBottom: 12 }}>
            <PrimaryButton
              title="Success Toast"
              onPress={() => showToast('Thao tác thành công!', 'success')}
            />
            <PrimaryButton
              title="Error Toast"
              onPress={() => showToast('Đã có lỗi xảy ra!', 'error')}
            />
            <PrimaryButton
              title="Warning Toast"
              onPress={() => showToast('Cảnh báo: Vui lòng kiểm tra!', 'warning')}
            />
            <PrimaryButton
              title="Info Toast"
              onPress={() => showToast('Thông tin: Cập nhật mới', 'info')}
            />
          </View>
        </View>

        {/* Spinners */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Spinners
          </Text>
          <View className="bg-white p-6 rounded-lg border" style={{ borderColor: Colors.gray200 }}>
            <View className="flex-row items-center" style={{ gap: 24 }}>
              <View className="items-center">
                <Spinner size={24} />
                <Text className="text-sm mt-2" style={{ color: Colors.textSecondary }}>
                  Small (24px)
                </Text>
              </View>
              <View className="items-center">
                <Spinner size={32} />
                <Text className="text-sm mt-2" style={{ color: Colors.textSecondary }}>
                  Medium (32px)
                </Text>
              </View>
              <View className="items-center">
                <Spinner size={40} />
                <Text className="text-sm mt-2" style={{ color: Colors.textSecondary }}>
                  Large (40px)
                </Text>
              </View>
              <View className="items-center">
                <Spinner size={32} color={Colors.success} />
                <Text className="text-sm mt-2" style={{ color: Colors.textSecondary }}>
                  Custom Color
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Loading Overlay */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Loading Overlay
          </Text>
          <View className="bg-white p-6 rounded-lg border relative" style={{ borderColor: Colors.gray200, height: 200 }}>
            <Text style={{ color: Colors.textSecondary }}>
              Content behind overlay...
            </Text>
            <PrimaryButton
              title="Show Loading Overlay"
              onPress={handleShowOverlay}
              style={{ marginTop: 16 }}
            />
            <LoadingOverlay visible={showOverlay} message="Đang tải dữ liệu..." />
          </View>
        </View>

        {/* Skeleton Loading - Cards */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Skeleton Loading - Cards
          </Text>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>

        {/* Skeleton Loading - Table */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Skeleton Loading - Table
          </Text>
          <SkeletonTable rows={4} />
        </View>

        {/* Skeleton Loading - Text */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Skeleton Loading - Text
          </Text>
          <View className="bg-white p-6 rounded-lg border" style={{ borderColor: Colors.gray200 }}>
            <SkeletonText lines={5} />
          </View>
        </View>

        {/* Skeleton Loading - Custom */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Skeleton Loading - Custom Shapes
          </Text>
          <View className="bg-white p-6 rounded-lg border" style={{ borderColor: Colors.gray200 }}>
            <View className="flex-row items-center mb-4">
              <Skeleton width={60} height={60} borderRadius={30} style={{ marginRight: 16 }} />
              <View className="flex-1">
                <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
                <Skeleton width="60%" height={16} />
              </View>
            </View>
            <Skeleton width="100%" height={120} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="90%" height={16} />
          </View>
        </View>

        {/* Error Banner */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Error Banner
          </Text>
          <PrimaryButton
            title={showErrorBanner ? "Hide Error Banner" : "Show Error Banner"}
            onPress={() => setShowErrorBanner(!showErrorBanner)}
            style={{ marginBottom: 12 }}
          />
          {showErrorBanner && (
            <ErrorBanner
              message="Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối internet."
              onDismiss={() => setShowErrorBanner(false)}
              onRetry={() => {
                setShowErrorBanner(false);
                showToast('Đang thử kết nối lại...', 'info');
              }}
            />
          )}
        </View>

        {/* Error State */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Error State - Full
          </Text>
          <ErrorState
            title="Không thể tải dữ liệu"
            message="Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau."
            onRetry={() => showToast('Đang tải lại...', 'info')}
            retryText="Tải lại"
          />
        </View>

        {/* Specifications */}
        <View className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>
            Loading States Specifications
          </Text>
          <View className="space-y-2">
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              ✓ Skeleton loading for tables and cards
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              ✓ Smooth spinner with 360° rotation animation
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              ✓ Empty state with illustration, heading, and CTA
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              ✓ Error state with retry button
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              ✓ Success toast notifications with auto-dismiss
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              ✓ Loading overlay with optional message
            </Text>
          </View>
        </View>
      </View>

      {/* Toast Component */}
    </ScrollView>
  );
}
