import React from "react";
import { Platform, Text, type TextProps } from "react-native";
import ExpoIonicons from "@expo/vector-icons/build/Ionicons";

type IoniconsProps = React.ComponentProps<typeof ExpoIonicons>;

function glyphChar(name: IoniconsProps["name"]): string {
  const map = (ExpoIonicons as { glyphMap?: Record<string, number | string> })
    .glyphMap;
  const glyph = map?.[name as string];
  if (typeof glyph === "number") return String.fromCodePoint(glyph);
  return typeof glyph === "string" ? glyph : "?";
}

/**
 * Web: render trực tiếp bằng font ionicons (không chờ Font.isLoaded của @expo/vector-icons).
 * Native: dùng component gốc.
 */
export default function WebIonicons({
  name,
  size = 24,
  color = "#000",
  style,
  ...rest
}: IoniconsProps) {
  if (Platform.OS !== "web") {
    return (
      <ExpoIonicons name={name} size={size} color={color} style={style} {...rest} />
    );
  }

  return (
    <Text
      selectable={false}
      {...(rest as TextProps)}
      style={[
        {
          fontFamily: "ionicons",
          fontWeight: "normal",
          fontStyle: "normal",
          fontSize: size,
          color,
          lineHeight: size,
          textAlign: "center",
        },
        style,
      ]}
    >
      {glyphChar(name)}
    </Text>
  );
}
