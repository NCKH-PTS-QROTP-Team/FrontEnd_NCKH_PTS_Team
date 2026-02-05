import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function ReportsManagement() {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

    const chartConfig = {
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#3b82f6',
        },
    };

    const attendanceData = {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        datasets: [
            {
                data: [85, 92, 88, 95, 90, 87],
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                strokeWidth: 3,
            },
        ],
    };

    const enrollmentData = {
        labels: ['CNTT', 'KTPM', 'HTTT', 'KHMT', 'MMT'],
        datasets: [
            {
                data: [450, 380, 320, 290, 260],
            },
        ],
    };

    const statusDistribution = [
        {
            name: 'Đang học',
            population: 1234,
            color: '#10b981',
            legendFontColor: '#64748b',
            legendFontSize: 14,
        },
        {
            name: 'Tạm nghỉ',
            population: 45,
            color: '#f59e0b',
            legendFontColor: '#64748b',
            legendFontSize: 14,
        },
        {
            name: 'Đã tốt nghiệp',
            population: 890,
            color: '#6366f1',
            legendFontColor: '#64748b',
            legendFontSize: 14,
        },
    ];

    const stats = [
        {
            id: '1',
            title: 'Tỷ lệ điểm danh',
            value: '89.5%',
            icon: 'checkmark-circle' as const,
            color: '#10b981',
            trend: '+2.3%',
        },
        {
            id: '2',
            title: 'Tỷ lệ đỗ',
            value: '92.1%',
            icon: 'trophy' as const,
            color: '#f59e0b',
            trend: '+1.5%',
        },
        {
            id: '3',
            title: 'Điểm TB',
            value: '7.8',
            icon: 'star' as const,
            color: '#3b82f6',
            trend: '+0.2',
        },
        {
            id: '4',
            title: 'Tỷ lệ bỏ học',
            value: '3.2%',
            icon: 'alert-circle' as const,
            color: '#ef4444',
            trend: '-0.5%',
        },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Period Selector */}
            <View style={styles.periodContainer}>
                <Text style={styles.sectionTitle}>Báo cáo & Thống kê</Text>
                <View style={styles.periodSelector}>
                    {(['week', 'month', 'year'] as const).map((period) => (
                        <TouchableOpacity
                            key={period}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period && styles.periodButtonActive,
                            ]}
                            onPress={() => setSelectedPeriod(period)}
                        >
                            <Text
                                style={[
                                    styles.periodText,
                                    selectedPeriod === period && styles.periodTextActive,
                                ]}
                            >
                                {period === 'week' ? 'Tuần' : period === 'month' ? 'Tháng' : 'Năm'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Key Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statsGrid}>
                    {stats.map((stat) => (
                        <View key={stat.id} style={styles.statCard}>
                            <View
                                style={[
                                    styles.statIconContainer,
                                    { backgroundColor: stat.color + '20' },
                                ]}
                            >
                                <Ionicons name={stat.icon} size={24} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                            <View style={styles.trendContainer}>
                                <Ionicons
                                    name={stat.trend.startsWith('+') ? 'trending-up' : 'trending-down'}
                                    size={14}
                                    color={stat.trend.startsWith('+') ? '#10b981' : '#ef4444'}
                                />
                                <Text
                                    style={[
                                        styles.trendText,
                                        {
                                            color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444',
                                        },
                                    ]}
                                >
                                    {stat.trend}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Attendance Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Tỷ lệ điểm danh theo ngày</Text>
                <LineChart
                    data={attendanceData}
                    width={width - 48}
                    height={220}
                    chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                    }}
                    bezier
                    style={styles.chart}
                />
            </View>

            {/* Enrollment Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Số lượng sinh viên theo ngành</Text>
                <BarChart
                    data={enrollmentData}
                    width={width - 48}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    yAxisLabel=""
                    yAxisSuffix=""
                    showValuesOnTopOfBars
                />
            </View>

            {/* Status Distribution */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Phân bố trạng thái sinh viên</Text>
                <PieChart
                    data={statusDistribution}
                    width={width - 48}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    style={styles.chart}
                />
            </View>

            {/* Quick Reports */}
            <View style={styles.reportsContainer}>
                <Text style={styles.sectionTitle}>Báo cáo nhanh</Text>
                <TouchableOpacity style={styles.reportCard}>
                    <View style={styles.reportIcon}>
                        <Ionicons name="document-text" size={24} color="#3b82f6" />
                    </View>
                    <View style={styles.reportInfo}>
                        <Text style={styles.reportTitle}>Báo cáo điểm danh</Text>
                        <Text style={styles.reportSubtitle}>
                            Tổng hợp điểm danh theo lớp, môn học
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.reportCard}>
                    <View style={styles.reportIcon}>
                        <Ionicons name="stats-chart" size={24} color="#10b981" />
                    </View>
                    <View style={styles.reportInfo}>
                        <Text style={styles.reportTitle}>Báo cáo kết quả học tập</Text>
                        <Text style={styles.reportSubtitle}>
                            Điểm số, xếp loại, tỷ lệ đỗ
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.reportCard}>
                    <View style={styles.reportIcon}>
                        <Ionicons name="people" size={24} color="#8b5cf6" />
                    </View>
                    <View style={styles.reportInfo}>
                        <Text style={styles.reportTitle}>Báo cáo sinh viên</Text>
                        <Text style={styles.reportSubtitle}>
                            Thông tin, trạng thái sinh viên
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.reportCard}>
                    <View style={styles.reportIcon}>
                        <Ionicons name="school" size={24} color="#f59e0b" />
                    </View>
                    <View style={styles.reportInfo}>
                        <Text style={styles.reportTitle}>Báo cáo giảng viên</Text>
                        <Text style={styles.reportSubtitle}>
                            Lịch dạy, số lượng lớp, đánh giá
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    periodContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: '#3b82f6',
    },
    periodText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    periodTextActive: {
        color: '#fff',
    },
    statsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: (width - 60) / 2,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
    },
    chartContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 12,
    },
    reportsContainer: {
        padding: 20,
        paddingTop: 0,
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    reportIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reportInfo: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    reportSubtitle: {
        fontSize: 13,
        color: '#64748b',
    },
});
