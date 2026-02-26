import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AttendanceMonitoringScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giám Sát Điểm Danh</Text>
            <Text style={styles.subtitle}>Theo dõi và kiểm tra các phiên điểm danh của lớp học</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
});
