import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import PrimaryButton from "@/components/PrimaryButton";
import DataTable from "@/components/DataTable";
import {
  EmptyUsersIcon,
  EmptySearchIcon,
} from "@/components/EmptyStateIllustration";
import { SkeletonCard } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/components/ToastProvider";
import { userService, User } from "@/apis/services/user.service";
import { UserRole } from "@/apis/types/auth.types";

type RoleFilterKey = "all" | UserRole;

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleFilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;
  const showTable = isDesktop || isTablet;
  const contentMaxWidth = isDesktop ? 1200 : "100%";
  const paddingHorizontal = isDesktop ? 24 : isTablet ? 20 : 16;
  const paddingVertical = isMobile ? 16 : 24;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi tải danh sách người dùng";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roleMap = {
      ADMIN: { label: "Admin", variant: "error" as const },
      TEACHER: { label: "Giảng viên", variant: "primary" as const },
      STUDENT: { label: "Sinh viên", variant: "success" as const },
      ACADEMIC_STAFF: { label: "Giáo vụ", variant: "warning" as const },
    };
    return (
      roleMap[role as keyof typeof roleMap] || {
        label: role,
        variant: "gray" as const,
      }
    );
  };

  const roleFilters: { key: RoleFilterKey; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: UserRole.ADMIN, label: "Admin" },
    { key: UserRole.TEACHER, label: "Giảng viên" },
    { key: UserRole.STUDENT, label: "Sinh viên" },
    { key: UserRole.ACADEMIC_STAFF, label: "Giáo vụ" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal,
            paddingVertical,
            maxWidth: contentMaxWidth,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Page Title */}
          <Text
            style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: "600",
              marginBottom: isMobile ? 16 : 24,
              color: Colors.text,
            }}
          >
            Quản lý người dùng
          </Text>

          {/* Actions */}
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <PrimaryButton
              title="+ Thêm người dùng"
              onPress={() => router.push("/admin/users/create" as any)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <PrimaryButton
              title="↻ Tải lại"
              variant="outline"
              onPress={loadUsers}
              style={{ flex: 1 }}
            />
          </View>

          {/* Search */}
          <TextInput
            style={{
              height: 48,
              borderWidth: 2,
              borderColor: Colors.gray200,
              borderRadius: 8,
              paddingHorizontal: 16,
              marginBottom: 16,
              color: Colors.text,
              lineHeight: 24,
              ...Platform.select({
                web: { outlineStyle: "none" as any },
              }),
            }}
            placeholder="Tìm kiếm theo tên, email..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Role Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            <View style={{ flexDirection: "row" }}>
              {roleFilters.map((role) => (
                <TouchableOpacity
                  key={role.key}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor:
                      selectedRole === role.key
                        ? Colors.primary
                        : Colors.gray100,
                  }}
                  onPress={() => setSelectedRole(role.key)}
                >
                  <Text
                    style={{
                      fontWeight: "500",
                      fontSize: 14,
                      color:
                        selectedRole === role.key
                          ? Colors.white
                          : Colors.gray700,
                    }}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Loading State */}
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Error State */}
          {!loading && error && (
            <ErrorState
              title="Không thể tải dữ liệu người dùng"
              message={error}
              onRetry={loadUsers}
            />
          )}

          {/* User List */}
          {!loading && !error && filteredUsers.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 12,
                  color: Colors.textSecondary,
                }}
              >
                {filteredUsers.length} người dùng
              </Text>

              {/* Desktop: Table View */}
              {showTable ? (
                <DataTable
                  columns={[
                    {
                      key: "avatar",
                      label: "",
                      width: 60,
                      align: "center",
                      render: (user: User) => (
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: Colors.gray100,
                            alignSelf: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: Colors.primary,
                            }}
                          >
                            {user.name.charAt(0)}
                          </Text>
                        </View>
                      ),
                    },
                    {
                      key: "name",
                      label: "Họ và tên",
                      width: 200,
                      render: (user: User) => (
                        <Text
                          style={{
                            fontWeight: "600",
                            color: Colors.text,
                            fontSize: 14,
                          }}
                        >
                          {user.name}
                        </Text>
                      ),
                    },
                    {
                      key: "email",
                      label: "Email",
                      width: 250,
                      render: (user: User) => (
                        <Text
                          style={{ fontSize: 14, color: Colors.textSecondary }}
                        >
                          {user.email}
                        </Text>
                      ),
                    },
                    {
                      key: "role",
                      label: "Vai trò",
                      width: 140,
                      render: (user: User) => {
                        const badgeData = getRoleBadge(user.role);
                        return (
                          <Badge variant={badgeData.variant} size="small">
                            {badgeData.label}
                          </Badge>
                        );
                      },
                    },
                    {
                      key: "id",
                      label: "Mã",
                      width: 120,
                      render: (user: User) => (
                        <Text
                          style={{ fontSize: 14, color: Colors.textSecondary }}
                        >
                          {user.studentId || user.teacherId || "-"}
                        </Text>
                      ),
                    },
                    {
                      key: "status",
                      label: "Trạng thái",
                      width: 120,
                      align: "center",
                      render: (user: User) => (
                        <View style={{ alignItems: "center" }}>
                          {!user.isActive && (
                            <Badge variant="neutral" size="small">
                              Vô hiệu
                            </Badge>
                          )}
                          {user.isActive && (
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: Colors.success,
                              }}
                            />
                          )}
                        </View>
                      ),
                    },
                  ]}
                  data={filteredUsers}
                  onRowPress={(user: User) =>
                    router.push(`/admin/users/${user.id}` as any)
                  }
                  zebraStriping={true}
                  stickyHeader={true}
                />
              ) : (
                /* Mobile: Card View */
                <>
                  {filteredUsers.map((user) => {
                    const badgeData = getRoleBadge(user.role);
                    return (
                      <Card
                        key={user.id}
                        onPress={() =>
                          router.push(`/admin/users/${user.id}` as any)
                        }
                        style={{ marginBottom: 8 }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              flex: 1,
                            }}
                          >
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 12,
                                backgroundColor: Colors.gray100,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  color: Colors.primary,
                                }}
                              >
                                {user.name.charAt(0)}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontWeight: "600",
                                  color: Colors.text,
                                  fontSize: 14,
                                  marginBottom: 4,
                                }}
                              >
                                {user.name}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: Colors.textSecondary,
                                  marginBottom: 4,
                                }}
                              >
                                {user.email}
                              </Text>
                              <Badge variant={badgeData.variant} size="small">
                                {badgeData.label}
                              </Badge>
                            </View>
                          </View>
                          <Text style={{ fontSize: 24, color: Colors.gray300 }}>
                            ›
                          </Text>
                        </View>
                      </Card>
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && filteredUsers.length === 0 && (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: Colors.gray200,
                borderRadius: 8,
                padding: 48,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              {searchQuery ? (
                <>
                  <EmptySearchIcon size={80} color={Colors.gray300} />
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "600",
                      marginBottom: 8,
                      marginTop: 16,
                      color: Colors.text,
                      lineHeight: 32,
                      textAlign: "center",
                    }}
                  >
                    Không tìm thấy kết quả
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: Colors.textSecondary,
                      lineHeight: 24,
                      textAlign: "center",
                      maxWidth: 400,
                    }}
                  >
                    Không tìm thấy người dùng nào phù hợp với "{searchQuery}".
                    Thử tìm kiếm với từ khóa khác.
                  </Text>
                </>
              ) : (
                <>
                  <EmptyUsersIcon size={80} color={Colors.gray300} />
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "600",
                      marginBottom: 8,
                      marginTop: 16,
                      color: Colors.text,
                      lineHeight: 32,
                      textAlign: "center",
                    }}
                  >
                    Chưa có người dùng
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 16,
                      color: Colors.textSecondary,
                      lineHeight: 24,
                      textAlign: "center",
                      maxWidth: 400,
                    }}
                  >
                    Bắt đầu bằng cách thêm người dùng mới vào hệ thống.
                  </Text>
                  <PrimaryButton
                    title="+ Thêm người dùng"
                    onPress={() =>
                      router.push("/admin/users/create" as any)
                    }
                  />
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
