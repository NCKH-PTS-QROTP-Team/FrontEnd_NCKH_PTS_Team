import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { mockSchedules } from '@/constants/mockData';
import WeeklySchedule from '@/components/WeeklySchedule';

export default function StudentHomeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const todaySchedules = mockSchedules.filter(s => s.status !== 'completed');
  const isWeb = Platform.OS === 'web';

  // Responsive breakpoints - Dynamic based on window size
  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;


  // Responsive values - Match Figma exactly
  const contentMaxWidth = isDesktop ? 800 : windowWidth - 40;
  const padding = isMobile ? 20 : isTablet ? 20 : 0;
  
  // Quick action cards: Desktop 384px each with 32px gap
  const quickActionWidth = isDesktop ? 384 : '100%';
  const quickActionGap = isDesktop ? 32 : 16;
  
  // Stats cards: Desktop 256px each with 16px gap
  const statsWidth = isDesktop ? 256 : isTablet ? (contentMaxWidth - 16) / 2 : '100%';
  const statsGap = isDesktop ? 16 : 12;

  const content = (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar style="dark" />
      
      <ScrollView
        contentContainerStyle={{ 
          paddingTop: isDesktop ? 20 : 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Content with padding */}
        <View style={{ 
          maxWidth: contentMaxWidth, 
          width: '100%', 
          alignSelf: 'center',
          paddingHorizontal: padding,
        }}>
          {/* Welcome Card - Figma: 800x160px, borderRadius 16, padding 24 */}
          <View
            style={{
              width: '100%',
              minHeight: 160,
              backgroundColor: '#3FA9F5',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: 24, 
              fontWeight: 'bold', 
              lineHeight: 32,
              marginBottom: 8 
            }}>
              Xin chào!
            </Text>
            <Text style={{ 
              color: '#DBEAFE', 
              fontSize: 16,
              lineHeight: 24,
              marginBottom: 16 
            }}>
              Hôm nay bạn có {todaySchedules.length} buổi học
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/student/schedule')}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                width: 140,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: '#3FA9F5',
                lineHeight: 21 
              }}>
                Xem lịch học →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions - Figma: Title + 2 cards (384x160 each, gap 32) */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#111827',
              lineHeight: 28,
              marginBottom: 16 
            }}>
              Điểm danh nhanh
            </Text>
            <View style={{ 
              flexDirection: isDesktop ? 'row' : 'column',
            }}>
              {/* OTP Card */}
              <TouchableOpacity
                onPress={() => router.push('/student/otp-attendance')}
                style={{
                  width: quickActionWidth,
                  minHeight: 160,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: '#DBEAFE',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                  marginRight: isDesktop ? quickActionGap : 0,
                  marginBottom: isDesktop ? 0 : quickActionGap,
                }}
                activeOpacity={0.7}
              >
                <View style={{ 
                  backgroundColor: '#DBEAFE', 
                  borderRadius: 12, 
                  width: 48, 
                  height: 48, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: 12 
                }}>
                  <Text style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold', 
                    color: '#3FA9F5',
                    lineHeight: 32 
                  }}>OTP</Text>
                </View>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold', 
                  color: '#111827',
                  lineHeight: 24,
                  marginBottom: 4 
                }}>
                  Mã OTP
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#6B7280',
                  lineHeight: 21 
                }}>
                  Nhập mã từ giảng viên
                </Text>
              </TouchableOpacity>

              {/* QR Card */}
              <TouchableOpacity
                onPress={() => router.push('/student/qr-attendance')}
                style={{
                  width: quickActionWidth,
                  minHeight: 160,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: '#D1FAE5',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
              >
                <View style={{ 
                  backgroundColor: '#D1FAE5', 
                  borderRadius: 12, 
                  width: 48, 
                  height: 48, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: 12 
                }}>
                  <Text style={{ 
                    fontSize: 22, 
                    fontWeight: 'bold', 
                    color: '#10B981',
                    lineHeight: 28 
                  }}>QR</Text>
                </View>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold', 
                  color: '#111827',
                  lineHeight: 24,
                  marginBottom: 4 
                }}>
                  QR Code
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#6B7280',
                  lineHeight: 21 
                }}>
                  Quét mã trên lớp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Weekly Schedule Table - Full width without padding */}
        <View style={{ 
          width: '100%',
          paddingHorizontal: isDesktop ? 24 : padding,
          marginBottom: 40,
        }}>
          <WeeklySchedule />
        </View>

        {/* Content with padding continues */}
        <View style={{ 
          maxWidth: contentMaxWidth, 
          width: '100%', 
          alignSelf: 'center',
          paddingHorizontal: padding,
        }}>
          {/* Stats - Figma: Title + 3 cards (256x120 each, gap 16) */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#111827',
              lineHeight: 28,
              marginBottom: 16 
            }}>
              Thống kê tuần này
            </Text>
            <View style={{ 
              flexDirection: isDesktop ? 'row' : isTablet ? 'row' : 'column',
              flexWrap: isTablet && !isDesktop ? 'wrap' : 'nowrap',
            }}>
              {/* Tổng buổi */}
              <View style={{
                width: statsWidth,
                height: 120,
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                padding: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                marginRight: isDesktop ? statsGap : (isTablet ? statsGap : 0),
                marginBottom: isDesktop ? 0 : (isTablet ? statsGap : statsGap),
              }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#6B7280',
                  lineHeight: 21,
                  marginBottom: 8 
                }}>Tổng buổi</Text>
                <Text style={{ 
                  fontSize: 36, 
                  fontWeight: '600', 
                  color: '#3FA9F5',
                  lineHeight: 40 
                }}>12</Text>
              </View>

              {/* Có mặt */}
              <View style={{
                width: statsWidth,
                height: 120,
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                padding: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                marginRight: isDesktop ? statsGap : (isTablet ? statsGap : 0),
                marginBottom: isDesktop ? 0 : (isTablet ? statsGap : statsGap),
              }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#6B7280',
                  lineHeight: 21,
                  marginBottom: 8 
                }}>Có mặt</Text>
                <Text style={{ 
                  fontSize: 36, 
                  fontWeight: '600', 
                  color: '#10B981',
                  lineHeight: 40 
                }}>10</Text>
              </View>

              {/* Đi muộn */}
              <View style={{
                width: statsWidth,
                height: 120,
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                padding: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                marginBottom: isDesktop ? 0 : statsGap,
              }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#6B7280',
                  lineHeight: 21,
                  marginBottom: 8 
                }}>Đi muộn</Text>
                <Text style={{ 
                  fontSize: 36, 
                  fontWeight: '600', 
                  color: '#F59E0B',
                  lineHeight: 40 
                }}>2</Text>
              </View>
            </View>
          </View>

          {/* Today's Schedule - Figma: Title + View All + Cards (800x120 each) */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 16 
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: '#111827',
                lineHeight: 28 
              }}>
                Lịch học hôm nay
              </Text>
              <TouchableOpacity onPress={() => router.push('/student/schedule')}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600', 
                  color: '#3FA9F5',
                  lineHeight: 21 
                }}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {todaySchedules.length > 0 ? (
              <View>
                {todaySchedules.slice(0, 2).map((schedule, index) => (
                  <TouchableOpacity
                    key={schedule.id}
                    onPress={() => router.push('/student/otp-attendance')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      padding: 24,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      minHeight: 120,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                      marginBottom: index < todaySchedules.slice(0, 2).length - 1 ? 16 : 0,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: '600', 
                      color: '#111827',
                      lineHeight: 28,
                      marginBottom: 4 
                    }}>
                      {schedule.courseName || ''}
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      color: '#6B7280',
                      lineHeight: 21,
                      marginBottom: 12 
                    }}>
                      {schedule.teacher || ''}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ 
                        width: 2, 
                        height: 24, 
                        backgroundColor: '#3FA9F5',
                        borderRadius: 1,
                        marginRight: 12 
                      }} />
                      <View>
                        <Text style={{ 
                          fontSize: 16, 
                          color: '#111827',
                          lineHeight: 24,
                          marginBottom: 4 
                        }}>
                          {schedule.time || ''}
                        </Text>
                        <Text style={{ 
                          fontSize: 14, 
                          color: '#6B7280',
                          lineHeight: 21 
                        }}>
                          Phòng: {schedule.room || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}>
                <View style={{ 
                  width: 60, 
                  height: 60, 
                  backgroundColor: '#F3F4F6', 
                  borderRadius: 12, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: 12 
                }}>
                  <Text style={{ fontSize: 28, color: '#6B7280' }}>☰</Text>
                </View>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#6B7280',
                  lineHeight: 21 
                }}>
                  Không có lịch học hôm nay
                </Text>
              </View>
            )}
          </View>

          {/* History Link - Figma: 800x64 card */}
          <TouchableOpacity
            onPress={() => router.push('/student/history')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 64,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: '#F3F4F6', 
                borderRadius: 12, 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: 12 
              }}>
                <Text style={{ fontSize: 18, color: '#6B7280' }}>☰</Text>
              </View>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: '#111827',
                lineHeight: 24 
              }}>
                Lịch sử điểm danh
              </Text>
            </View>
            <Text style={{ fontSize: 20, color: '#9CA3AF' }}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  return content;
}