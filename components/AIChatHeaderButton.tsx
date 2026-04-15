import React from "react";
import { TouchableOpacity, Platform, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function AIChatHeaderButton() {
  const handleOpenChat = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("chatbox:open"));
    }
  };

  return (
    <TouchableOpacity
      onPress={handleOpenChat}
      activeOpacity={0.85}
      style={{
        width: 42,
        height: 42,
        borderRadius: 21,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1f3d8e",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(31, 61, 142, 0.28)",
        ...(Platform.OS === "web"
          ? ({
              cursor: "pointer",
              transition: "all 0.2s ease",
            } as any)
          : {}),
      }}
      accessibilityRole="button"
      accessibilityLabel="Mở AI chat"
    >
      <LinearGradient
        colors={["#1f3d8e", "#2f57bf"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />

      <Ionicons
        name="chatbubble-ellipses"
        size={19}
        color="#FFFFFF"
        style={
          Platform.OS === "web"
            ? ({ textShadow: "0 1px 4px rgba(0,0,0,0.28)" } as any)
            : undefined
        }
      />

      <View
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.22)",
          paddingHorizontal: 4,
          paddingVertical: 1,
        }}
      >
        <Text style={{ fontSize: 8, fontWeight: "700", color: "#FFFFFF" }}>
          AI
        </Text>
      </View>
    </TouchableOpacity>
  );
}
