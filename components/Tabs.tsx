import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Colors } from "../constants/colors";

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
    <View style={{ borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}>
        <View style={{ flexDirection: "row", width: "100%" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={{
                  flex: 1,
                  paddingHorizontal: isMobile ? 16 : 20,
                  paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? Colors.primary : "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => onTabChange(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isActive ? "600" : "500",
                    color: isActive ? Colors.primary : Colors.gray600,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
