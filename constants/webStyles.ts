/**
 * webStyles.ts — Shared premium web style utilities
 * 
 * Provides reusable style helpers for creating a premium desktop
 * experience while maintaining mobile-native look on apps.
 * 
 * ZERO LOGIC — Only style/layout utilities.
 */

import { Platform, ViewStyle, TextStyle } from "react-native";

// ─── Surface Background ─────────────────────────────────────────
export const WEB_BG = "#F8FAFC";

// ─── Web Shadow Levels ──────────────────────────────────────────
type ShadowLevel = "sm" | "md" | "lg" | "xl";

const WEB_SHADOWS: Record<ShadowLevel, string> = {
  sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
  lg: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
  xl: "0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
};

const NATIVE_SHADOWS: Record<ShadowLevel, ViewStyle> = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
};

/**
 * Returns platform-appropriate shadow styles.
 * Web → CSS boxShadow string; Mobile → native shadow properties.
 */
export function getWebShadow(level: ShadowLevel = "md"): ViewStyle {
  if (Platform.OS === "web") {
    return { boxShadow: WEB_SHADOWS[level] } as any;
  }
  return NATIVE_SHADOWS[level];
}

// ─── Premium Card Style ─────────────────────────────────────────

/**
 * Standard premium card style with rounded corners, border, and shadow.
 */
export function getWebCardStyle(opts?: {
  radius?: number;
  padding?: number;
  shadow?: ShadowLevel;
}): ViewStyle {
  const { radius = 16, padding = 24, shadow = "md" } = opts || {};
  return {
    backgroundColor: "#FFFFFF",
    borderRadius: radius,
    padding,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...getWebShadow(shadow),
  };
}

// ─── Content Container ──────────────────────────────────────────

/**
 * Centered content container with responsive maxWidth.
 */
export function getWebContainerStyle(opts?: {
  maxWidth?: number;
}): ViewStyle {
  const { maxWidth = 1200 } = opts || {};
  return {
    maxWidth,
    width: "100%" as any,
    alignSelf: "center",
  };
}

// ─── Cursor Pointer ─────────────────────────────────────────────

/**
 * Returns `cursor: 'pointer'` on web, empty object otherwise.
 * Use by spreading into style: `...getWebCursor()`
 */
export function getWebCursor(): ViewStyle {
  if (Platform.OS === "web") {
    return { cursor: "pointer" } as any;
  }
  return {};
}

// ─── Camera Modal Card (Web) ────────────────────────────────────

/**
 * Returns style for camera modal container on web.
 * Creates a centered, 16:9 rounded card instead of fullscreen.
 */
export function getWebCameraModalStyle(): ViewStyle {
  if (Platform.OS !== "web") return { flex: 1 };
  return {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 24,
  };
}

export function getWebCameraCardStyle(): ViewStyle {
  if (Platform.OS !== "web") return { flex: 1, alignSelf: "stretch" as any };
  return {
    width: "100%" as any,
    maxWidth: 800,
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111827",
    ...getWebShadow("xl"),
  };
}

// ─── Web Transition ─────────────────────────────────────────────

/**
 * Smooth CSS transitions for web hover effects.
 */
export function getWebTransition(
  property: string = "all",
  duration: string = "0.2s"
): ViewStyle {
  if (Platform.OS !== "web") return {};
  return {
    transition: `${property} ${duration} ease`,
  } as any;
}
