import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Avatar } from './Avatar';

interface UserProfileDropdownProps {
  userName: string;
  userAvatar?: string;
  userRole?: 'student' | 'teacher' | 'admin';
  userEmail?: string;
}

export default function UserProfileDropdown({ 
  userName, 
  userAvatar, 
  userRole = 'student',
  userEmail 
}: UserProfileDropdownProps) {
  return (
    <View style={{ position: 'relative' }}>
      {/* User Profile Display (no dropdown) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          minHeight: 44,
        }}
      >
        {/* Avatar */}
        <Avatar 
          name={userName}
          src={userAvatar}
          size="small"
          bordered
        />
        
        {/* User Name */}
        <Text 
          style={{ 
            marginLeft: 10,
            fontSize: 14,
            fontWeight: '600',
            color: '#111827',
            maxWidth: 150,
          }}
          numberOfLines={1}
        >
          {userName}
        </Text>
      </View>
    </View>
  );
}
