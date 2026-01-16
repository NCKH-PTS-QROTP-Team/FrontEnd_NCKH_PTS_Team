import React from "react";
import { View, Text, Platform } from "react-native";
import { Colors } from "@/constants/colors";

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
  const displayTitle = title || label || "";
  const isPositiveTrend = trend && trend.value >= 0;
  const trendColor = isPositiveTrend ? Colors.success : Colors.error;

  // Create background color with opacity - ensure color is valid
  const getColorWithOpacity = (hexColor: string, opacity: number) => {
    if (!hexColor) return `rgba(63, 169, 245, ${opacity})`;

    // Remove # if present
    let hex = hexColor.replace("#", "");

    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    // Ensure we have 6 digits
    if (hex.length !== 6) {
      return `rgba(63, 169, 245, ${opacity})`;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const bgColor = getColorWithOpacity(color, 0.08);
  const iconBgColor = getColorWithOpacity(color, 0.15);

  return (
    <View
      style={{
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: bgColor,
        borderLeftWidth: 4,
        borderLeftColor: color,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: "hidden",
      }}
    >
      {/* Header with Icon and Trend */}
      {(icon || trend) && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          {icon && (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: iconBgColor,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </View>
          )}
          {trend && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: getColorWithOpacity(trendColor, 0.1),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: trendColor,
                  fontWeight: "600",
                  marginRight: 2,
                }}
              >
                {isPositiveTrend ? "↑" : "↓"}
              </Text>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: trendColor }}
              >
                {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Title */}
      <Text
        style={{
          fontSize: 13,
          color: Colors.textSecondary,
          lineHeight: 18,
          marginBottom: 6,
          fontWeight: "500",
        }}
      >
        {displayTitle}
      </Text>

      {/* Value */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          color: color,
          lineHeight: 36,
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

  // Create color with opacity
  const getColorWithOpacity = (hexColor: string, opacity: number) => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <View style={{ height, position: "relative", width: "100%" }}>
      {/* Simple bar chart representation */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          height: "100%",
          gap: 2,
        }}
      >
        {data.map((value, index) => {
          const barHeight = ((value - min) / range) * height;
          return (
            <View
              key={index}
              style={{
                flex: 1,
                height: barHeight || 2,
                backgroundColor: getColorWithOpacity(color, 0.5),
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
