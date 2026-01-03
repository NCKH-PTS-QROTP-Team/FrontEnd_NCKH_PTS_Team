import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
  variant?: 'center' | 'bottom';
}

/**
 * Modal with animations:
 * - Center variant: Scale + fade animation
 * - Bottom variant: Slide-up animation
 */
export default function Modal({
  visible,
  onClose,
  title,
  children,
  width = 500,
  variant = 'center',
}: ModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (variant === 'center') {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      if (variant === 'center') {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: Dimensions.get('window').height,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [visible, variant]);

  if (variant === 'bottom') {
    const windowWidth = Dimensions.get('window').width;
    const isMobile = windowWidth < 768;

    return (
      <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
        <View style={{ flex: 1 }}>
          {/* Backdrop */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: fadeAnim,
            }}
          >
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
          </Animated.View>

          {/* Modal Content */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: Colors.white,
              borderTopLeftRadius: isMobile ? 0 : 24,
              borderTopRightRadius: isMobile ? 0 : 24,
              height: isMobile ? '100%' : undefined, // Full-screen on mobile
              maxHeight: isMobile ? '100%' : '90%',
              transform: [{ translateY: slideAnim }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 16,
              ...Platform.select({
                web: {
                  position: 'fixed' as any,
                },
              }),
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.gray300,
                }}
              />
            </View>

            {/* Header */}
            {title && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 24,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    color: Colors.textHeading,
                    letterSpacing: -0.01,
                    flex: 1,
                  }}
                >
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: Colors.gray100,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, color: Colors.gray600 }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Content */}
            <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>{children}</View>
          </Animated.View>
        </View>
      </RNModal>
    );
  }

  // Center variant
  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < 768;

  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          alignItems: 'center',
          justifyContent: isMobile ? 'flex-end' : 'center',
          padding: isMobile ? 0 : 24,
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={{
            backgroundColor: Colors.white,
            borderRadius: isMobile ? 0 : 16,
            borderTopLeftRadius: isMobile ? 24 : 16,
            borderTopRightRadius: isMobile ? 24 : 16,
            padding: 24,
            maxWidth: isMobile ? '100%' : width,
            width: '100%',
            maxHeight: isMobile ? '90%' : undefined,
            transform: [{ scale: isMobile ? 1 : scaleAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 24,
            elevation: 16,
          }}
        >
          {title && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: Colors.textHeading,
                  letterSpacing: -0.01,
                }}
              >
                {title}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: Colors.gray100,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, color: Colors.gray600 }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {children}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}
