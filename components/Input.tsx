import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Colors } from '../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium mb-2" style={{ color: Colors.gray700 }}>
          {label}
        </Text>
      )}
      <TextInput
        className="border rounded-xl px-4 py-3 text-base"
        style={{
          borderColor: error ? Colors.error : Colors.border,
          color: Colors.text,
        }}
        placeholderTextColor={Colors.gray400}
        {...props}
      />
      {error && (
        <Text className="text-sm mt-1" style={{ color: Colors.error }}>
          {error}
        </Text>
      )}
    </View>
  );
}
