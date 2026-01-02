import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

interface Column {
  key: string;
  label: string;
  width?: number;
  render?: (item: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowPress?: (item: any) => void;
}

export default function Table({ columns, data, onRowPress }: TableProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="border rounded-xl overflow-hidden" style={{ borderColor: Colors.border }}>
        {/* Header */}
        <View className="flex-row bg-gray-50" style={{ backgroundColor: Colors.gray50 }}>
          {columns.map((col) => (
            <View
              key={col.key}
              className="px-4 py-3 border-b"
              style={{
                width: col.width || 150,
                borderBottomColor: Colors.border,
              }}
            >
              <Text className="font-semibold text-sm" style={{ color: Colors.gray700 }}>
                {col.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Body */}
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row border-b"
            style={{ borderBottomColor: Colors.border }}
            onPress={() => onRowPress?.(item)}
            disabled={!onRowPress}
          >
            {columns.map((col) => (
              <View
                key={col.key}
                className="px-4 py-3"
                style={{ width: col.width || 150 }}
              >
                {col.render ? (
                  col.render(item)
                ) : (
                  <Text className="text-sm" style={{ color: Colors.text }}>
                    {item[col.key]}
                  </Text>
                )}
              </View>
            ))}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
