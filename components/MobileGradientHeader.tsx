import React from "react";
import { TouchableOpacity, Text, View, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type HeaderAction = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  accessibilityLabel?: string;
};

type MobileGradientHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  iconSize?: number;
  actions?: HeaderAction[];
  colors?: [string, string];
  style?: ViewStyle;
};

export default function MobileGradientHeader({
  title,
  subtitle,
  icon = "school",
  iconSize = 22,
  actions = [],
  colors = ["#1E3A8A", "#2563EB"],
  style,
}: MobileGradientHeaderProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: 16,
          marginHorizontal: 16,
          marginTop: 10,
          padding: 16,
          borderWidth: 1,
          borderColor: "#93C5FD",
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            flex: 1,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.32)",
            }}
          >
            <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 19, fontWeight: "800", color: "#FFFFFF" }}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.9)",
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {actions.length > 0 ? (
          <View style={{ flexDirection: "row", gap: 10 }}>
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={`${action.icon}-${idx}`}
                onPress={action.onPress}
                accessibilityLabel={action.accessibilityLabel}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.35)",
                }}
              >
                <Ionicons name={action.icon} size={19} color="#FFFFFF" />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}
