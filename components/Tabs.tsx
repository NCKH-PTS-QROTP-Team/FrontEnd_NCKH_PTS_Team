import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Colors } from '../constants/colors';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ borderBottomWidth: 1, borderBottomColor: Colors.border }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1,
<<<<<<< HEAD
                paddingHorizontal: isMobile ? 12 : 16,
                paddingVertical: isMobile ? 8 : 6,
                minHeight: isMobile ? 40 : 32,
                borderBottomWidth: isActive ? 2 : 0,
=======
                paddingHorizontal: isMobile ? 16 : 24,
                paddingVertical: isMobile ? 14 : 12,
                minHeight: 44, // Touch-friendly minimum height for mobile
                borderBottomWidth: 2,
>>>>>>> Phu
                borderBottomColor: isActive ? Colors.primary : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={{
<<<<<<< HEAD
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? Colors.primary : Colors.gray500,
=======
                  fontSize: isMobile ? 15 : 14,
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? Colors.primary : Colors.gray600,
>>>>>>> Phu
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
