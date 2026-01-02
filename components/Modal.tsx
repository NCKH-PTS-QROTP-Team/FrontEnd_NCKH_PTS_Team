import React from 'react';
import { View, Text, Modal as RNModal, TouchableOpacity, Pressable } from 'react-native';
import { Colors } from '../constants/colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ visible, onClose, title, children, width = 500 }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-center items-center p-4"
        onPress={onClose}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <Pressable 
          className="bg-white rounded-2xl p-6 shadow-lg"
          style={{ width: '100%', maxWidth: width }}
          onPress={(e) => e.stopPropagation()}
        >
          {title && (
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b" style={{ borderBottomColor: Colors.border }}>
              <Text className="text-xl font-semibold" style={{ color: Colors.text }}>
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Text style={{ color: Colors.gray500, fontSize: 24 }}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
