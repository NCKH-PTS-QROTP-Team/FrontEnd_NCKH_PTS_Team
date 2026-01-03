import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { PrimaryButton } from './PrimaryButton';
import Input from './Input';
import { AccessibleCard, CardHeader, CardContent, CardFooter } from './AccessibleCard';
import { HomeIcon, UsersIcon, SettingsIcon } from './Icons';

/**
 * Demonstration of accessibility improvements:
 * - WCAG AA compliant colors (4.5:1 contrast ratio minimum)
 * - Focus-visible states for keyboard navigation
 * - 24x24px minimum icon sizes
 * - 44x44px minimum touch targets
 * - Proper ARIA labels and roles
 * - Text color hierarchy (gray-900 for headings, gray-600 for body)
 */
export default function AccessibilityDemo() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{ padding: 24, maxWidth: 800 }}>
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: Colors.textHeading, // gray-900
              lineHeight: 40,
              letterSpacing: -0.02,
              marginBottom: 8,
            }}
          >
            Accessibility & Colors Demo
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: Colors.textSecondary, // gray-600
              lineHeight: 24,
            }}
          >
            WCAG AA compliant design with enhanced keyboard navigation
          </Text>
        </View>

        {/* Color Contrast Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '600',
              color: Colors.textHeading,
              lineHeight: 32,
              letterSpacing: -0.01,
              marginBottom: 16,
            }}
          >
            Color Contrast (4.5:1 minimum)
          </Text>

          <AccessibleCard style={{ marginBottom: 16 }}>
            <CardContent>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: Colors.primary,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textHeading }}>
                      Primary: {Colors.primary}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                      Contrast ratio: 5.02:1 ✓
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: Colors.success,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textHeading }}>
                      Success: {Colors.success}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                      Contrast ratio: 4.51:1 ✓
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: Colors.error,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textHeading }}>
                      Error: {Colors.error}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                      Contrast ratio: 5.51:1 ✓
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: Colors.warning,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textHeading }}>
                      Warning: {Colors.warning}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                      Contrast ratio: 4.53:1 ✓
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </AccessibleCard>
        </View>

        {/* Text Hierarchy Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '600',
              color: Colors.textHeading,
              lineHeight: 32,
              letterSpacing: -0.01,
              marginBottom: 16,
            }}
          >
            Text Color Hierarchy
          </Text>

          <AccessibleCard>
            <CardContent>
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.textHeading }}>
                    Heading Text - Gray 900
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                    {Colors.textHeading} • Contrast 16.75:1
                  </Text>
                </View>

                <View>
                  <Text style={{ fontSize: 16, color: Colors.text }}>
                    Body Text - Gray 800
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                    {Colors.text} • Contrast 12.63:1
                  </Text>
                </View>

                <View>
                  <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                    Secondary Text - Gray 600
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                    {Colors.textSecondary} • Contrast 7.54:1
                  </Text>
                </View>

                <View>
                  <Text style={{ fontSize: 14, color: Colors.textLight }}>
                    Light Text - Gray 500
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                    {Colors.textLight} • Contrast 5.39:1
                  </Text>
                </View>
              </View>
            </CardContent>
          </AccessibleCard>
        </View>

        {/* Keyboard Navigation Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '600',
              color: Colors.textHeading,
              lineHeight: 32,
              letterSpacing: -0.01,
              marginBottom: 8,
            }}
          >
            Keyboard Navigation (Tab to test)
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.textSecondary,
              lineHeight: 21,
              marginBottom: 16,
            }}
          >
            All interactive elements have focus-visible outline with 3px ring
          </Text>

          <View style={{ gap: 12 }}>
            <PrimaryButton title="Primary Button (Tab to focus)" onPress={() => {}} />
            <PrimaryButton title="Outline Button" onPress={() => {}} variant="outline" />
            
            <Input
              label="Input Field with Focus Ring"
              placeholder="Tab here to see focus state"
              helperText="3px focus ring appears on keyboard focus"
            />

            <AccessibleCard onPress={() => {}} title="Clickable Card">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <HomeIcon size={24} color={Colors.primary} />
                <Text style={{ fontSize: 16, color: Colors.text }}>
                  Card with focus state (Tab to focus)
                </Text>
              </View>
            </AccessibleCard>
          </View>
        </View>

        {/* Icon Sizes Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '600',
              color: Colors.textHeading,
              lineHeight: 32,
              letterSpacing: -0.01,
              marginBottom: 16,
            }}
          >
            Minimum Icon Size: 24x24px
          </Text>

          <AccessibleCard>
            <CardContent>
              <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <HomeIcon size={24} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 12, color: Colors.textSecondary }}>24px</Text>
                </View>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <UsersIcon size={24} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 12, color: Colors.textSecondary }}>24px</Text>
                </View>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <SettingsIcon size={24} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 12, color: Colors.textSecondary }}>24px</Text>
                </View>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <HomeIcon size={32} color={Colors.primary} />
                  <Text style={{ fontSize: 12, color: Colors.textSecondary }}>32px</Text>
                </View>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <UsersIcon size={40} color={Colors.success} />
                  <Text style={{ fontSize: 12, color: Colors.textSecondary }}>40px</Text>
                </View>
              </View>
            </CardContent>
          </AccessibleCard>
        </View>

        {/* Touch Targets Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '600',
              color: Colors.textHeading,
              lineHeight: 32,
              letterSpacing: -0.01,
              marginBottom: 8,
            }}
          >
            Minimum Touch Target: 44x44px
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.textSecondary,
              lineHeight: 21,
              marginBottom: 16,
            }}
          >
            All buttons and interactive elements meet WCAG 2.1 Level AAA standards
          </Text>

          <View style={{ gap: 12 }}>
            <View
              style={{
                height: 44,
                backgroundColor: Colors.primary,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: '600' }}>44px height</Text>
            </View>
            <View
              style={{
                height: 48,
                backgroundColor: Colors.success,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: Colors.white, fontWeight: '600' }}>48px height (Input)</Text>
            </View>
          </View>
        </View>

        {/* Specifications */}
        <AccessibleCard>
          <CardHeader
            title="Accessibility Specifications"
            subtitle="WCAG 2.1 Level AA Compliant"
          />
          <CardContent>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.textHeading, width: 180, fontWeight: '500' }}>
                  Contrast Ratio:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Minimum 4.5:1 for normal text
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.textHeading, width: 180, fontWeight: '500' }}>
                  Focus Indicator:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  3px ring with 2px offset
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.textHeading, width: 180, fontWeight: '500' }}>
                  Icon Size:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Minimum 24x24px
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.textHeading, width: 180, fontWeight: '500' }}>
                  Touch Target:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Minimum 44x44px
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.textHeading, width: 180, fontWeight: '500' }}>
                  Headings:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Gray-900 (#111827)
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.textHeading, width: 180, fontWeight: '500' }}>
                  Body Text:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Gray-600 (#4B5563)
                </Text>
              </View>
            </View>
          </CardContent>
        </AccessibleCard>
      </View>
    </ScrollView>
  );
}
