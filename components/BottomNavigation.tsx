import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';

interface BottomNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  activeKey: string;
  onItemPress: (key: string) => void;
}

/**
 * Bottom navigation for mobile devices
 * - Shows on mobile (width < 768px)
 * - Fixed at bottom of screen
 * - 44px minimum touch targets
 * - Icon + label layout
 */
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  activeKey,
  onItemPress,
}) => {
  const [windowWidth] = useState(Dimensions.get('window').width);
  const isMobile = windowWidth < 768;

  // Hide on desktop
  if (!isMobile) return null;

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
          zIndex: 999,
        }),
      }}
    >
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
  const [windowWidth] = useState(Dimensions.get('window').width);
  const isMobile = windowWidth < 768;

  if (!isMobile) return null;

  return <View style={{ height }} />;
};
