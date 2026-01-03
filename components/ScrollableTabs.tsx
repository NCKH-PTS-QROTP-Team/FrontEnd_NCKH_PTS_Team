import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface ScrollableTabsProps {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;
}

/**
 * Scrollable tabs component optimized for mobile:
 * - Horizontal scroll on mobile
 * - Touch-friendly 44px minimum height
 * - Active indicator animation
 * - Smooth scrolling to active tab
 */
export const ScrollableTabs: React.FC<ScrollableTabsProps> = ({
  tabs,
  activeKey,
  onTabPress,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [tabLayouts, setTabLayouts] = useState<{ [key: string]: { x: number; width: number } }>(
    {}
  );
  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < 768;

  const handleTabPress = (key: string) => {
    onTabPress(key);

    // Scroll to active tab on mobile
    if (isMobile && scrollViewRef.current && tabLayouts[key]) {
      const { x, width } = tabLayouts[key];
      const scrollX = x - windowWidth / 2 + width / 2;
      scrollViewRef.current.scrollTo({ x: Math.max(0, scrollX), animated: true });
    }
  };

  const handleTabLayout = (key: string, event: any) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({ ...prev, [key]: { x, width } }));
  };

  return (
    <View
      style={{
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 8 : 16,
          minWidth: isMobile ? undefined : '100%',
        }}
        style={{
          flexGrow: 0,
        }}
      >
        <View style={{ flexDirection: 'row', gap: isMobile ? 4 : 8 }}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeKey;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
                onLayout={(event) => handleTabLayout(tab.key, event)}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
                style={{
                  paddingHorizontal: isMobile ? 16 : 20,
                  paddingVertical: 12,
                  minHeight: 44, // Touch-friendly
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? Colors.primary : 'transparent',
                  ...(Platform.OS === 'web' && {
                    transition: 'all 0.2s ease',
                  } as any),
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {tab.icon}
                  <Text
                    style={{
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? Colors.primary : Colors.textSecondary,
                      letterSpacing: -0.01,
                    }}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

interface PillTabsProps {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;
}

/**
 * Pill-style tabs with horizontal scroll
 * More compact design suitable for filters or categories
 */
export const PillTabs: React.FC<PillTabsProps> = ({ tabs, activeKey, onTabPress }) => {
  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < 768;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: isMobile ? 16 : 24,
        gap: 8,
      }}
      style={{
        flexGrow: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            style={{
              paddingHorizontal: isMobile ? 16 : 20,
              paddingVertical: 8,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 24,
              backgroundColor: isActive ? Colors.primary : Colors.gray100,
              ...(Platform.OS === 'web' && {
                transition: 'all 0.2s ease',
              } as any),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {tab.icon}
              <Text
                style={{
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? Colors.white : Colors.textSecondary,
                  letterSpacing: -0.01,
                }}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
