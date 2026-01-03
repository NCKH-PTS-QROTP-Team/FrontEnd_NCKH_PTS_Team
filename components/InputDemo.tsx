import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Input from './Input';
import { Colors } from '../constants/colors';

export default function InputDemo() {
  const [normalValue, setNormalValue] = useState('');
  const [successValue, setSuccessValue] = useState('valid@email.com');
  const [errorValue, setErrorValue] = useState('invalid');
  const [focusValue, setFocusValue] = useState('');

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6" style={{ maxWidth: 600, width: '100%', alignSelf: 'center' }}>
        <Text className="text-3xl font-bold mb-2" style={{ color: Colors.text, lineHeight: 48 }}>
          Input Components
        </Text>
        <Text className="text-base mb-8" style={{ color: Colors.textSecondary, lineHeight: 24 }}>
          Modern input fields with validation states
        </Text>

        {/* Normal Input */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Normal State
          </Text>
          <Input
            label="Email"
            value={normalValue}
            onChangeText={setNormalValue}
            placeholder="Enter your email"
            helperText="We'll never share your email with anyone else"
            keyboardType="email-address"
          />
        </View>

        {/* Success State */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Success State
          </Text>
          <Input
            label="Email Address"
            value={successValue}
            onChangeText={setSuccessValue}
            placeholder="Enter your email"
            success={true}
            helperText="Email format is valid"
            keyboardType="email-address"
          />
        </View>

        {/* Error State */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Error State
          </Text>
          <Input
            label="Username"
            value={errorValue}
            onChangeText={setErrorValue}
            placeholder="Enter username"
            error="Username must be at least 6 characters"
          />
        </View>

        {/* Focus State */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Focus State (Click to see ring)
          </Text>
          <Input
            label="Full Name"
            value={focusValue}
            onChangeText={setFocusValue}
            placeholder="Enter your full name"
            helperText="Focus this input to see the ring effect"
          />
        </View>

        {/* Password Input */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Password Input
          </Text>
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            helperText="At least 8 characters with numbers and symbols"
          />
        </View>

        {/* Disabled Input */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Disabled State
          </Text>
          <Input
            label="Disabled Field"
            value="This field is disabled"
            editable={false}
            helperText="You cannot edit this field"
          />
        </View>

        {/* Specifications */}
        <View className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>
            Input Specifications
          </Text>
          <View className="space-y-2">
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Height: 48px (easy touch target)
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Focus: Ring effect with smooth transition
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Error: Red border + error icon + message
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Success: Green border + checkmark icon
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Placeholder: text-gray-400 (lighter)
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary, lineHeight: 21 }}>
              • Label spacing: 8px above input
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
