import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ViewStyle,
  StyleSheet,
  Platform,
} from "react-native";
import { Colors } from "../constants/colors";
import { isDesktop } from "../constants/responsive";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  className?: string;
}

export default function Card({
  children,
  onPress,
  className = "",
  style,
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Container = (onPress ? TouchableOpacity : View) as any;

  // Flatten style array to object for web compatibility
  const flatStyle = style ? StyleSheet.flatten(style) : {};

  const cardPadding = isDesktop ? 24 : 16;

  return (
    <Container
      style={[
        {
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 8,
          padding: cardPadding,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isHovered && onPress ? 0.1 : 0.03,
          shadowRadius: isHovered && onPress ? 8 : 3,
          elevation: isHovered && onPress ? 4 : 1,
          transform:
            isHovered && onPress && Platform.OS === "web"
              ? [{ scale: 1.02 }]
              : [],
        },
        Platform.OS === "web" &&
          ({
            transition: "all 0.2s ease",
          } as any),
        flatStyle,
      ]}
      onPress={onPress}
      {...(Platform.OS === "web" &&
        ({
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        } as any))}
    >
      {children}
    </Container>
  );
}
