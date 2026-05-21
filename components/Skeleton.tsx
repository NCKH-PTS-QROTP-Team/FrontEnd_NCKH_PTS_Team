import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { Colors } from '@/constants/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 16, 
  borderRadius = 4,
  style 
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.gray200,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Shimmer overlay */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX }],
        }}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            transform: [{ skewX: '-20deg' }],
          }}
        />
      </Animated.View>
    </View>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <View
      className="bg-white border rounded-lg p-4 mb-3"
      style={{ borderColor: Colors.gray200 }}
    >
      <View className="flex-row items-center">
        <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 12 }} />
        <View className="flex-1">
          <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={16} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
    </View>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <View
      className="bg-white border rounded-lg overflow-hidden"
      style={{ borderColor: Colors.gray200 }}
    >
      {/* Header */}
      <View className="flex-row bg-gray-50 p-4 border-b" style={{ borderBottomColor: Colors.gray200 }}>
        <Skeleton width={200} height={16} style={{ marginRight: 16 }} />
        <Skeleton width={150} height={16} style={{ marginRight: 16 }} />
        <Skeleton width={120} height={16} />
      </View>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={index}
          className="flex-row p-4 border-b"
          style={{ borderBottomColor: Colors.gray100 }}
        >
          <Skeleton width={200} height={16} style={{ marginRight: 16 }} />
          <Skeleton width={150} height={16} style={{ marginRight: 16 }} />
          <Skeleton width={120} height={16} />
        </View>
      ))}
    </View>
  );
};

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : '100%'}
          height={16}
          style={{ marginBottom: index === lines - 1 ? 0 : 8 }}
        />
      ))}
    </View>
  );
};
