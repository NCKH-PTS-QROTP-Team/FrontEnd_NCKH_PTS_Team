import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

interface TrendData {
  value: number; // percentage change
  label?: string;
  period?: string; // e.g., "vs last month"
}

interface SparklineData {
  values: number[];
  color?: string;
}

interface StatsCardProps {
  title?: string;
  label?: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
  trend?: TrendData;
  sparkline?: SparklineData;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  label,
  value,
  icon,
  color = Colors.primary,
  subtitle,
  trend,
  sparkline,
}) => {
  const displayTitle = title || label || '';
  const isPositiveTrend = trend && trend.value >= 0;
  const trendColor = isPositiveTrend ? Colors.success : Colors.error;

  return (
    <View
      className="bg-white border"
      style={{
        borderRadius: 12,
        padding: 20,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        flex: 1,
        ...(Platform.OS === 'web' && {
          transition: 'all 0.2s ease',
        } as any),
      }}
    >
      {/* Header with Icon and Trend */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        {icon && (
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: color + '15',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
        )}
        {trend && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: trendColor + '10',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 14, color: trendColor, fontWeight: '600', marginRight: 2 }}>
              {isPositiveTrend ? '↑' : '↓'}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: trendColor }}>
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: 14,
          color: Colors.textSecondary,
          lineHeight: 21,
          marginBottom: 8,
          fontWeight: '500',
        }}
      >
        {displayTitle}
      </Text>

      {/* Value */}
      <Text
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: Colors.textHeading,
          lineHeight: 40,
          letterSpacing: -0.02,
          marginBottom: 4,
        }}
      >
        {value}
      </Text>

      {/* Subtitle or Trend Label */}
      {(subtitle || trend?.label || trend?.period) && (
        <Text
          style={{
            fontSize: 12,
            color: Colors.textLight,
            lineHeight: 18,
          }}
        >
          {subtitle || trend?.label || trend?.period}
        </Text>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.values.length > 0 && (
        <View style={{ marginTop: 16, height: 32 }}>
          <MiniSparkline
            data={sparkline.values}
            color={sparkline.color || color}
          />
        </View>
      )}
    </View>
  );
};

/**
 * Mini sparkline chart component
 */
interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color = Colors.primary,
  height = 32,
}) => {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  return (
    <View style={{ height, position: 'relative', width: '100%' }}>
      {/* Simple bar chart representation */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: '100%', gap: 2 }}>
        {data.map((value, index) => {
          const barHeight = ((value - min) / range) * height;
          return (
            <View
              key={index}
              style={{
                flex: 1,
                height: barHeight || 2,
                backgroundColor: color + '80',
                borderRadius: 2,
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

export default StatsCard;