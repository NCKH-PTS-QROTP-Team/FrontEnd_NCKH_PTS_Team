import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import PrimaryButton from './PrimaryButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã có lỗi xảy ra',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  retryText = 'Thử lại',
}) => {
  return (
    <View
      className="bg-white border rounded-lg"
      style={{
        borderColor: Colors.gray200,
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Error Icon */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: Colors.errorLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 40, color: Colors.error }}>!</Text>
      </View>

      {/* Title */}
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: Colors.text, lineHeight: 32, textAlign: 'center' }}
      >
        {title}
      </Text>

      {/* Message */}
      <Text
        className="text-base mb-6"
        style={{
          color: Colors.textSecondary,
          lineHeight: 24,
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        {message}
      </Text>

      {/* Retry Button */}
      {onRetry && (
        <PrimaryButton title={retryText} onPress={onRetry} />
      )}
    </View>
  );
};

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onDismiss,
  onRetry,
}) => {
  return (
    <View
      className="bg-red-50 border-l-4 rounded-lg p-4 mb-4 flex-row items-center"
      style={{ borderLeftColor: Colors.error, borderWidth: 1, borderColor: Colors.error + '20' }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: Colors.error,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ color: Colors.white, fontSize: 16, fontWeight: 'bold' }}>!</Text>
      </View>

      <Text className="flex-1 text-sm" style={{ color: Colors.error, lineHeight: 21 }}>
        {message}
      </Text>

      <View className="flex-row" style={{ gap: 8 }}>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: Colors.error,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>
              Thử lại
            </Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={{ padding: 6 }}>
            <Text style={{ color: Colors.error, fontSize: 18, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
