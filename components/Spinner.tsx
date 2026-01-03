import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface SpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 24, 
  color = Colors.primary,
  style 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: `${color}20`,
          borderTopColor: color,
          transform: [{ rotate }],
        }}
      />
    </View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <Spinner size={40} />
      {message && (
        <View style={{ marginTop: 16 }}>
          <Animated.Text
            style={{
              fontSize: 16,
              color: Colors.textSecondary,
              textAlign: 'center',
            }}
          >
            {message}
          </Animated.Text>
        </View>
      )}
    </View>
  );
};
