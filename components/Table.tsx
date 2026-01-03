import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../constants/colors';

interface Column {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (item: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowPress?: (item: any) => void;
  stickyHeader?: boolean;
  zebraStriping?: boolean;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
}

export default function Table({ 
  columns, 
  data, 
  onRowPress,
  stickyHeader = true,
  zebraStriping = true,
  emptyState
}: TableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Empty state
  if (data.length === 0 && emptyState) {
    return (
      <View 
        className="border bg-white rounded-lg"
        style={{ 
          borderColor: Colors.gray200,
          padding: 48,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {emptyState.icon && (
          <View style={{ marginBottom: 16 }}>
            {emptyState.icon}
          </View>
        )}
        <Text 
          className="text-xl font-semibold mb-2" 
          style={{ color: Colors.text, lineHeight: 32, textAlign: 'center' }}
        >
          {emptyState.title}
        </Text>
        <Text 
          className="text-base" 
          style={{ color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
        >
          {emptyState.description}
        </Text>
      </View>
    );
  }

  const getAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'center';
      case 'right': return 'flex-end';
      default: return 'flex-start';
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View 
        className="border overflow-hidden bg-white" 
        style={{ 
          borderRadius: 8, 
          borderColor: Colors.gray200,
          minWidth: '100%',
        }}
      >
        {/* Header */}
        <View 
          className="flex-row bg-gray-50" 
          style={[
            { 
              backgroundColor: Colors.gray50,
              borderBottomWidth: 2,
              borderBottomColor: Colors.gray200,
            },
            stickyHeader && Platform.OS === 'web' && {
              position: 'sticky' as any,
              top: 0,
              zIndex: 10,
            },
          ]}
        >
          {columns.map((col) => (
            <View
              key={col.key}
              className="px-4"
              style={{
                width: col.width || 150,
                paddingVertical: 12,
                justifyContent: 'center',
              }}
            >
              <Text 
                className="font-semibold text-sm" 
                style={{ 
                  color: Colors.gray700,
                  lineHeight: 21,
                  textAlign: col.align || 'left',
                }}
              >
                {col.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Body */}
        {data.map((item, index) => {
          const isHovered = hoveredRow === index;
          const isEven = index % 2 === 0;
          
          return (
            <TouchableOpacity
              key={index}
              className="flex-row"
              style={[
                {
                  borderBottomWidth: index === data.length - 1 ? 0 : 1,
                  borderBottomColor: Colors.gray100,
                  backgroundColor: isHovered 
                    ? Colors.gray50 
                    : (zebraStriping && isEven ? 'rgba(249, 250, 251, 0.5)' : Colors.white),
                },
                Platform.OS === 'web' && {
                  transition: 'background-color 0.15s ease',
                  cursor: onRowPress ? 'pointer' : 'default',
                } as any,
              ]}
              onPress={() => onRowPress?.(item)}
              disabled={!onRowPress}
              activeOpacity={onRowPress ? 0.7 : 1}
              {...(Platform.OS === 'web' && {
                onMouseEnter: () => setHoveredRow(index),
                onMouseLeave: () => setHoveredRow(null),
              } as any)}
            >
              {columns.map((col) => (
                <View
                  key={col.key}
                  className="px-4"
                  style={{
                    width: col.width || 150,
                    paddingVertical: 12,
                    justifyContent: 'center',
                    alignItems: getAlignment(col.align),
                  }}
                >
                  {col.render ? (
                    col.render(item)
                  ) : (
                    <Text 
                      className="text-sm" 
                      style={{ 
                        color: Colors.text,
                        lineHeight: 21,
                        textAlign: col.align || 'left',
                      }}
                    >
                      {item[col.key]}
                    </Text>
                  )}
                </View>
              ))}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
