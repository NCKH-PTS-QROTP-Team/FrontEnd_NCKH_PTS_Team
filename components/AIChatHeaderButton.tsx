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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        ...(Platform.OS === "web"
          ? ({
              cursor: "pointer",
              transition: "all 0.2s ease",
            } as any)
          : {}),
      }}
      {...(Platform.OS === "web" && {
        onMouseEnter: (e: any) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; },
        onMouseLeave: (e: any) => { e.currentTarget.style.backgroundColor = "transparent"; }
      } as any)}
      accessibilityRole="button"
      accessibilityLabel="Mở AI chat"
    >
      <Ionicons
        name="sparkles-outline"
        size={20}
        color="#1e3a8a"
      />
    </TouchableOpacity>
  );
}
