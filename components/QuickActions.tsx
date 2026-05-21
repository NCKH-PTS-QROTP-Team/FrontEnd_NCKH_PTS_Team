import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { ResponsiveSpacing } from '@/utils/responsive';

interface QuickAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  color?: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
}

/**
 * Quick actions grid with large touch targets
 * - Minimum 44px touch target height
 * - Large icons (32x32)
 * - Responsive column count
 * - Hover effects on web
 */
export const QuickActions: React.FC<QuickActionsProps> = ({ actions, columns = 4 }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
      }}
    >
      {actions.map((action) => (
        <View
          key={action.key}
          style={{
            width: `${100 / columns}%`,
            paddingHorizontal: 8,
            marginBottom: 16,
          }}
        >
          <QuickActionItem action={action} />
        </View>
      ))}
    </View>
  );
};

interface QuickActionItemProps {
  action: QuickAction;
}

const QuickActionItem: React.FC<QuickActionItemProps> = ({ action }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <TouchableOpacity
      onPress={action.onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={{
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        minHeight: ResponsiveSpacing.minTouchTarget + 20, // Extra padding for comfort
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        transform: [{ scale: isPressed ? 0.95 : 1 }],
        ...(Platform.OS === 'web' && {
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        } as any),
        ...(isHovered && {
          backgroundColor: action.color ? action.color + '05' : Colors.gray50,
          borderColor: action.color || Colors.primary,
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }),
      }}
      {...(Platform.OS === 'web' && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } as any)}
    >
      {/* Icon */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: (action.color || Colors.primary) + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        {action.icon}
      </View>

      {/* Label */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: Colors.textHeading,
          textAlign: 'center',
          lineHeight: 18,
          letterSpacing: -0.01,
        }}
      >
        {action.label}
      </Text>
    </TouchableOpacity>
  );
};

export default QuickActions;
