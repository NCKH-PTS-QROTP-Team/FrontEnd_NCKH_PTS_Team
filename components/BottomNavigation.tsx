<<<<<<< HEAD
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';
=======
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { Colors } from "../constants/colors";
>>>>>>> Phu

interface BottomNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
<<<<<<< HEAD
=======
  isCenterButton?: boolean; // For the special floating button
>>>>>>> Phu
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  activeKey: string;
  onItemPress: (key: string) => void;
<<<<<<< HEAD
}

/**
 * Bottom navigation for mobile devices
 * - Shows on mobile (width < 768px)
 * - Fixed at bottom of screen
=======
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
>>>>>>> Phu
 * - 44px minimum touch targets
 * - Icon + label layout
 */
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  activeKey,
  onItemPress,
<<<<<<< HEAD
}) => {
  const [windowWidth] = useState(Dimensions.get('window').width);
=======
  centerButton,
}) => {
  const [windowWidth] = useState(Dimensions.get("window").width);
>>>>>>> Phu
  const isMobile = windowWidth < 768;

  // Hide on desktop
  if (!isMobile) return null;

<<<<<<< HEAD
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        flexDirection: 'row',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8, // Safe area for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        ...(Platform.OS === 'web' && {
          position: 'fixed' as any,
=======
  // Split items into left and right (for floating center button)
  const leftItems = items.slice(0, 2);
  const rightItems = items.slice(2);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        ...(Platform.OS === "web" && {
          position: "fixed" as any,
>>>>>>> Phu
          zIndex: 999,
        }),
      }}
    >
<<<<<<< HEAD
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
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              minHeight: 44, // Touch-friendly minimum
            }}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              {item.icon}
            </View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: isActive ? '600' : '400',
                color: isActive ? Colors.primary : Colors.textSecondary,
                letterSpacing: -0.01,
              }}
            >
              {item.label}
            </Text>
            {isActive && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '20%',
                  right: '20%',
                  height: 2,
                  backgroundColor: Colors.primary,
                  borderRadius: 2,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
=======
      {/* Background with curved cutout */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          flexDirection: "row",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {/* Left items */}
        {leftItems.map((item) => {
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
                {item.icon}
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? "600" : "400",
                  color: isActive ? Colors.primary : Colors.textSecondary,
                  letterSpacing: -0.01,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Spacer for center button */}
        <View style={{ flex: 1 }} />

        {/* Right items */}
        {rightItems.map((item) => {
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
                {item.icon}
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? "600" : "400",
                  color: isActive ? Colors.primary : Colors.textSecondary,
                  letterSpacing: -0.01,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating center button */}
      {centerButton && (
        <TouchableOpacity
          onPress={centerButton.onPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Điểm danh"
          style={{
            position: "absolute",
            bottom: 30,
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
            borderColor: Colors.white,
          }}
        >
          {centerButton.icon}
        </TouchableOpacity>
      )}
>>>>>>> Phu
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
  height = 70,
}) => {
<<<<<<< HEAD
  const [windowWidth] = useState(Dimensions.get('window').width);
=======
  const [windowWidth] = useState(Dimensions.get("window").width);
>>>>>>> Phu
  const isMobile = windowWidth < 768;

  if (!isMobile) return null;

  return <View style={{ height }} />;
};
