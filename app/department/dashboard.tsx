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
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatCard[]>([
        {
            id: '1',
            title: 'Tổng sinh viên',
            value: '0',
            icon: 'people',
            color: '#3b82f6',
            trend: '',
        },
        {
            id: '2',
            title: 'Giảng viên',
            value: '0',
            icon: 'person',
            color: '#8b5cf6',
            trend: '',
        },
        {
            id: '3',
            title: 'Lớp học',
            value: '0',
            icon: 'school',
            color: '#ec4899',
            trend: '',
        },
        {
            id: '4',
            title: 'Khóa học',
            value: '0',
            icon: 'book',
            color: '#f59e0b',
            trend: '',
        },
    ]);
    // Fetch stats from API
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { statsService } = await import('@/apis/statsService');
            const data = await statsService.getDepartmentStats();
            console.log('📊 Stats data received:', data);
            // Update stats with real data
            setStats([
                {
                    id: '1',
                    title: 'Tổng sinh viên',
                    value: (data.totalStudents ?? 0).toLocaleString(),
                    icon: 'people',
                    color: '#3b82f6',
                    trend: data.studentTrend || '',
                },
                {
                    id: '2',
                    title: 'Giảng viên',
                    value: (data.totalTeachers ?? 0).toLocaleString(),
                    icon: 'person',
                    color: '#8b5cf6',
                    trend: data.teacherTrend || '',
                },
                {
                    id: '3',
                    title: 'Lớp học',
                    value: (data.totalClasses ?? 0).toLocaleString(),
                    icon: 'school',
                    color: '#ec4899',
                    trend: data.classTrend || '',
                },
                {
                    id: '4',
                    title: 'Khóa học',
                    value: (data.totalSubjects ?? 0).toLocaleString(),
                    icon: 'book',
                    color: '#f59e0b',
                    trend: data.subjectTrend || '',
                },
            ]);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Keep default values on error
        } finally {
            setLoading(false);
        }
    };

    // Responsive columns for stats grid
    const getStatsColumns = () => {
        if (width < 360) return 1; // Very small phones - 1 column
        if (width < 768) return 2; // Mobile - 2x2 grid
        return 4; // Tablet & Desktop - 1 row with 4 cards
    };

    const statsColumns = getStatsColumns();

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

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
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
                />
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
                <View style={styles.statsGrid}>
                    {stats.map((stat) => (
                        <View
                            key={stat.id}
                            style={[
                                styles.statCard,
                                {
                                    flex: statsColumns === 1 ? 1 : 0,
                                    flexBasis: statsColumns === 1 ? '100%' : `${(100 / statsColumns) - 2}%`,
                                    minWidth: statsColumns === 1 ? undefined : 150,
                                }
                            ]}
                        >
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
        gap: 12,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 4,
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
