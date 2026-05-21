import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials?: string;
    color?: string;
  };
  action: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  maxHeight?: number;
}

/**
 * Activity timeline with avatars
 * - User avatars with initials fallback
 * - Vertical timeline with connecting lines
 * - Relative timestamps
 * - Scrollable container
 */
export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ items, maxHeight }) => {
  return (
    <ScrollView
      style={{
        maxHeight: maxHeight || 400,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingVertical: 8 }}>
        {items.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </View>
    </ScrollView>
  );
};

interface TimelineItemProps {
  item: ActivityItem;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, isLast }) => {
  return (
    <View style={{ flexDirection: 'row', paddingBottom: isLast ? 0 : 20 }}>
      {/* Avatar and Timeline Line */}
      <View style={{ alignItems: 'center', marginRight: 12 }}>
        {/* Avatar */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: item.user.color || Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: Colors.white,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {item.user.avatar ? (
            <Text style={{ fontSize: 16 }}>{item.user.avatar}</Text>
          ) : (
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.white,
                letterSpacing: 0.5,
              }}
            >
              {item.user.initials || item.user.name.substring(0, 2).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Timeline Line */}
        {!isLast && (
          <View
            style={{
              width: 2,
              flex: 1,
              backgroundColor: Colors.gray200,
              marginTop: 8,
            }}
          />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingTop: 4 }}>
        {/* User and Action */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: Colors.textHeading,
              marginRight: 4,
            }}
          >
            {item.user.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.text,
              flex: 1,
            }}
          >
            {item.action}
          </Text>
        </View>

        {/* Description */}
        {item.description && (
          <Text
            style={{
              fontSize: 13,
              color: Colors.textSecondary,
              lineHeight: 19,
              marginBottom: 6,
            }}
          >
            {item.description}
          </Text>
        )}

        {/* Timestamp */}
        <Text
          style={{
            fontSize: 12,
            color: Colors.textLight,
            lineHeight: 18,
          }}
        >
          {item.timestamp}
        </Text>

        {/* Optional Icon */}
        {item.icon && (
          <View style={{ marginTop: 8 }}>
            {item.icon}
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Compact activity item for smaller displays
 */
interface CompactActivityItemProps {
  user: {
    name: string;
    avatar?: string;
    initials?: string;
    color?: string;
  };
  action: string;
  timestamp: string;
}

export const CompactActivityItem: React.FC<CompactActivityItemProps> = ({
  user,
  action,
  timestamp,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      {/* Small Avatar */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: user.color || Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {user.avatar ? (
          <Text style={{ fontSize: 14 }}>{user.avatar}</Text>
        ) : (
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: Colors.white,
            }}
          >
            {user.initials || user.name.substring(0, 2).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            color: Colors.text,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          <Text style={{ fontWeight: '600' }}>{user.name}</Text> {action}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: Colors.textLight,
          }}
        >
          {timestamp}
        </Text>
      </View>
    </View>
  );
};

export default ActivityTimeline;
