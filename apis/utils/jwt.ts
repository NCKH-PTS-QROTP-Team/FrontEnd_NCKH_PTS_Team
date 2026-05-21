import apiClient, { getAuthToken, getCurrentUserProfile, setCurrentUserProfile } from '../config/apiClient';

/**
 * Decode JWT token payload (không verify signature)
 * Chỉ dùng để lấy claims từ token
 * Hỗ trợ cả JWT thật (3 parts) và mock token (base64 JSON)
 */
export function decodeJWT(token: string): any {
  try {
    // JWT format: header.payload.signature (3 parts)
    const parts = token.split('.');
    
    if (parts.length === 3) {
      // JWT thật: decode payload (part 2)
      const payload = parts[1];
      
      // Base64url decode
      // Replace URL-safe characters
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if needed
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      
      // Decode
      const decoded = atob(padded);
      
      return JSON.parse(decoded);
    } else {
      // Mock token (base64 JSON) - fallback cho testing
      try {
        const decoded = atob(token);
        return JSON.parse(decoded);
      } catch {
        // Nếu không phải base64, thử parse trực tiếp
        return JSON.parse(token);
      }
    }
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Lấy studentId từ JWT token hiện tại
 */
export async function getStudentIdFromToken(): Promise<string | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('❌ No token found in storage');
      return null;
    }

    console.log('🔑 Token found:', token.substring(0, 50) + '...');
    
    const decoded = decodeJWT(token);
    console.log('📋 Decoded token:', decoded);
    
    if (!decoded) {
      console.log('❌ Failed to decode token');
      return null;
    }
    
    let studentId = decoded?.studentId || null;
    
    // Fallback 1: Lấy từ profile cache trong SecureStore/localStorage
    if (!studentId) {
      const profile = await getCurrentUserProfile();
      studentId = profile?.studentId || null;
      if (studentId) {
        console.log('✅ Found studentId in cached profile:', studentId);
      }
    }
    
    // Fallback 2: Gọi API /users/me để lấy trực tiếp từ DB của server và cache lại
    if (!studentId) {
      try {
        console.log('🔄 studentId not in token/profile, fetching /users/me...');
        const response = await apiClient.get('/users/me');
        const user = response.data?.data;
        if (user && user.studentId) {
          studentId = user.studentId;
          console.log('✅ Found studentId from /users/me:', studentId);
          const profile = await getCurrentUserProfile() || {};
          await setCurrentUserProfile({
            ...profile,
            studentId: user.studentId,
            teacherId: user.teacherId,
            classId: user.classId,
          });
        } else {
          console.log('❌ No studentId found in /users/me response');
        }
      } catch (e) {
        console.error('Error fetching user for studentId fallback:', e);
      }
    }
    
    return studentId;
  } catch (error) {
    console.error('❌ Error getting studentId from token:', error);
    return null;
  }
}

/**
 * Lấy userId từ JWT token hiện tại
 */
export async function getUserIdFromToken(): Promise<string | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    const decoded = decodeJWT(token);
    return decoded?.userId || null;
  } catch (error) {
    console.error('Error getting userId from token:', error);
    return null;
  }
}

/**
 * Lấy role từ JWT token hiện tại
 */
export async function getRoleFromToken(): Promise<string | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    const decoded = decodeJWT(token);
    return decoded?.role || null;
  } catch (error) {
    console.error('Error getting role from token:', error);
    return null;
  }
}

/**
 * Lấy teacherId từ JWT token hiện tại
 */
export async function getTeacherIdFromToken(): Promise<string | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    const decoded = decodeJWT(token);
    let teacherId = decoded?.teacherId || null;
    
    // Fallback 1: Lấy từ profile cache trong SecureStore/localStorage
    if (!teacherId) {
      const profile = await getCurrentUserProfile();
      teacherId = profile?.teacherId || null;
    }
    
    // Fallback 2: Gọi API /users/me để lấy trực tiếp từ DB của server và cache lại
    if (!teacherId) {
      try {
        console.log('🔄 teacherId not in token/profile, fetching /users/me...');
        const response = await apiClient.get('/users/me');
        const user = response.data?.data;
        if (user && user.teacherId) {
          teacherId = user.teacherId;
          console.log('✅ Found teacherId from /users/me:', teacherId);
          const profile = await getCurrentUserProfile() || {};
          await setCurrentUserProfile({
            ...profile,
            studentId: user.studentId,
            teacherId: user.teacherId,
            classId: user.classId,
          });
        }
      } catch (e) {
        console.error('Error fetching user for teacherId fallback:', e);
      }
    }
    
    return teacherId;
  } catch (error) {
    console.error('Error getting teacherId from token:', error);
    return null;
  }
}

