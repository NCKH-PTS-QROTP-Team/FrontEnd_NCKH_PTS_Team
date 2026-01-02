import React from 'react';
import { View, TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle | ViewStyle[];
}

export default function Card({ children, onPress, className = '', style }: CardProps) {
  const Container = (onPress ? TouchableOpacity : View) as any;
  
  // Flatten style array to object for web compatibility
  const flatStyle = style ? StyleSheet.flatten(style) : {};
  
  return (
    <Container
      className={`bg-white rounded-xl ${className}`}
      style={{
        padding: 16,
        shadowColor: Colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        ...flatStyle,
      }}
      onPress={onPress}
    >
      {children}
    </Container>
  );
}
