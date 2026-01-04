import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, Platform } from 'react-native';
import { Colors } from '../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export default function Input({ label, error, success, helperText, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return Colors.error;
    if (success) return Colors.success;
    if (isFocused) return Colors.primary;
    return Colors.gray200;
  };

  const getRingStyle = () => {
    if (!isFocused || Platform.OS !== 'web') return {};
    return {
      boxShadow: `0 0 0 3px ${error ? 'rgba(220, 38, 38, 0.2)' : success ? 'rgba(5, 150, 105, 0.2)' : Colors.focusRing}`,
    };
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text 
          style={{ fontSize: 14, fontWeight: '500', color: Colors.textHeading, marginBottom: 8, lineHeight: 21 }}
        >
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        <TextInput
          accessible={true}
          accessibilityLabel={label || props.placeholder}
          accessibilityState={{ 
            disabled: props.editable === false,
          }}
          style={[
            {
              borderRadius: 8,
              height: 48, // Touch-friendly 48px height
              borderWidth: 2,
              borderColor: getBorderColor(),
              paddingHorizontal: 16,
              color: Colors.text,
              backgroundColor: Colors.white,
              lineHeight: 24,
              fontSize: 16,
              ...Platform.select({
                web: { outlineStyle: 'none' as any },
              }),
            },
            Platform.OS === 'web' && {
              transition: 'all 0.2s ease',
              ...getRingStyle(),
            } as any,
          ]}
          placeholderTextColor={Colors.textLight}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {/* Success Icon */}
        {success && !error && (
          <View
            style={{
              position: 'absolute',
              right: 12,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: Colors.success,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: Colors.white, fontSize: 12, fontWeight: 'bold' }}>✓</Text>
            </View>
          </View>
        )}
        {/* Error Icon */}
        {error && (
          <View
            style={{
              position: 'absolute',
              right: 12,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: Colors.error,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: Colors.white, fontSize: 14, fontWeight: 'bold' }}>!</Text>
            </View>
          </View>
        )}
      </View>
      {/* Error Message */}
      {error && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ fontSize: 14, color: Colors.error, lineHeight: 21 }}>
            {error}
          </Text>
        </View>
      )}
      {/* Helper Text */}
      {helperText && !error && (
        <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 6, lineHeight: 21 }}>
          {helperText}
        </Text>
      )}
    </View>
  );
}
