import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Colors } from "../../constants/colors";
import ProfileAndSettings from "@/components/ProfileAndSettings";
import Toast, { useToast } from "@/components/Toast";
import { authService } from "@/apis/services/auth.service";

export default function Settings() {
  const { showToast } = useToast();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tokenUser = await authService.getCurrentUser();
        if (tokenUser) setUserInfo(tokenUser);
      } catch (error) {
        console.error("Failed to load user info:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View style={{ maxWidth: 800, width: "100%", alignSelf: "center" }}>
          <ProfileAndSettings user={userInfo} onShowToast={showToast} />
        </View>
      </ScrollView>
    </View>
  );
}
