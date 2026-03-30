import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import { SchoolIcon, UserGroupIcon } from "@/components/Icons";
import { Ionicons } from "@expo/vector-icons";

export default function ImportDataScreen() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const importOptions = [
    {
      id: "classes",
      title: "Import lớp học",
      description: "Tải lên file Excel chứa thông tin các lớp học",
      icon: <SchoolIcon size={32} color="#0891b2" />,
    },
    {
      id: "students",
      title: "Import sinh viên",
      description: "Tải lên file Excel chứa thông tin sinh viên",
      icon: <UserGroupIcon size={32} color="#0891b2" />,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { padding: 0 }]}
      contentContainerStyle={[styles.contentContainer, { padding: 0 }]}
    >
      <LinearGradient
        colors={["#1E3A8A", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 64,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          zIndex: 10,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#fff" }}>
              Import dữ liệu
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                marginTop: 4,
              }}
            >
              Chọn loại dữ liệu bạn muốn import từ Excel
            </Text>
          </View>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="cloud-upload" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.optionsContainer, { paddingHorizontal: 16 }]}>
        {importOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => {
                setSelectedOption(option.id);
                setIsModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>{option.icon}</View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDesc}>{option.description}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.guidanceBox}>
        <Text style={styles.guideTitle}>Lưu ý khi import</Text>
        <View style={styles.guideContent}>
          <Text style={styles.guideItem}>
            • File Excel phải đúng định dạng (.xlsx hoặc .xls)
          </Text>
          <Text style={styles.guideItem}>
            • Dòng đầu tiên là header, các dòng tiếp theo là dữ liệu
          </Text>
          <Text style={styles.guideItem}>
            • Kiểm tra kỹ dữ liệu trước khi import để tránh lỗi
          </Text>
          <Text style={styles.guideItem}>
            • Hệ thống sẽ báo cáo chi tiết các dòng lỗi sau khi import
          </Text>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedOption === "classes"
                  ? "Import lớp học"
                  : "Import sinh viên"}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.uploadArea}>
              <Ionicons name="cloud-upload-outline" size={48} color="#0891b2" />
              <Text style={styles.uploadText}>
                Nhấn để chọn file hoặc kéo thả file vào đây
              </Text>
              <Text style={styles.uploadSubtext}>
                Chỉ hỗ trợ file .xlsx, .xls
              </Text>

              <TouchableOpacity style={styles.selectFileBtn}>
                <Text style={styles.selectFileBtnText}>Chọn file</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.importBtn}>
                <Text style={styles.importBtnText}>Tiến hành Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 32,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }),
  },
  optionCardSelected: {
    borderColor: "#0891b2",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: "#64748b",
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0891b2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  guidanceBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1d4ed8",
    marginBottom: 16,
  },
  guideContent: {
    gap: 12,
  },
  guideItem: {
    fontSize: 14,
    color: "#1e3a8a",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    marginBottom: 24,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  uploadSubtext: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 20,
  },
  selectFileBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0891b2",
  },
  selectFileBtnText: {
    color: "#0891b2",
    fontWeight: "600",
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  cancelBtnText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 15,
  },
  importBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#0891b2",
  },
  importBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
