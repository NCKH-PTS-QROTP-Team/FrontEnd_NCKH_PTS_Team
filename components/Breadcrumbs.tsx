import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";

interface BreadcrumbItem {
  label: string;
  route?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <View
      className="flex-row items-center flex-wrap"
      style={{ marginBottom: 8 }}
    >
      {items.map((item, index) => (
        <View key={index} className="flex-row items-center">
          {index > 0 && (
            <Text className="text-gray-400 mx-2" style={{ fontSize: 14 }}>
              /
            </Text>
          )}
          {item.route && index < items.length - 1 ? (
            <TouchableOpacity
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <Text
                className="text-sm"
                style={{ color: Colors.primary, lineHeight: 21 }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              className="text-sm"
              style={{
                color:
                  index === items.length - 1 ? Colors.gray900 : Colors.gray600,
                fontWeight: index === items.length - 1 ? "600" : "400",
                lineHeight: 21,
              }}
            >
              {item.label}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

export default Breadcrumbs;
