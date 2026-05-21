import React from 'react';
import { View, Text, Image, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface AvatarProps {
  /**
   * User's name for generating initials
   */
  name: string;
  
  /**
   * Optional image source URL
   */
  src?: string;
  
  /**
   * Custom initials (overrides auto-generated from name)
   */
  initials?: string;
  
  /**
   * Size of the avatar
   * @default 'medium'
   */
  size?: AvatarSize | number;
  
  /**
   * Background color
   * If not provided, will use a color based on the name
   */
  color?: string;
  
  /**
   * Custom style for container
   */
  style?: ViewStyle;
  
  /**
   * Whether to show border
   * @default false
   */
  bordered?: boolean;
}

const sizeMap: Record<AvatarSize, number> = {
  small: 32,
  medium: 40,
  large: 48,
  xlarge: 64,
};

const fontSizeMap: Record<AvatarSize, number> = {
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 20,
};

/**
 * Generate a color from a string (deterministic)
 */
function getColorFromString(str: string): string {
  const colors = [
    Colors.primary,
    Colors.success,
    Colors.warning,
    Colors.info,
    Colors.error,
    '#9333EA', // purple
    '#EC4899', // pink
    '#F59E0B', // amber
    '#10B981', // emerald
    '#3B82F6', // blue
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Generate initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar component with image or initials fallback
 * 
 * @example
 * // With initials
 * <Avatar name="Nguyễn Văn A" />
 * 
 * // With image
 * <Avatar name="Nguyễn Văn A" src="https://..." />
 * 
 * // Custom size and color
 * <Avatar name="Nguyễn Văn A" size="large" color={Colors.primary} />
 * 
 * // With border
 * <Avatar name="Nguyễn Văn A" bordered />
 * 
 * // Custom numeric size
 * <Avatar name="Nguyễn Văn A" size={56} />
 */
export function Avatar({
  name,
  src,
  initials,
  size = 'medium',
  color,
  style,
  bordered = false,
}: AvatarProps) {
  const avatarSize = typeof size === 'number' ? size : sizeMap[size];
  const fontSize = typeof size === 'number' ? avatarSize * 0.35 : fontSizeMap[size];
  const backgroundColor = color || getColorFromString(name);
  const displayInitials = initials || getInitials(name);

  const containerStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: bordered ? 3 : 0,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    ...style,
  };

  const textStyles: TextStyle = {
    fontSize,
    fontWeight: '600',
    color: Colors.white,
  };

  return (
    <View style={containerStyle}>
      {src ? (
        <Image
          source={{ uri: src }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <Text style={textStyles}>{displayInitials}</Text>
      )}
    </View>
  );
}

/**
 * Avatar group component for displaying multiple avatars
 * 
 * @example
 * <AvatarGroup maxVisible={3}>
 *   <Avatar name="User 1" />
 *   <Avatar name="User 2" />
 *   <Avatar name="User 3" />
 *   <Avatar name="User 4" />
 * </AvatarGroup>
 */
export function AvatarGroup({
  children,
  maxVisible = 5,
  size = 'medium',
  style,
}: {
  children: React.ReactElement<AvatarProps>[];
  maxVisible?: number;
  size?: AvatarSize;
  style?: ViewStyle;
}) {
  const avatarSize = sizeMap[size];
  const avatars = React.Children.toArray(children) as React.ReactElement<AvatarProps>[];
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = Math.max(0, avatars.length - maxVisible);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', ...style }}>
      {visibleAvatars.map((avatar, index) => (
        <View
          key={index}
          style={{
            marginLeft: index === 0 ? 0 : -avatarSize * 0.3,
            zIndex: visibleAvatars.length - index,
          }}
        >
          {React.cloneElement(avatar, {
            size,
            bordered: true,
          })}
        </View>
      ))}
      {remainingCount > 0 && (
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            backgroundColor: Colors.text + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -avatarSize * 0.3,
            borderWidth: 3,
            borderColor: Colors.white,
            zIndex: 0,
          }}
        >
          <Text
            style={{
              fontSize: fontSizeMap[size],
              fontWeight: '600',
              color: Colors.text,
            }}
          >
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
}
