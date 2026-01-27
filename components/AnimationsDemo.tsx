import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { PrimaryButton } from './PrimaryButton';
import { PageTransition } from './PageTransition';
import Modal from './Modal';
import Toast, { useToast } from './Toast';
import { AccessibleCard } from './AccessibleCard';
import { Skeleton, SkeletonCard } from './Skeleton';
import { HomeIcon, UsersIcon, SettingsIcon } from './Icons';

/**
 * Comprehensive demo of all animations and micro-interactions:
 * - Page transitions with fade-in
 * - Modal slide-up and scale animations
 * - Toast slide-in from top-right
 * - Button click feedback
 * - Card hover lift effect
 * - Skeleton loading shimmer
 */
export default function AnimationsDemo() {
  const [modalCenter, setModalCenter] = useState(false);
  const [modalBottom, setModalBottom] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  return (
    <PageTransition>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ padding: 24, maxWidth: 800 }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: Colors.textHeading,
                lineHeight: 40,                marginBottom: 8,
              }}
            >
              Animations & Micro-interactions
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: Colors.textSecondary,
                lineHeight: 24,
              }}
            >
              All components with smooth animations and delightful interactions
            </Text>
          </View>

          {/* Page Transition Section */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: Colors.textHeading,
                lineHeight: 32,                marginBottom: 8,
              }}
            >
              1. Page Transition
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                lineHeight: 21,
                marginBottom: 16,
              }}
            >
              This entire page fades in and slides up when mounted (400ms duration)
            </Text>
            <View
              style={{
                backgroundColor: Colors.primary + '10',
                borderLeftWidth: 4,
                borderLeftColor: Colors.primary,
                padding: 16,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: Colors.text, fontSize: 14 }}>
                ✓ Fade-in opacity animation
              </Text>
              <Text style={{ color: Colors.text, fontSize: 14, marginTop: 8 }}>
                ✓ Slide-up translateY animation
              </Text>
              <Text style={{ color: Colors.text, fontSize: 14, marginTop: 8 }}>
                ✓ Automatic on component mount
              </Text>
            </View>
          </View>

          {/* Modal Animations Section */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: Colors.textHeading,
                lineHeight: 32,                marginBottom: 16,
              }}
            >
              2. Modal Animations
            </Text>

            <View style={{ gap: 12 }}>
              <PrimaryButton
                title="Open Center Modal (Scale + Fade)"
                onPress={() => setModalCenter(true)}
              />
              <PrimaryButton
                title="Open Bottom Modal (Slide-up)"
                onPress={() => setModalBottom(true)}
                variant="outline"
              />
            </View>

            <View
              style={{
                backgroundColor: Colors.gray50,
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textHeading }}>
                Center Modal:
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Scale from 0.8 to 1.0 with spring
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                • Backdrop fade-in
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                • 250ms duration
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: Colors.textHeading,
                  marginTop: 12,
                }}
              >
                Bottom Modal:
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Slide-up from bottom
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                • Spring animation (tension: 50, friction: 10)
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                • Handle bar for mobile UX
              </Text>
            </View>
          </View>

          {/* Toast Animation Section */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: Colors.textHeading,
                lineHeight: 32,                marginBottom: 8,
              }}
            >
              3. Toast Slide-in (Top-right)
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                lineHeight: 21,
                marginBottom: 16,
              }}
            >
              Toast notifications slide in from top-right corner with spring animation
            </Text>

            <View style={{ gap: 12 }}>
              <PrimaryButton
                title="Show Success Toast"
                onPress={() => showToast('Operation completed successfully!', 'success')}
              />
              <PrimaryButton
                title="Show Error Toast"
                onPress={() => showToast('Something went wrong!', 'error')}
                variant="outline"
              />
            </View>

            <View
              style={{
                backgroundColor: Colors.gray50,
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                • Positioned at top: 24px, right: 24px (web)
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Slide down from -50px to 0
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Spring animation (tension: 65, friction: 10)
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Auto-dismiss after 3 seconds
              </Text>
            </View>
          </View>

          {/* Button Click Feedback Section */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: Colors.textHeading,
                lineHeight: 32,                marginBottom: 16,
              }}
            >
              4. Button Click Feedback
            </Text>

            <View style={{ gap: 12 }}>
              <PrimaryButton title="Press me - Watch the feedback" onPress={() => {}} />
              <PrimaryButton title="Outline variant" onPress={() => {}} variant="outline" />
              <PrimaryButton title="Ghost variant" onPress={() => {}} variant="ghost" />
            </View>

            <View
              style={{
                backgroundColor: Colors.gray50,
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textHeading }}>
                Click feedback effects:
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Scale down to 0.96 on press
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Shadow reduces on press
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Background color darkens on press
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • All transitions: 0.2s ease
              </Text>
            </View>
          </View>

          {/* Card Hover Lift Section */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: Colors.textHeading,
                lineHeight: 32,                marginBottom: 8,
              }}
            >
              5. Card Hover Lift Effect
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                lineHeight: 21,
                marginBottom: 16,
              }}
            >
              Interactive cards lift up on hover (desktop) or press (mobile)
            </Text>

            <View style={{ gap: 12 }}>
              <AccessibleCard onPress={() => {}} title="Clickable Card">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <HomeIcon size={32} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontSize: 16, fontWeight: '600', color: Colors.textHeading }}
                    >
                      Hover or tap me
                    </Text>
                    <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                      Watch the lift effect with enhanced shadow
                    </Text>
                  </View>
                </View>
              </AccessibleCard>

              <AccessibleCard onPress={() => {}} title="Another Card">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <UsersIcon size={32} color={Colors.success} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontSize: 16, fontWeight: '600', color: Colors.textHeading }}
                    >
                      Interactive card
                    </Text>
                    <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
                      Smooth transition with 0.2s ease
                    </Text>
                  </View>
                </View>
              </AccessibleCard>
            </View>

            <View
              style={{
                backgroundColor: Colors.gray50,
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textHeading }}>
                Hover effects:
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • translateY: -4px (lifts up)
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Shadow increases (elevation 8)
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Background changes to gray-50
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Transition: all 0.2s ease
              </Text>
            </View>
          </View>

          {/* Skeleton Shimmer Section */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: Colors.textHeading,
                lineHeight: 32,                marginBottom: 8,
              }}
            >
              6. Skeleton Loading Shimmer
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                lineHeight: 21,
                marginBottom: 16,
              }}
            >
              Smooth shimmer animation for loading placeholders
            </Text>

            <View style={{ gap: 12 }}>
              <SkeletonCard />
              <SkeletonCard />
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 8,
                  padding: 16,
                  gap: 12,
                }}
              >
                <Skeleton width="40%" height={20} />
                <Skeleton width="100%" height={16} />
                <Skeleton width="80%" height={16} />
                <Skeleton width="60%" height={14} />
              </View>
            </View>

            <View
              style={{
                backgroundColor: Colors.gray50,
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textHeading }}>
                Shimmer animation:
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Horizontal sweep from left to right
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • translateX: -300px to 300px
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • 1500ms duration, infinite loop
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>
                • Semi-transparent white overlay
              </Text>
            </View>
          </View>

          {/* Summary */}
          <View
            style={{
              backgroundColor: Colors.primary + '10',
              borderRadius: 12,
              padding: 20,
              borderWidth: 1,
              borderColor: Colors.primary + '30',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: Colors.textHeading,
                marginBottom: 12,
              }}
            >
              Animation Specifications
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.text, width: 180, fontWeight: '500' }}>
                  Page transition:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Fade + slide, 400ms
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.text, width: 180, fontWeight: '500' }}>
                  Modal center:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Scale + fade, 250ms
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.text, width: 180, fontWeight: '500' }}>
                  Modal bottom:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Slide-up spring
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.text, width: 180, fontWeight: '500' }}>
                  Toast:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Slide from top-right
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.text, width: 180, fontWeight: '500' }}>
                  Button feedback:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Scale 0.96 + shadow
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.text, width: 180, fontWeight: '500' }}>
                  Card hover:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Lift -4px + shadow
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: Colors.text, width: 180, fontWeight: '500' }}>
                  Skeleton:
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, flex: 1 }}>
                  Shimmer 1500ms loop
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <Modal
        visible={modalCenter}
        onClose={() => setModalCenter(false)}
        title="Center Modal with Scale Animation"
        variant="center"
      >
        <View style={{ paddingVertical: 12 }}>
          <Text style={{ fontSize: 16, color: Colors.text, lineHeight: 24, marginBottom: 16 }}>
            This modal scales from 0.8 to 1.0 with a spring animation and fades in simultaneously.
          </Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 21 }}>
            Perfect for confirmations, alerts, and important messages that need user attention.
          </Text>
          <View style={{ marginTop: 24 }}>
            <PrimaryButton title="Got it!" onPress={() => setModalCenter(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalBottom}
        onClose={() => setModalBottom(false)}
        title="Bottom Modal with Slide-up"
        variant="bottom"
      >
        <View style={{ paddingBottom: 12 }}>
          <Text style={{ fontSize: 16, color: Colors.text, lineHeight: 24, marginBottom: 16 }}>
            This modal slides up from the bottom with a spring animation, perfect for mobile UX.
          </Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 21 }}>
            The handle bar at the top indicates it can be swiped down to dismiss (future feature).
          </Text>
          <View style={{ marginTop: 24 }}>
            <PrimaryButton title="Close" onPress={() => setModalBottom(false)} />
          </View>
        </View>
      </Modal>

      {/* Toast */}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </PageTransition>
  );
}
