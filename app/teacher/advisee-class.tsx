import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";
import { AppHeader } from "@/components/AppHeader";
import Card from "@/components/Card";
import { StatsCard } from "@/components/StatsCard";
import Tabs from "@/components/Tabs";
import { StudentCard } from "@/components/StudentCard";
import { mockStudents } from "@/constants/mockData";

export default function AdviseeClass() {
  const [activeTab, setActiveTab] = useState("overview");
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const statsWidth = isDesktop ? "48%" : "100%";

  const classStats = {
    totalStudents: 45,
    presentToday: 38,
    absentToday: 7,
    attendanceRate: 84.4,
    atRisk: 5,
  };

  const atRiskStudents = mockStudents.slice(0, 3).map((student, index) => ({
    ...student,
    absences: [5, 7, 6][index] || 5, // Mock data for absences
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <AppHeader title="Lớp chủ nhiệm" showBack showLogout={!isWeb} />

      <Tabs
        tabs={[
          { key: "overview", label: "Tổng quan" },
          { key: "students", label: "Danh sách SV" },
          { key: "at-risk", label: "Cảnh báo" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ScrollView className="flex-1">
        <View
          className="p-4"
          style={{ maxWidth: 1200, width: "100%", alignSelf: "center" }}
        >
          {activeTab === "overview" && (
            <>
              {/* Class Info */}
              <View
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: "#FFFFFF",
                    marginBottom: 4,
                  }}
                >
                  Lớp CNTT01
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#FFFFFF",
                    opacity: 0.9,
                  }}
                >
                  Công nghệ thông tin K15
                </Text>
              </View>

              {/* Stats Grid - 4 columns on desktop, 2 on mobile */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 16,
                    color: Colors.text,
                  }}
                >
                  Thống kê tổng quan
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginHorizontal: -6,
                  }}
                >
                  <View
                    style={{
                      width: isDesktop ? "25%" : "50%",
                      paddingHorizontal: 6,
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#F8F9FA",
                        borderRadius: 8,
                        padding: 16,
                        borderLeftWidth: 3,
                        borderLeftColor: "#6366F1",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 32,
                          fontWeight: "700",
                          color: "#6366F1",
                          marginBottom: 8,
                        }}
                      >
                        {classStats.totalStudents}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: Colors.textSecondary,
                          fontWeight: "500",
                        }}
                      >
                        Tổng sinh viên
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      width: isDesktop ? "25%" : "50%",
                      paddingHorizontal: 6,
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#F8F9FA",
                        borderRadius: 8,
                        padding: 16,
                        borderLeftWidth: 3,
                        borderLeftColor: "#10B981",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 32,
                          fontWeight: "700",
                          color: "#10B981",
                          marginBottom: 8,
                        }}
                      >
                        {classStats.attendanceRate}%
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: Colors.textSecondary,
                          fontWeight: "500",
                        }}
                      >
                        Tỷ lệ điểm danh
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      width: isDesktop ? "25%" : "50%",
                      paddingHorizontal: 6,
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#F8F9FA",
                        borderRadius: 8,
                        padding: 16,
                        borderLeftWidth: 3,
                        borderLeftColor: "#22C55E",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 32,
                          fontWeight: "700",
                          color: "#22C55E",
                          marginBottom: 8,
                        }}
                      >
                        {classStats.presentToday}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: Colors.textSecondary,
                          fontWeight: "500",
                        }}
                      >
                        Có mặt hôm nay
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      width: isDesktop ? "25%" : "50%",
                      paddingHorizontal: 6,
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#F8F9FA",
                        borderRadius: 8,
                        padding: 16,
                        borderLeftWidth: 3,
                        borderLeftColor: "#EF4444",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 32,
                          fontWeight: "700",
                          color: "#EF4444",
                          marginBottom: 8,
                        }}
                      >
                        {classStats.atRisk}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: Colors.textSecondary,
                          fontWeight: "500",
                        }}
                      >
                        Cần quan tâm
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* At-Risk Students Preview */}
              <Card
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.gray200,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: Colors.text,
                    }}
                  >
                    Sinh viên cần quan tâm
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActiveTab("at-risk")}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: Colors.primaryLight,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: Colors.primary,
                      }}
                    >
                      Xem tất cả →
                    </Text>
                  </TouchableOpacity>
                </View>

                {atRiskStudents.map((student, idx) => {
                  const totalSessions = 15;
                  const absenceRate = Math.round(
                    (student.absences / totalSessions) * 100
                  );
                  return (
                    <View
                      key={student.id}
                      style={{ marginBottom: idx === 2 ? 0 : 12 }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 14,
                          backgroundColor: "#FAFAFA",
                          borderRadius: 8,
                          borderLeftWidth: 3,
                          borderLeftColor: Colors.error,
                        }}
                      >
                        <View style={{ flex: 1, marginRight: 12 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 6,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: "600",
                                color: Colors.text,
                                flex: 1,
                              }}
                            >
                              {student.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "700",
                                color: Colors.error,
                                marginLeft: 8,
                              }}
                            >
                              {absenceRate}%
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 12,
                              color: Colors.textSecondary,
                              marginBottom: 8,
                            }}
                          >
                            {student.studentId}
                          </Text>

                          {/* Progress Bar */}
                          <View style={{ marginBottom: 4 }}>
                            <View
                              style={{
                                height: 4,
                                backgroundColor: "#E5E7EB",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <View
                                style={{
                                  height: "100%",
                                  width: `${absenceRate}%`,
                                  backgroundColor: Colors.error,
                                }}
                              />
                            </View>
                          </View>

                          <Text
                            style={{
                              fontSize: 11,
                              color: Colors.error,
                              fontWeight: "500",
                            }}
                          >
                            Vắng {student.absences}/{totalSessions} buổi
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </Card>

              {/* Multi-class Summary */}
              <Card
                style={{
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.gray200,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: Colors.text,
                    }}
                  >
                    Thống kê các môn học
                  </Text>
                </View>
                {[
                  {
                    subject: "Lập trình cơ bản",
                    rate: 92,
                    present: 41,
                    total: 45,
                    color: "#10B981",
                    bgColor: "#ECFDF5",
                  },
                  {
                    subject: "Cơ sở dữ liệu",
                    rate: 87,
                    present: 39,
                    total: 45,
                    color: "#3B82F6",
                    bgColor: "#EFF6FF",
                  },
                  {
                    subject: "Mạng máy tính",
                    rate: 78,
                    present: 35,
                    total: 45,
                    color: "#F59E0B",
                    bgColor: "#FEF3C7",
                  },
                ].map((item, index) => (
                  <View
                    key={index}
                    style={{
                      marginBottom: index === 2 ? 0 : 10,
                      backgroundColor: "#FAFAFA",
                      padding: 14,
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: item.color,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: Colors.text,
                        }}
                      >
                        {item.subject}
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: item.color,
                        }}
                      >
                        {item.rate}%
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: Colors.textSecondary,
                        fontWeight: "500",
                      }}
                    >
                      {item.present}/{item.total} sinh viên có mặt
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {activeTab === "students" && (
            <>
              <Text
                className="text-sm mb-3"
                style={{ color: Colors.textSecondary }}
              >
                {mockStudents.length} sinh viên
              </Text>

              {mockStudents.map((student) => (
                <View key={student.id} style={{ marginBottom: 12 }}>
                  <StudentCard
                    student={student}
                    onPress={() => alert(`Chi tiết ${student.name}`)}
                  />
                </View>
              ))}
            </>
          )}

          {activeTab === "at-risk" && (
            <>
              <Card
                style={{ marginBottom: 16, backgroundColor: Colors.errorLight }}
              >
                <Text
                  className="font-semibold mb-2"
                  style={{ color: Colors.error }}
                >
                  ⚠ Tiêu chí cảnh báo
                </Text>
                <Text className="text-sm" style={{ color: Colors.error }}>
                  Sinh viên vắng ≥20% tổng số buổi học
                </Text>
              </Card>

              <Text
                className="text-sm mb-3"
                style={{ color: Colors.textSecondary }}
              >
                {classStats.atRisk} sinh viên cần quan tâm
              </Text>

              {atRiskStudents.map((student, idx) => {
                const totalSessions = 15;
                const absenceRate = Math.round(
                  (student.absences / totalSessions) * 100
                );
                return (
                  <View
                    key={student.id}
                    style={{ marginBottom: idx === 2 ? 0 : 14 }}
                  >
                    <View
                      style={{
                        backgroundColor: Colors.white,
                        borderRadius: 8,
                        padding: 18,
                        borderLeftWidth: 4,
                        borderLeftColor:
                          absenceRate >= 40 ? Colors.error : "#F59E0B",
                      }}
                    >
                      {/* Header Section */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 14,
                        }}
                      >
                        <View style={{ flex: 1, marginRight: 12 }}>
                          <Text
                            style={{
                              fontSize: 17,
                              fontWeight: "600",
                              color: Colors.text,
                              marginBottom: 4,
                            }}
                          >
                            {student.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: Colors.textSecondary,
                            }}
                          >
                            MSSV: {student.studentId}
                          </Text>
                        </View>

                        <View
                          style={{
                            backgroundColor:
                              absenceRate >= 40 ? Colors.error : "#F59E0B",
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: Colors.white,
                            }}
                          >
                            {absenceRate}%
                          </Text>
                        </View>
                      </View>

                      {/* Stats Section */}
                      <View
                        style={{
                          backgroundColor: "#F9FAFB",
                          padding: 12,
                          borderRadius: 6,
                          marginBottom: 14,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "500",
                              color: Colors.text,
                            }}
                          >
                            Vắng: {student.absences}/{totalSessions} buổi
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: Colors.textSecondary,
                            }}
                          >
                            Còn lại: {totalSessions - student.absences}
                          </Text>
                        </View>

                        {/* Progress Bar */}
                        <View
                          style={{
                            height: 6,
                            backgroundColor: "#E5E7EB",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${absenceRate}%`,
                              backgroundColor:
                                absenceRate >= 40 ? Colors.error : "#F59E0B",
                            }}
                          />
                        </View>
                      </View>

                      {/* Warning Message */}
                      {absenceRate >= 40 && (
                        <View
                          style={{
                            backgroundColor: "#FEE2E2",
                            padding: 10,
                            borderRadius: 6,
                            marginBottom: 14,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color: Colors.error,
                            }}
                          >
                            Nguy cơ cao - Cần can thiệp ngay
                          </Text>
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: Colors.primary,
                            paddingVertical: 11,
                            borderRadius: 6,
                            alignItems: "center",
                          }}
                          onPress={() =>
                            alert(`Gửi thông báo cho ${student.name}`)
                          }
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: Colors.white,
                            }}
                          >
                            Gửi thông báo
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 11,
                            borderRadius: 6,
                            borderWidth: 1.5,
                            borderColor: Colors.border,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onPress={() => alert(`Xem chi tiết ${student.name}`)}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: Colors.text,
                            }}
                          >
                            Chi tiết
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
