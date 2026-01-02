import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="border-b"
      style={{ borderBottomColor: Colors.border }}
    >
      <View className="flex-row">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              className="px-6 py-3 border-b-2"
              style={{
                borderBottomColor: isActive ? Colors.primary : 'transparent',
              }}
              onPress={() => onTabChange(tab.key)}
            >
              <Text
                className="font-medium text-sm"
                style={{
                  color: isActive ? Colors.primary : Colors.gray600,
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
