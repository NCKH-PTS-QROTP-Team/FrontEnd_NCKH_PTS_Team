import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';

type Status = 'present' | 'late' | 'absent';

interface AttendanceStatusTagProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

export const AttendanceStatusTag: React.FC<AttendanceStatusTagProps> = ({
  status,
  size = 'md',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'present':
        return {
          label: 'Có mặt',
          bgColor: '#ECFDF5',
          textColor: Colors.success,
          borderColor: '#D1FAE5',
        };
      case 'late':
        return {
          label: 'Đi muộn',
          bgColor: '#FFFBEB',
          textColor: Colors.warning,
          borderColor: '#FDE68A',
        };
      case 'absent':
        return {
          label: 'Vắng',
          bgColor: '#FEF2F2',
          textColor: Colors.error,
          borderColor: '#FECACA',
        };
      default:
        return {
          label: 'Chưa xác định',
          bgColor: '#F3F4F6',
          textColor: Colors.gray600,
          borderColor: '#E5E7EB',
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { padding: 4, fontSize: 10, borderRadius: 4 };
      case 'lg':
        return { padding: 8, fontSize: 14, borderRadius: 8 };
      default:
        return { padding: 6, fontSize: 12, borderRadius: 6 };
    }
  };

  const config = getStatusConfig();
  const sizeConfig = getSizeConfig();

  if (!config) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: config.bgColor,
        borderWidth: 1,
        borderColor: config.borderColor,
        borderRadius: sizeConfig.borderRadius,
        paddingHorizontal: sizeConfig.padding,
        paddingVertical: sizeConfig.padding - 2,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: config.textColor,
          fontSize: sizeConfig.fontSize,
          fontWeight: '600',
        }}
      >
        {config.label}
      </Text>
    </View>
  );
};

export default AttendanceStatusTag;