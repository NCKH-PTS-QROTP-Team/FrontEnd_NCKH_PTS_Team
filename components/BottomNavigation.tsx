import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
interface BottomNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  isCenterButton?: boolean; // For the special floating button
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  activeKey: string;
  onItemPress: (key: string) => void;
  centerButton?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
}

/**
 * Bottom navigation for mobile devices with floating center button
 * - Shows on mobile (width < 768px)
 * - Fixed at bottom of screen
 * - Special floating button in center
 * - 44px minimum touch targets
 * - Icon + label layout
 */
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  activeKey,
  onItemPress,
  centerButton,
}) => {
  const [windowWidth] = useState(Dimensions.get("window").width);
  const isMobile = windowWidth < 768;
  const insets = useSafeAreaInsets();

  // Hide on desktop
  if (!isMobile) return null;

  // Tính toán height và padding dựa trên safe area insets
  // Dùng insets.bottom cho cả Android và iOS, cộng thêm khoảng đệm an toàn
  const baseHeight = 65;
  const bottomPadding = Math.max(insets.bottom, 12);
  const totalHeight = baseHeight + bottomPadding;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: totalHeight,
        ...(Platform.OS === "web" && {
          position: "fixed" as any,
          zIndex: 999,
        }),
      }}
    >
      {/* Navigation bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: baseHeight + bottomPadding,
          paddingBottom: bottomPadding,
          flexDirection: "row",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {/* Render all items evenly distributed */}
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onItemPress(item.key)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
                minHeight: 44,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                {typeof item.icon === "object" &&
                React.isValidElement(item.icon)
                  ? React.cloneElement(item.icon as React.ReactElement<any>, {
                      color: isActive ? Colors.primary : "#9CA3AF",
                      size: 22,
                    })
                  : item.icon}
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? "600" : "400",
                  color: isActive ? Colors.primary : "#6B7280",
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating center button (if provided) */}
      {centerButton && (
        <TouchableOpacity
          onPress={centerButton.onPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Điểm danh"
          style={{
            position: "absolute",
            bottom: 35 + bottomPadding, // Điều chỉnh theo bottom padding
            left: "50%",
            marginLeft: -32,
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: Colors.primary,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            borderWidth: 4,
            borderColor: "#FFFFFF",
          }}
        >
          {centerButton.icon}
        </TouchableOpacity>
      )}
    </View>
  );
};

interface BottomNavigationSpacerProps {
  height?: number;
}

/**
 * Spacer component to prevent content from being hidden behind bottom navigation
 * Use at the bottom of scrollable content
 */
export const BottomNavigationSpacer: React.FC<BottomNavigationSpacerProps> = ({
  height = 65,
}) => {
  const [windowWidth] = useState(Dimensions.get("window").width);
  const isMobile = windowWidth < 768;
  const insets = useSafeAreaInsets();

  if (!isMobile) return null;

  // Tính toán height bao gồm cả safe area insets
  const baseHeight = height;
  const bottomPadding = Math.max(insets.bottom, 12);
  const totalHeight = baseHeight + bottomPadding;

  return <View style={{ height: totalHeight }} />;
};
