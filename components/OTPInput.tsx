import React, { useRef, useState } from 'react';
import { View, TextInput, Text, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  autoFocus = true,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-center" style={{ gap: 12 }}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref;
          }}
          value={otp[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          className="
            w-12
            h-14
            border-2
            border-gray-300
            rounded-xl
            text-center
            text-2xl
            font-semibold
            text-gray-900
            bg-white
          "
          style={{
            borderColor: otp[index] ? Colors.primary : Colors.gray300,
            ...Platform.select({
              web: {
                outlineStyle: 'none',
              },
            }),
          }}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

