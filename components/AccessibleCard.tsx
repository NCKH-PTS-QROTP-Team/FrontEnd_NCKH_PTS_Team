import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ViewStyle,
} from "react-native";
import { Colors } from "../constants/colors";

interface AccessibleCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  title?: string;
  style?: ViewStyle;
  className?: string;
}

/**
 * Accessible card component with proper focus states for keyboard navigation
 * - Minimum 44x44px touch target when pressable
 * - Focus-visible outline for keyboard users
 * - ARIA labels and roles
 * - Hover states with transitions
 */
export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  children,
  onPress,
  title,
  style,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getFocusStyle = () => {
    if (!isFocused) return {};

    return Platform.OS === "web"
      ? {
          outline: `3px solid ${Colors.focusRing}`,
          outlineOffset: "2px",
        }
      : {};
  };

  const getHoverStyle = () => {
    if (!isHovered || !onPress) return {};

    return {
      backgroundColor: Colors.gray50,
      transform: [{ translateY: -4 }],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    };
  };

  const baseStyle: ViewStyle = {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: onPress ? 44 : undefined, // Ensure touch target size
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    ...(Platform.OS === "web" &&
      onPress &&
      ({
        transition: "all 0.2s ease",
        cursor: "pointer",
      } as any)),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        className={className}
        style={[baseStyle, getFocusStyle(), getHoverStyle(), style]}
        activeOpacity={0.9}
        {...(Platform.OS === "web" &&
          ({
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
            onFocus: () => setIsFocused(true),
            onBlur: () => setIsFocused(false),
          } as any))}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={className} style={[baseStyle, style]}>
      {children}
    </View>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle }) => (
  <View style={{ marginBottom: 12 }}>
    <Text
      style={{
        fontSize: 18,
        fontWeight: "600",
        color: Colors.textHeading,
        lineHeight: 27,
        letterSpacing: -0.01,
        marginBottom: subtitle ? 4 : 0,
      }}
    >
      {title}
    </Text>
    {subtitle && (
      <Text
        style={{
          fontSize: 14,
          color: Colors.textSecondary,
          lineHeight: 21,
        }}
      >
        {subtitle}
      </Text>
    )}
  </View>
);

interface CardContentProps {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ children }) => (
  <View style={{ marginBottom: 12 }}>{children}</View>
);

interface CardFooterProps {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children }) => (
  <View
    style={{
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {children}
  </View>
);
