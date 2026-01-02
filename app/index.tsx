import { Redirect } from 'expo-router';

export default function WelcomeScreen() {
  // Redirect to login for now - you can add a welcome screen later
  return <Redirect href="/auth/login" />;
}


// Updated: 2026-01-02 13:16:05
