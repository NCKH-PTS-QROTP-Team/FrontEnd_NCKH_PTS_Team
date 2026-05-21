import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Optional: display label like "Trang 1 / 5" */
  label?: string;
}

/**
 * Shared pagination control for lists.
 * Used across students, teachers, classes, schedules, etc.
 */
export default function Pagination({
  page,
  totalPages,
  onPageChange,
  label,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          page === 1 && styles.buttonDisabled,
        ]}
        disabled={page === 1}
        onPress={() => onPageChange(page - 1)}
      >
        <Text
          style={[
            styles.buttonText,
            { color: page === 1 ? '#cbd5e1' : '#3b82f6' },
          ]}
        >
          {"<"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>
        {label || `Trang ${page} / ${totalPages}`}
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          page === totalPages && styles.buttonDisabled,
        ]}
        disabled={page === totalPages}
        onPress={() => onPageChange(page + 1)}
      >
        <Text
          style={[
            styles.buttonText,
            { color: page === totalPages ? '#cbd5e1' : '#3b82f6' },
          ]}
        >
          {">"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#f8fafc',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
});
