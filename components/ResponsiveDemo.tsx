import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { BottomNavigation, BottomNavigationSpacer } from './BottomNavigation';
import { ResponsiveGrid, ResponsiveContainer, ResponsiveStack, useScreenSize } from './ResponsiveLayout';
import { ScrollableTabs, PillTabs } from './ScrollableTabs';
import Modal from './Modal';
import { PrimaryButton } from './PrimaryButton';
import { AccessibleCard, CardHeader, CardContent } from './AccessibleCard';
import { HomeIcon, UsersIcon, SchoolIcon, SettingsIcon, CalendarIcon } from './Icons';
import { ResponsiveText, ResponsiveSpacing, isMobileDevice } from '../utils/responsive';

/**
 * Comprehensive demo of responsive mobile optimizations:
 * - Bottom navigation for mobile
 * - Single column layout on mobile
 * - Scrollable tabs horizontal on mobile
 * - Full-screen modal on mobile
 * - 10% smaller text sizes on mobile
 * - Touch-friendly 44px minimum spacing
 */
export default function ResponsiveDemo() {
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const screenSize = useScreenSize();

  const navItems = [
    { key: 'home', label: 'Trang chủ', icon: <HomeIcon size={24} color={activeNav === 'home' ? Colors.primary : Colors.textSecondary} /> },
    { key: 'classes', label: 'Lớp học', icon: <SchoolIcon size={24} color={activeNav === 'classes' ? Colors.primary : Colors.textSecondary} /> },
    { key: 'schedule', label: 'Lịch', icon: <CalendarIcon size={24} color={activeNav === 'schedule' ? Colors.primary : Colors.textSecondary} /> },
    { key: 'profile', label: 'Cá nhân', icon: <UsersIcon size={24} color={activeNav === 'profile' ? Colors.primary : Colors.textSecondary} /> },
  ];

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Từ chối' },
    { key: 'archived', label: 'Lưu trữ' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView style={{ flex: 1 }}>
        <ResponsiveContainer>
          {/* Header */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.display}>
              Responsive Mobile UI
            </Text>
            <Text style={{ ...ResponsiveText.body, color: Colors.textSecondary, marginTop: 8 }}>
              {screenSize.isMobile ? '📱 Mobile View' : screenSize.isTablet ? '📱 Tablet View' : '🖥️ Desktop View'}
              {' • '}
              {screenSize.width}px wide
            </Text>
          </View>

          {/* Device Info */}
          <AccessibleCard style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <CardHeader title="Device Information" />
            <CardContent>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '500' }}>Screen Width:</Text>
                  <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                    {screenSize.width}px
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '500' }}>Device Type:</Text>
                  <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                    {screenSize.isMobile ? 'Mobile' : screenSize.isTablet ? 'Tablet' : 'Desktop'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '500' }}>Text Scale:</Text>
                  <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                    {isMobileDevice() ? '90%' : '100%'} (10% smaller on mobile)
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '500' }}>Touch Target:</Text>
                  <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                    {ResponsiveSpacing.minTouchTarget}px minimum
                  </Text>
                </View>
              </View>
            </CardContent>
          </AccessibleCard>

          {/* Bottom Navigation Demo */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.h2}>
              1. Bottom Navigation
            </Text>
            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
              {screenSize.isMobile 
                ? '✓ Showing bottom navigation (scroll to bottom)' 
                : '✗ Hidden on desktop (width ≥ 768px)'}
            </Text>
            <View
              style={{
                backgroundColor: screenSize.isMobile ? Colors.success + '10' : Colors.gray100,
                padding: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: screenSize.isMobile ? Colors.success : Colors.border,
              }}
            >
              <Text style={{ ...ResponsiveText.bodySmall, color: Colors.text }}>
                {screenSize.isMobile 
                  ? '✓ Bottom navigation is visible and fixed at bottom' 
                  : 'ℹ️ Resize browser to <768px to see bottom navigation'}
              </Text>
            </View>
          </View>

          {/* Scrollable Tabs Demo */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.h2}>
              2. Scrollable Tabs
            </Text>
            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
              Horizontal scroll on mobile, full width on desktop
            </Text>
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 8,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <ScrollableTabs tabs={tabs} activeKey={activeTab} onTabPress={setActiveTab} />
              <View style={{ padding: 16 }}>
                <Text style={{ ...ResponsiveText.body, color: Colors.textSecondary }}>
                  Active: {tabs.find(t => t.key === activeTab)?.label}
                </Text>
              </View>
            </View>

            <Text style={{ ...ResponsiveText.h4, marginTop: 24, marginBottom: 12 }}>
              Pill Tabs Variant
            </Text>
            <PillTabs tabs={tabs.slice(0, 3)} activeKey={activeTab} onTabPress={setActiveTab} />
          </View>

          {/* Responsive Grid Demo */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.h2}>
              3. Responsive Grid
            </Text>
            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
              {screenSize.isMobile ? '1 column on mobile' : screenSize.isTablet ? '2 columns on tablet' : '3 columns on desktop'}
            </Text>
            <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap={16}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <AccessibleCard key={i}>
                  <View style={{ alignItems: 'center', padding: 12 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: Colors.primary + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <Text style={{ ...ResponsiveText.h3, color: Colors.primary }}>{i}</Text>
                    </View>
                    <Text style={{ ...ResponsiveText.bodySmall, fontWeight: '600' }}>
                      Card {i}
                    </Text>
                    <Text style={{ ...ResponsiveText.caption, color: Colors.textSecondary, marginTop: 4 }}>
                      Responsive grid item
                    </Text>
                  </View>
                </AccessibleCard>
              ))}
            </ResponsiveGrid>
          </View>

          {/* Responsive Stack Demo */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.h2}>
              4. Responsive Stack
            </Text>
            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
              {screenSize.isMobile ? 'Stacked vertically on mobile' : 'Horizontal layout on desktop'}
            </Text>
            <ResponsiveStack direction="row" gap={16}>
              <AccessibleCard style={{ flex: 1 }}>
                <CardContent>
                  <Text style={{ ...ResponsiveText.h4, marginBottom: 8 }}>Item 1</Text>
                  <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                    This item is {screenSize.isMobile ? 'stacked' : 'horizontal'}
                  </Text>
                </CardContent>
              </AccessibleCard>
              <AccessibleCard style={{ flex: 1 }}>
                <CardContent>
                  <Text style={{ ...ResponsiveText.h4, marginBottom: 8 }}>Item 2</Text>
                  <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
                    Adapts to screen size
                  </Text>
                </CardContent>
              </AccessibleCard>
            </ResponsiveStack>
          </View>

          {/* Modal Demo */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.h2}>
              5. Full-screen Modal on Mobile
            </Text>
            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
              {screenSize.isMobile 
                ? 'Modal will be full-screen on mobile' 
                : 'Modal will be centered with max-width on desktop'}
            </Text>
            <PrimaryButton title="Open Modal" onPress={() => setModalVisible(true)} />
          </View>

          {/* Text Size Demo */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.h2}>
              6. Responsive Text Sizes
            </Text>
            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
              All text is 10% smaller on mobile for better readability
            </Text>
            <AccessibleCard>
              <CardContent>
                <View style={{ gap: 16 }}>
                  <View>
                    <Text style={ResponsiveText.display}>Display</Text>
                    <Text style={{ ...ResponsiveText.caption, color: Colors.textSecondary }}>
                      {ResponsiveText.display.fontSize}px
                    </Text>
                  </View>
                  <View>
                    <Text style={ResponsiveText.h1}>Heading 1</Text>
                    <Text style={{ ...ResponsiveText.caption, color: Colors.textSecondary }}>
                      {ResponsiveText.h1.fontSize}px
                    </Text>
                  </View>
                  <View>
                    <Text style={ResponsiveText.h2}>Heading 2</Text>
                    <Text style={{ ...ResponsiveText.caption, color: Colors.textSecondary }}>
                      {ResponsiveText.h2.fontSize}px
                    </Text>
                  </View>
                  <View>
                    <Text style={ResponsiveText.body}>Body text - normal paragraph</Text>
                    <Text style={{ ...ResponsiveText.caption, color: Colors.textSecondary }}>
                      {ResponsiveText.body.fontSize}px
                    </Text>
                  </View>
                  <View>
                    <Text style={ResponsiveText.bodySmall}>Small body text</Text>
                    <Text style={{ ...ResponsiveText.caption, color: Colors.textSecondary }}>
                      {ResponsiveText.bodySmall.fontSize}px
                    </Text>
                  </View>
                </View>
              </CardContent>
            </AccessibleCard>
          </View>

          {/* Touch Targets Demo */}
          <View style={{ marginBottom: ResponsiveSpacing.sectionGap }}>
            <Text style={ResponsiveText.h2}>
              7. Touch-friendly Spacing
            </Text>
            <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary, marginTop: 8, marginBottom: 16 }}>
              All interactive elements have minimum {ResponsiveSpacing.minTouchTarget}px height
            </Text>
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 8,
                  minHeight: ResponsiveSpacing.minTouchTarget,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ ...ResponsiveText.button, color: Colors.white }}>
                  Touch-friendly Button (44px)
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  backgroundColor: Colors.gray100,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Text style={{ ...ResponsiveText.bodySmall }}>
                  Container padding: {ResponsiveSpacing.containerPadding}px
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, marginTop: 8 }}>
                  Element gap: {ResponsiveSpacing.elementGap}px
                </Text>
                <Text style={{ ...ResponsiveText.bodySmall, marginTop: 8 }}>
                  Section gap: {ResponsiveSpacing.sectionGap}px
                </Text>
              </View>
            </View>
          </View>

          {/* Spacer for bottom navigation */}
          <BottomNavigationSpacer height={screenSize.isMobile ? 80 : 0} />
        </ResponsiveContainer>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation items={navItems} activeKey={activeNav} onItemPress={setActiveNav} />

      {/* Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Responsive Modal"
        variant={screenSize.isMobile ? 'bottom' : 'center'}
      >
        <View style={{ paddingVertical: 12 }}>
          <Text style={{ ...ResponsiveText.body, marginBottom: 16 }}>
            {screenSize.isMobile 
              ? 'This modal is full-screen on mobile devices for better UX.' 
              : 'This modal is centered with max-width on desktop devices.'}
          </Text>
          <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
            Device: {screenSize.isMobile ? 'Mobile' : screenSize.isTablet ? 'Tablet' : 'Desktop'}
          </Text>
          <Text style={{ ...ResponsiveText.bodySmall, color: Colors.textSecondary }}>
            Width: {screenSize.width}px
          </Text>
          <View style={{ marginTop: 24 }}>
            <PrimaryButton title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
