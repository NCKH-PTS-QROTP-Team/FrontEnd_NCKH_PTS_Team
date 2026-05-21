import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getRoleFromToken } from '@/apis/utils/jwt';
import { Spinner } from '@/components/Spinner';

export default function WelcomeScreen() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const role = await getRoleFromToken();
        if (role) {
          // Auto login routing based on role
          const route = role === "STUDENT" ? "/student/home" 
                      : role === "TEACHER" ? "/teacher/dashboard" 
                      : role === "DEPARTMENT" ? "/department/dashboard" 
                      : "/admin/dashboard";
          
          router.replace(route as any);
        } else {
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("Auto login failed:", error);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  // Show a spinner while checking token
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <Spinner size={48} color="#3b82f6" />
      </View>
    );
  }

  return null;
}
