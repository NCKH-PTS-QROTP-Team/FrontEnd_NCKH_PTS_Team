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

interface DataTableProps {
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

export default function DataTable({ 
  columns, 
  data, 
  onRowPress,
  stickyHeader = true,
  zebraStriping = true,
  emptyState
}: DataTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Empty state
  if (data.length === 0 && emptyState) {
    return (
      <View 
        style={{ 
          borderWidth: 1,
          borderColor: Colors.gray200,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
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
          style={{ fontSize: 20, fontWeight: '600', marginBottom: 8, color: Colors.text, lineHeight: 32, textAlign: 'center' }}
        >
          {emptyState.title}
        </Text>
        <Text 
          style={{ fontSize: 16, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center', maxWidth: 400 }}
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
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={{ marginHorizontal: -1 }}
      contentContainerStyle={{ minWidth: '100%' }}
    >
      <View 
        style={{ 
          borderWidth: 1,
          borderColor: Colors.gray200,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          width: 'max-content',
          ...(Platform.OS === 'web' && {
            minWidth: '100%',
          } as any),
        }}
      >
        {/* Header */}
        <View 
          style={[
            { 
              flexDirection: 'row',
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
              style={{
                width: col.width || 150,
                paddingVertical: 14,
                paddingHorizontal: 16,
                justifyContent: 'center',
                borderRightWidth: col.key !== columns[columns.length - 1].key ? 1 : 0,
                borderRightColor: Colors.gray200,
              }}
            >
              <Text 
                style={{ 
                  fontWeight: '600',
                  fontSize: 13,
                  color: Colors.gray700,
                  lineHeight: 20,
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
              style={[
                {
                  flexDirection: 'row',
                  borderBottomWidth: index === data.length - 1 ? 0 : 1,
                  borderBottomColor: Colors.gray100,
                  backgroundColor: isHovered 
                    ? Colors.gray50 
                    : (zebraStriping && isEven ? 'rgba(249, 250, 251, 0.5)' : '#FFFFFF'),
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
              {columns.map((col, colIndex) => (
                <View
                  key={col.key}
                  style={{
                    width: col.width || 150,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                    alignItems: getAlignment(col.align),
                    borderRightWidth: colIndex !== columns.length - 1 ? 1 : 0,
                    borderRightColor: Colors.gray100,
                  }}
                >
                  {col.render ? (
                    col.render(item)
                  ) : (
                    <Text 
                      style={{ 
                        fontSize: 14,
                        color: Colors.text,
                        lineHeight: 20,
                        textAlign: col.align || 'left',
                      }}
                    >
                      {item[col.key] || '-'}
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

