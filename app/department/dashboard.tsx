import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
    Image,
    ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface StatCard {
    id: string;
    title: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    trend?: string;
}

interface QuickAction {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    color: string;
}

export default function DepartmentDashboard() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [stats, setStats] = useState<StatCard[]>([
        {
            id: '1',
            title: 'Tổng sinh viên',
            value: '1,234',
            icon: 'people',
            color: '#3b82f6',
            trend: '+12%',
        },
        {
            id: '2',
            title: 'Giảng viên',
            value: '89',
            icon: 'person',
            color: '#8b5cf6',
            trend: '+5%',
        },
        {
            id: '3',
            title: 'Lớp học',
            value: '45',
            icon: 'school',
            color: '#ec4899',
            trend: '+8%',
        },
        {
            id: '4',
            title: 'Khóa học',
            value: '156',
            icon: 'book',
            color: '#f59e0b',
            trend: '+15%',
        },
    ]);

    // Get greeting based on time
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Chào buổi sáng');
        } else if (hour < 18) {
            setGreeting('Chào buổi chiều');
        } else {
            setGreeting('Chào buổi tối');
        }
    }, []);

    const quickActions: QuickAction[] = [
        {
            id: '1',
            title: 'Quản lý sinh viên',
            icon: 'people-outline',
            route: '/department/students',
            color: '#3b82f6',
        },
        {
            id: '2',
            title: 'Quản lý giảng viên',
            icon: 'person-outline',
            route: '/department/teachers',
            color: '#8b5cf6',
        },
        {
            id: '3',
            title: 'Quản lý lớp học',
            icon: 'school-outline',
            route: '/department/classes',
            color: '#ec4899',
        },
        {
            id: '4',
            title: 'Quản lý khóa học',
            icon: 'book-outline',
            route: '/department/courses',
            color: '#f59e0b',
        },
        {
            id: '5',
            title: 'Lịch học',
            icon: 'calendar-outline',
            route: '/department/schedules',
            color: '#10b981',
        },
        {
            id: '6',
            title: 'Báo cáo',
            icon: 'stats-chart-outline',
            route: '/department/reports',
            color: '#06b6d4',
        },
    ];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Banner Header */}
            <View style={styles.bannerWrapper}>
                <ImageBackground
                    source={require('@/assets/department_banner.png')}
                    style={styles.bannerContainer}
                    imageStyle={styles.bannerImage}
                    resizeMode="contain"
                >
                    <View style={styles.bannerOverlay}>
                        <Text style={styles.greetingText}>{greeting} 👋</Text>
                    </View>
                </ImageBackground>
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
                <View style={styles.statsGrid}>
                    {stats.map((stat) => (
                        <View key={stat.id} style={styles.statCard}>
                            <View
                                style={[
                                    styles.statIconContainer,
                                    { backgroundColor: stat.color + '20' },
                                ]}
                            >
                                <Ionicons name={stat.icon} size={28} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                            {stat.trend && (
                                <View style={styles.trendContainer}>
                                    <Ionicons
                                        name="trending-up"
                                        size={14}
                                        color="#10b981"
                                    />
                                    <Text style={styles.trendText}>{stat.trend}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Chức năng chính</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.actionCard}
                            onPress={() => router.push(action.route as any)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.actionIconContainer,
                                    { backgroundColor: action.color + '15' },
                                ]}
                            >
                                <Ionicons
                                    name={action.icon}
                                    size={32}
                                    color={action.color}
                                />
                            </View>
                            <Text style={styles.actionTitle}>{action.title}</Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#9ca3af"
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Recent Activities */}
            <View style={styles.activitiesContainer}>
                <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
                <View style={styles.activityCard}>
                    <View style={styles.activityItem}>
                        <View style={[styles.activityDot, { backgroundColor: '#3b82f6' }]} />
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle}>
                                Thêm mới 15 sinh viên vào lớp CNTT-K18
                            </Text>
                            <Text style={styles.activityTime}>2 giờ trước</Text>
                        </View>
                    </View>
                    <View style={styles.activityItem}>
                        <View style={[styles.activityDot, { backgroundColor: '#8b5cf6' }]} />
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle}>
                                Cập nhật lịch giảng dạy cho GV Nguyễn Văn A
                            </Text>
                            <Text style={styles.activityTime}>5 giờ trước</Text>
                        </View>
                    </View>
                    <View style={styles.activityItem}>
                        <View style={[styles.activityDot, { backgroundColor: '#10b981' }]} />
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle}>
                                Tạo lịch học mới cho học kỳ 2
                            </Text>
                            <Text style={styles.activityTime}>1 ngày trước</Text>
                        </View>
                    </View>
                </View>
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
    bannerWrapper: {
        overflow: 'hidden',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 0,
    },
    bannerContainer: {
        height: 180,
        width: '100%',
    },
    bannerImage: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    bannerOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    bannerContent: {
        marginTop: 10,
    },
    greetingText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
    },
    bannerSubtitle: {
        fontSize: 15,
        color: '#e0e7ff',
    },
    statsContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
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
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
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
        color: '#10b981',
        fontWeight: '600',
    },
    actionsContainer: {
        padding: 20,
        paddingTop: 0,
    },
    actionsGrid: {
        gap: 12,
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    activitiesContainer: {
        padding: 20,
        paddingTop: 0,
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    activityItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        color: '#1e293b',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
